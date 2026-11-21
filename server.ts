import dns from 'node:dns';
import { randomUUID } from 'node:crypto';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import mammoth from 'mammoth';
import { apiManager } from './src/lib/ApiManager';
import { DifficultyOrchestrator } from './src/lib/DifficultyOrchestrator';

dns.setDefaultResultOrder('ipv4first');

const aiClientCache = new Map<string, GoogleGenAI>();
function getCachedAiClient(apiKey: string): GoogleGenAI {
  let client = aiClientCache.get(apiKey);
  if (!client) {
    client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    if (aiClientCache.size > 16) aiClientCache.clear();
    aiClientCache.set(apiKey, client);
  }
  return client;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const MAX_RATE_MAP_SIZE = 5000;
const ipRateMap = new Map<string, { count: number; resetAt: number }>();
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeString(input: string): string {
  return input
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

function sanitizePayload(value: any, skipKeys = new Set(['base64Data'])): any {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item, skipKeys));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (DANGEROUS_KEYS.has(k)) {
        continue;
      }
      if (skipKeys.has(k)) {
        out[k] = v;
      } else {
        out[k] = sanitizePayload(v, skipKeys);
      }
    }
    return out;
  }
  return value;
}

async function generateContentWithRetry(options: any, timeoutMs = 20000) {
  let attempts = 0;
  const maxRetries = Math.max(3, Math.min(6, apiManager.getKeysLength() * 2 + 1));

  const primaryModel = options.model || 'gemini-4-hydrogen';
  const fallbackModel =
    primaryModel === 'gemini-3.1-flash-lite'
      ? 'gemini-4-hydrogen'
      : 'gemini-3.1-flash-lite';
  const modelsToTry = [primaryModel, fallbackModel];

  while (attempts < maxRetries) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) throw new Error('Missing API Key');
      const ai = getCachedAiClient(apiKey);

      const currentModel = modelsToTry[attempts % modelsToTry.length];
      const controller = new AbortController();
      const currentConfig = options.config ? { ...options.config } : {};
      if (
        currentModel === 'gemini-4-hydrogen' &&
        currentConfig?.thinkingConfig?.thinkingLevel === ThinkingLevel.MINIMAL
      ) {
        currentConfig.thinkingConfig = {
          ...currentConfig.thinkingConfig,
          thinkingLevel: ThinkingLevel.LOW,
        };
      }
      currentConfig.abortSignal = controller.signal;

      const currentOptions = {
        ...options,
        model: currentModel,
        config: currentConfig,
      };

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error('Request timeout'));
        }, timeoutMs);
      });

      const res = (await Promise.race([
        ai.models.generateContent(currentOptions),
        timeoutPromise,
      ])) as any;
      if (timeoutId) clearTimeout(timeoutId);
      if (res && typeof res === 'object') {
        res._attemptIndex = attempts;
        res._modelUsed = currentModel;
      }
      return res;
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      const errString =
        String(error) +
        ' ' +
        JSON.stringify(error, Object.getOwnPropertyNames(error));
      attempts++;

      if (attempts >= maxRetries || apiManager.getKeysLength() === 0) {
        throw error;
      }

      if (
        errString.includes('API_KEY_INVALID') ||
        errString.includes('403')
      ) {
        apiManager.removeCurrentKey();
        continue;
      } else if (
        errString.includes('404') ||
        errString.includes('NOT_FOUND') ||
        errString.includes('Request timeout')
      ) {
        continue;
      } else if (
        errString.includes('429') ||
        errString.includes('Quota') ||
        errString.includes('ResourceExhausted') ||
        errString.includes('Too Many Requests') ||
        errString.includes('503')
      ) {
        // When only one key is configured and quota is exhausted, fail fast instead of burning retries
        if (
          apiManager.getKeysLength() <= 1 &&
          (errString.includes('Quota') || errString.includes('ResourceExhausted'))
        ) {
          throw error;
        }
        apiManager.nextKey();
        await new Promise((r) => setTimeout(r, 800));
      } else {
        apiManager.nextKey();
      }
    }
  }
  throw new Error('Failed after retries');
}

function safeJsonParse(raw: string, fallback: any) {
  try {
    const jsonMatch =
      raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || raw.match(/{[\s\S]*}/);
    const jsonText = jsonMatch
      ? Array.isArray(jsonMatch) && jsonMatch[1]
        ? jsonMatch[1]
        : jsonMatch[0]
      : raw;
    return JSON.parse(jsonText);
  } catch {
    return fallback;
  }
}

function formatResumeContext(resumeProfile: any): string {
  if (!resumeProfile) return '';
  const projectsStr = (resumeProfile.projects || [])
    .slice(0, 4)
    .map(
      (p: any) =>
        `- ${p.name} [${(p.techStack || []).join(', ')}]: ${p.highlights}`
    )
    .join('\n');
  const expStr = (resumeProfile.experience || [])
    .slice(0, 4)
    .map(
      (e: any) =>
        `- ${e.role} at ${e.company} (${e.duration}): ${e.impact}`
    )
    .join('\n');
  return `
CANDIDATE RESUME CONTEXT (EPHEMERAL SESSION ONLY):
Name: ${resumeProfile.candidateName || 'Candidate'}
Headline: ${resumeProfile.headline || 'N/A'}
Experience Summary: ${resumeProfile.rawSummary || 'N/A'}
Core Skills: ${(resumeProfile.skills || []).slice(0, 20).join(', ')}
Key Projects:
${projectsStr || 'None listed'}
Work History:
${expStr || 'None listed'}
Tailored Probe Angles: ${(resumeProfile.tailoredAngles || []).join(' | ')}
`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Production HTTPS / TLS enforcement behind reverse proxy
  app.use((req, res, next) => {
    if (
      process.env.NODE_ENV === 'production' &&
      req.headers['x-forwarded-proto'] === 'http'
    ) {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
  });

  // Strict HTTP & TLS Security Headers
  app.use((_req, res, next) => {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Permissions-Policy',
      'camera=(self), microphone=(self), geolocation=(), payment=()'
    );
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob:",
        "media-src 'self' blob:",
        "connect-src 'self' ws: wss: https:",
        "object-src 'none'",
        "base-uri 'self'",
      ].join('; ')
    );
    next();
  });

  app.use(express.json({ limit: '15mb' }));

  // No-Store Cache Policy + Sliding-Window Rate Limiter + Input Sanitization on /api/*
  app.use('/api', (req, res, next) => {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private'
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    if (ipRateMap.size >= MAX_RATE_MAP_SIZE) {
      for (const [key, val] of ipRateMap.entries()) {
        if (now > val.resetAt) ipRateMap.delete(key);
      }
      if (ipRateMap.size >= MAX_RATE_MAP_SIZE) {
        const oldestKey = ipRateMap.keys().next().value;
        if (oldestKey) ipRateMap.delete(oldestKey);
      }
    }
    let entry = ipRateMap.get(ip);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
      ipRateMap.set(ip, entry);
    }
    entry.count++;

    const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
    res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait before sending more requests.',
      });
    }

    if (req.body && typeof req.body === 'object') {
      req.body = sanitizePayload(req.body);
    }

    next();
  });

  // Live Security & Encryption Diagnostics Endpoint
  app.get('/api/security-status', (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const entry = ipRateMap.get(ip);
    const remaining = entry
      ? Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count)
      : RATE_LIMIT_MAX_REQUESTS;

    res.json({
      tlsEncrypted:
        Boolean(req.secure) || req.headers['x-forwarded-proto'] === 'https',
      hstsEnabled: true,
      cspEnabled: true,
      noStoreApiCache: true,
      zeroRetentionResumeProcessing: true,
      inputSanitizationActive: true,
      geminiServerProxied: true,
      rateLimit: {
        limit: RATE_LIMIT_MAX_REQUESTS,
        remaining,
        windowSeconds: RATE_LIMIT_WINDOW_MS / 1000,
      },
      headersActive: [
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'X-Content-Type-Options: nosniff',
        'Referrer-Policy: no-referrer',
        'Permissions-Policy',
        'Cache-Control: no-store',
      ],
      checkedAt: new Date().toISOString(),
    });
  });

  // Ephemeral Zero-Retention Resume Parser (never saved to disk or logged)
  app.post('/api/parse-resume', async (req, res) => {
    let buffer: Buffer | null = null;
    let extractedText = '';
    try {
      const { fileName, mimeType, base64Data, textContent } = req.body;
      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.status(500).json({
          error:
            'Gemini API key is missing in server configuration. Please configure GEMINI_API_KEY.',
        });
      }

      extractedText = (textContent || '').trim();
      const lowerName = (fileName || '').toLowerCase();

      if (!extractedText && base64Data) {
        if (typeof base64Data !== 'string' || base64Data.length > 14_000_000) {
          return res.status(400).json({ error: 'Invalid or oversized file payload.' });
        }
        buffer = Buffer.from(base64Data, 'base64');
        if (buffer.byteLength > 10 * 1024 * 1024) {
          return res.status(400).json({ error: 'Resume exceeds 10 MB limit.' });
        }
        if (
          lowerName.endsWith('.docx') ||
          mimeType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          const result = await mammoth.extractRawText({ buffer });
          extractedText = sanitizeString(result.value || '');
        } else if (
          lowerName.endsWith('.txt') ||
          mimeType?.startsWith('text/')
        ) {
          extractedText = sanitizeString(buffer.toString('utf-8'));
        }
      }

      const extractionPrompt = `You are an expert technical recruiter and engineering hiring manager.
Analyze the candidate's resume thoroughly and extract structured, concrete details that a real interviewer would probe in the opening and technical rounds.
Focus on real projects, specific technologies, architectural claims, metrics, and potential follow-up hooks.
Generate 4 specific "tailoredAngles" representing sharp, realistic interview questions derived directly from this resume.`;

      const isPdf =
        lowerName.endsWith('.pdf') || mimeType === 'application/pdf';

      let contents: any;
      if (isPdf && base64Data && !extractedText) {
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data,
              },
            },
            { text: extractionPrompt },
          ],
        };
      } else if (extractedText) {
        contents = `${extractionPrompt}\n\nRESUME TEXT (${fileName || 'resume'}):\n${extractedText.slice(0, 30000)}`;
      } else {
        return res.status(400).json({
          error:
            'Could not read resume content. Please upload a valid PDF, DOCX, or TXT file.',
        });
      }

      const response = await generateContentWithRetry({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              candidateName: { type: Type.STRING },
              headline: { type: Type.STRING },
              yearsExperience: { type: Type.NUMBER },
              rawSummary: { type: Type.STRING },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    techStack: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    highlights: { type: Type.STRING },
                  },
                },
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    impact: { type: Type.STRING },
                  },
                },
              },
              tailoredAngles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const parsed = safeJsonParse(response?.text || '{}', null);
      if (!parsed || (!parsed.skills?.length && !parsed.rawSummary)) {
        return res.status(422).json({
          error:
            'Resume parsed with insufficient text. Please ensure the file is not an empty or corrupted scan.',
        });
      }

      res.json({
        profile: {
          id: randomUUID().replace(/-/g, '').slice(0, 12),
          fileName: fileName || 'resume',
          uploadedAt: new Date().toISOString(),
          candidateName: parsed.candidateName || 'Candidate',
          headline: parsed.headline || 'Software Candidate',
          yearsExperience:
            typeof parsed.yearsExperience === 'number'
              ? parsed.yearsExperience
              : 2,
          skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 24) : [],
          projects: Array.isArray(parsed.projects)
            ? parsed.projects.slice(0, 6)
            : [],
          experience: Array.isArray(parsed.experience)
            ? parsed.experience.slice(0, 6)
            : [],
          tailoredAngles: Array.isArray(parsed.tailoredAngles)
            ? parsed.tailoredAngles.slice(0, 5)
            : [],
          rawSummary: parsed.rawSummary || '',
        },
      });
    } catch (error: any) {
      console.warn('Resume parse error:', error?.message || 'Processing failed');
      res.status(500).json({
        error:
          error?.message ||
          'Failed to analyze resume. Please try another PDF, DOCX, or TXT file.',
      });
    } finally {
      // Zero out ephemeral resume buffer and extracted text immediately
      if (buffer) {
        buffer.fill(0);
        buffer = null;
      }
      extractedText = '';
      if (req.body) {
        req.body.base64Data = '';
        req.body.textContent = '';
      }
    }
  });

  // Adaptive Resume-Grounded Live Interview Turn
  app.post('/api/interact', async (req, res) => {
    try {
      const {
        company,
        role,
        type = 'Technical',
        difficulty = 'Medium',
        experience = 3,
        resumeProfile,
        startWithResume = true,
        strictMode = false,
        focusTopics = '',
        history = [],
      } = req.body;

      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.json({
          text: 'The Gemini API key is missing from server configuration. Please add GEMINI_API_KEY in Settings > Secrets to continue.',
        });
      }

      const hasResume = Boolean(resumeProfile);
      const resumeBlock = formatResumeContext(resumeProfile);
      const turnNumber =
        history.filter((m: any) => m.role === 'interviewer').length + 1;

      const plan = DifficultyOrchestrator.orchestrate({
        company,
        role,
        experienceYears: Number(experience) || 0,
        roundType: type,
        userDifficulty: difficulty,
        strictMode: Boolean(strictMode),
        focusTopics,
        hasResume,
        startWithResume: startWithResume !== false,
        turnNumber,
        resumeSummaryBlock: resumeBlock,
        history: Array.isArray(history) ? history : [],
      });

      let conversationContents = 'Conversation transcript:\n';

      if (history && history.length > 0) {
        history.forEach((msg: any) => {
          conversationContents += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.text}\n`;
        });
      } else {
        conversationContents +=
          hasResume && startWithResume
            ? `(Turn 1 Opening for Tier ${plan.tier}/10 at ${plan.playbook.company}: greet the candidate briefly by name if available, reference one specific project or role from their resume, and ask a calibrated Tier ${plan.tier}/10 opening question for ${plan.calibration.yearsDisplay}.)\n`
            : `(Turn 1 Opening for Tier ${plan.tier}/10 at ${plan.playbook.company}: briefly introduce yourself as a ${plan.playbook.company} ${type} interviewer and ask ONE opening question strictly matching Tier ${plan.tier}/10 for ${plan.calibration.yearsDisplay}.)\n`;
      }

      conversationContents += '\nInterviewer:';

      const startedAt = Date.now();
      const response = await generateContentWithRetry(
        {
          model: 'gemini-3.1-flash-lite',
          contents: conversationContents,
          config: {
            systemInstruction: plan.systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        },
        10000
      );

      if (!response?.text) {
        throw new Error('Empty response from AI');
      }

      res.setHeader('X-Base-Tier', String(plan.baseTier));
      res.setHeader('X-Difficulty-Tier', String(plan.tier));
      res.setHeader('X-Difficulty-Shift', plan.tierShift);
      res.setHeader(
        'Server-Timing',
        `ai;dur=${Date.now() - startedAt};desc="${response._modelUsed || 'gemini'}-try${(response._attemptIndex ?? 0) + 1}"`
      );
      res.json({
        text: response.text.trim(),
        baseTier: plan.baseTier,
        difficultyTier: plan.tier,
        adaptiveDelta: plan.adaptiveDelta,
        tierShift: plan.tierShift,
        adaptiveReason: plan.adaptiveReason,
        tierLabel: plan.tierLabel,
      });
    } catch (error: any) {
      console.warn('Error getting interaction:', error?.message || 'Error');
      let fallbackText =
        "I'm having a technical issue processing that. Could you please repeat or rephrase your answer?";
      let quotaExceeded = false;

      const errString =
        String(error) +
        ' ' +
        JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (
        errString.includes('429') ||
        errString.includes('Quota') ||
        errString.includes('ResourceExhausted')
      ) {
        apiManager.nextKey();
        quotaExceeded = true;
        fallbackText =
          'Our AI system is handling high load right now. Please wait a moment and submit your response again.';
      } else if (
        errString.includes('403') ||
        errString.includes('API_KEY_INVALID')
      ) {
        fallbackText =
          'There is an issue with the Gemini API Key. Please check your configuration.';
      }

      res.status(quotaExceeded ? 429 : 200).json({
        error: true,
        quotaExceeded,
        text: fallbackText,
      });
    }
  });

  // Simulate specific questions calibrated to company playbook, role, experience (0-25+), and difficulty
  app.post('/api/simulate-questions', async (req, res) => {
    try {
      const {
        company,
        role,
        experience = 3,
        difficulty = 'Medium',
        resumeProfile,
      } = req.body;
      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.status(500).json({ error: 'Missing Gemini API Key.' });
      }

      const plan = DifficultyOrchestrator.orchestrate({
        company,
        role,
        experienceYears: Number(experience) || 0,
        userDifficulty: difficulty,
      });
      const resumeBlock = formatResumeContext(resumeProfile);

      const prompt = `Generate 5 realistic ${plan.playbook.company} interview questions for a ${role} candidate at Tier ${plan.tier}/10 (${plan.descriptor.label}, ${plan.calibration.yearsDisplay}, Difficulty: ${plan.calibration.difficulty}).
${resumeBlock ? `Tailor at least 2 questions directly to the candidate's resume projects and stack below:\n${resumeBlock}` : ''}
Ensure questions match Tier ${plan.tier}/10 strictly—beginners receive clear foundational prompts while 20–25+ year experts receive deep architectural/strategic challenges.
Return ONLY a JSON array of 5 strings.`;

      const response = await generateContentWithRetry(
        {
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction: plan.simulationSystemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
        15000
      );

      const text = response?.text || '[]';
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return res.json({
            questions: parsed.slice(0, 5),
            difficultyTier: plan.tier,
            tierLabel: plan.tierLabel,
          });
        }
      } catch {
        // fallback below
      }

      const fallbackQuestions = text
        .split('\n')
        .filter((l) => l.trim().length > 10)
        .map((l) => l.replace(/^[\d.\-*]\s*/, '').trim())
        .slice(0, 5);
      res.json({
        questions: fallbackQuestions,
        difficultyTier: plan.tier,
        tierLabel: plan.tierLabel,
      });
    } catch (error: any) {
      console.warn('Gemini Generate Simulation Error:', error?.message);
      res.status(500).json({ error: 'Failed to generate simulation questions.' });
    }
  });

  // Structured Executive Evaluation with Skill Bars & Per-Question Breakdown
  app.post('/api/evaluate', async (req, res) => {
    try {
      const {
        company,
        role,
        type = 'Technical',
        difficulty = 'Medium',
        experience = 3,
        finalTier,
        peakTier,
        resumeProfile,
        history = [],
      } = req.body;

      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.json({
          crackProbability: 'Needs Work',
          overallScore: 0,
          overallSummary:
            'Evaluation unavailable because the Gemini API Key is missing.',
          speakingSkills: 'Not enough data.',
          technicalSkills: 'Not enough data.',
          deepDive: 'Please configure GEMINI_API_KEY in Settings > Secrets.',
          skillScores: {
            technicalDepth: 0,
            resumeAlignment: 0,
            systemArchitecture: 0,
            communication: 0,
            problemSolving: 0,
          },
          questionReviews: [],
          improvements: ['Configure GEMINI_API_KEY and retry.'],
          studyTopics: ['System Design', 'Data Structures', 'Mock Practice'],
        });
      }

      const plan = DifficultyOrchestrator.orchestrate({
        company,
        role,
        experienceYears: Number(experience) || 0,
        roundType: type,
        userDifficulty: difficulty,
        history: Array.isArray(history) ? history : [],
        overrideTier:
          typeof peakTier === 'number'
            ? peakTier
            : typeof finalTier === 'number'
              ? finalTier
              : undefined,
      });
      const resumeBlock = formatResumeContext(resumeProfile);

      let evalPrompt = `Analyze this ${type} interview transcript for "${role}" at ${plan.playbook.company} evaluated under Tier ${plan.tier}/10 (${plan.descriptor.label}, ${plan.calibration.yearsDisplay}, Difficulty: ${plan.calibration.difficulty}).
${resumeBlock}

Evaluate objectively and produce:
1. overallScore (0-100) and crackProbability ("Highly Likely", "Possible", or "Needs Work").
2. Five numeric skillScores (0-100): technicalDepth, resumeAlignment, systemArchitecture, communication, problemSolving.
3. questionReviews: For each interviewer question + candidate answer pair in the transcript, provide rating (0-100), verdict ("Strong", "Partial", or "Needs Depth"), concise actionable feedback, and a concise idealAnswer fitting a top 1% Tier ${plan.tier}/10 candidate at ${plan.playbook.company}.
4. Concise overallSummary, speakingSkills, technicalSkills, deepDive, 3-5 improvements, and 3-4 studyTopics.

Transcript:
`;

      history.forEach((msg: any) => {
        evalPrompt += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.text}\n`;
      });

      const response = await generateContentWithRetry(
        {
          model: 'gemini-4-hydrogen',
          contents: evalPrompt,
          config: {
            systemInstruction: plan.evaluationSystemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              crackProbability: { type: Type.STRING },
              overallScore: { type: Type.NUMBER },
              overallSummary: { type: Type.STRING },
              speakingSkills: { type: Type.STRING },
              technicalSkills: { type: Type.STRING },
              deepDive: { type: Type.STRING },
              skillScores: {
                type: Type.OBJECT,
                properties: {
                  technicalDepth: { type: Type.NUMBER },
                  resumeAlignment: { type: Type.NUMBER },
                  systemArchitecture: { type: Type.NUMBER },
                  communication: { type: Type.NUMBER },
                  problemSolving: { type: Type.NUMBER },
                },
              },
              questionReviews: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    candidateAnswer: { type: Type.STRING },
                    rating: { type: Type.NUMBER },
                    verdict: { type: Type.STRING },
                    feedback: { type: Type.STRING },
                    idealAnswer: { type: Type.STRING },
                  },
                },
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              studyTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
          },
        },
        20000
      );

      const defaultReport = {
        crackProbability: 'Needs Work',
        overallScore: 0,
        overallSummary: "We couldn't fully evaluate your performance.",
        speakingSkills: 'Not enough data.',
        technicalSkills: 'Not enough data.',
        deepDive:
          'There was a technical issue analyzing the interview transcript.',
        skillScores: {
          technicalDepth: 0,
          resumeAlignment: 0,
          systemArchitecture: 0,
          communication: 0,
          problemSolving: 0,
        },
        questionReviews: [],
        improvements: ['Complete more turns before ending the session.'],
        studyTopics: [
          'System Design Fundamentals',
          'Algorithms',
          'Structured STAR Storytelling',
        ],
      };

      const parsed = safeJsonParse(response?.text || '', defaultReport);
      res.json({ ...defaultReport, ...parsed });
    } catch (error: any) {
      console.warn('Error getting evaluation:', error?.message);
      res.json({
        crackProbability: 'Needs Work',
        overallScore: 0,
        overallSummary:
          'We encountered an error evaluating this session. Please try again.',
        speakingSkills: 'Not enough data.',
        technicalSkills: 'Not enough data.',
        deepDive: 'Temporary AI evaluation outage.',
        skillScores: {
          technicalDepth: 0,
          resumeAlignment: 0,
          systemArchitecture: 0,
          communication: 0,
          problemSolving: 0,
        },
        questionReviews: [],
        improvements: ['Retry evaluation after a short wait.'],
        studyTopics: ['System Design Fundamentals', 'Data Structures'],
      });
    }
  });

  app.post('/api/insights', async (req, res) => {
    try {
      const { userDetails, historyStr, resumeProfile } = req.body;
      const resumeBlock = formatResumeContext(resumeProfile);
      const prompt = `You are an expert career coach and technical interviewer analyzing a candidate's overall progress.

Candidate Profile:
${userDetails}
${resumeBlock}

Summary of Past Sessions:
${historyStr}

Respond ONLY in JSON format with:
- strengths: array of strings (3-4 strengths)
- weaknesses: array of strings (3-4 areas needing improvement)
- studyPlan: array of objects with keys "topic", "reason", "actionableSteps" (3 key areas)
- overallAdvice: string`;

      const response = await generateContentWithRetry({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
        },
      });

      const parsed = safeJsonParse(response?.text || '', {
        strengths: ['Consistent interview practice'],
        weaknesses: ['Need more completed sessions for deeper trend analysis'],
        studyPlan: [
          {
            topic: 'Resume Storytelling & Architecture',
            reason: 'Builds strong opening momentum',
            actionableSteps:
              'Practice explaining trade-offs from your top two projects.',
          },
        ],
        overallAdvice:
          'Upload your resume and run targeted sessions to sharpen weak spots.',
      });
      res.json(parsed);
    } catch (err: any) {
      console.warn('Insights error', err?.message);
      res.json({
        strengths: ['Dedicated preparation'],
        weaknesses: ['Not enough session data'],
        studyPlan: [
          {
            topic: 'General Practice',
            reason: 'API Error',
            actionableSteps: 'Try refreshing insights shortly.',
          },
        ],
        overallAdvice: 'Keep practicing consistently.',
      });
    }
  });

  app.post('/api/learner', async (req, res) => {
    try {
      const { topic } = req.body;
      const prompt = `You are an expert tech lead. Provide the latest industry trends, patterns, and interview questions regarding: ${topic || 'Software Engineering Interviews'}.
Respond ONLY in JSON format:
{
  "title": "Module Title",
  "lastUpdated": "Today's Date",
  "trends": ["trend1", "trend2"],
  "resources": [{"name": "Official documentation or engineering guide name", "url": "https://... valid official URL or empty string"}],
  "newQuestions": [{"question": "Q1", "concept": "what it tests"}]
}`;

      const response = await generateContentWithRetry({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
        },
      });

      const parsed = safeJsonParse(response?.text || '', {
        title: 'Latest in ' + (topic || 'Tech'),
        lastUpdated: new Date().toLocaleDateString(),
        trends: ['Distributed Systems Reliability', 'AI-Native Workflows'],
        resources: [{ name: 'Engineering Blogs', url: '#' }],
        newQuestions: [
          {
            question: 'How do you design a distributed rate limiter?',
            concept: 'Scalability & Concurrency',
          },
        ],
      });
      res.json(parsed);
    } catch (err: any) {
      console.warn('Learner error', err?.message);
      res.status(500).json({ error: 'Failed to generate learning module.' });
    }
  });

  app.post('/api/horizon-research', async (req, res) => {
    try {
      const { domainTopic } = req.body;
      const cleanTopic =
        typeof domainTopic === 'string' && domainTopic.trim()
          ? domainTopic.trim().slice(0, 120)
          : 'Ephemeral Semantic Web Applications & Self-Healing Algorithms in Year 5026';

      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.status(500).json({ error: 'Missing Gemini API Key.' });
      }

      const prompt = `You are a Principal Computer Science & Future Systems Researcher projecting computing 3,000 years into the future (Year 5026) from grounded 2026 physics and computer science first principles.
Synthesize a deep research dossier on: "${cleanTopic}".

Analyze concrete architectural shifts from naive brute-force approaches -> optimal 2026 engineering -> Year 5026 post-silicon computing:
1. eraTitle: Concise technical title for the Year 5026 paradigm
2. substrateShift: How physical compute, energy (Landauer limit), and memory operate in 5026
3. algorithmBreakthrough: How algorithms eliminate brute force via proof-carrying code, sub-linear indexing, and self-healing invariants
4. applicationForm: What a "website" or "application" looks like after 3,000 years (ephemeral semantic surfaces vs static apps)
5. humanAiSymbiosis: How human engineers and autonomous AI meshes collaborate
6. paradigmComparisons: Array of 3 objects with keys "dimension", "naive2026", "optimal2026", "horizon5026"
7. frontierInterviewQuestions: Array of 3 deep architectural interview questions testing these concepts, each with "question", "testsConcept", and "tierHint"

Return ONLY valid JSON matching this schema.`;

      const response = await generateContentWithRetry(
        {
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
          },
        },
        15000
      );

      const fallback = {
        eraTitle: `Year 5026 Projection · ${cleanTopic}`,
        substrateShift:
          'Computation approaches reversible thermodynamic limits on optical-topological lattices, eliminating thermal bottlenecks of 21st-century silicon.',
        algorithmBreakthrough:
          'Intent specifications compile directly into formally verified proof-carrying execution graphs, replacing runtime brute-force search and regression suites.',
        applicationForm:
          'Static websites dissolve into ephemeral, zero-latency semantic projections assembled instantaneously around user intent and local cryptographic sovereignty.',
        humanAiSymbiosis:
          'Engineers act as invariant custodians and ethical boundary architects while self-healing AI meshes optimize routing, consensus, and fault containment autonomously.',
        paradigmComparisons: [
          {
            dimension: 'Complexity & Verification',
            naive2026: 'Brute-force scans & manual test suites',
            optimal2026: 'Indexed O(log N) structures & typed invariants',
            horizon5026: 'Zero-knowledge proof-carrying intent graphs',
          },
          {
            dimension: 'Interface Lifecycle',
            naive2026: 'Static bundled pages & client polling',
            optimal2026: 'Reactive edge-streamed components',
            horizon5026: 'Ephemeral semantic synthesis on demand',
          },
          {
            dimension: 'Fault Tolerance',
            naive2026: 'Manual incident paging & restarts',
            optimal2026: 'Circuit breakers & multi-region failover',
            horizon5026: 'Autonomous topological self-healing meshes',
          },
        ],
        frontierInterviewQuestions: [
          {
            question:
              'If runtime latency approaches physical light-speed limits across planetary nodes, how do you design an intent-compiled system that preserves linearizability without blocking local user sovereignty?',
            testsConcept: 'Locality-First Consensus & Speculative Proof Graphs',
            tierHint: 'Tier 9–10 · Principal / Distinguished Architect',
          },
          {
            question:
              'When interfaces are synthesized ephemerally per user intent rather than shipped as fixed codebases, how do you enforce deterministic accessibility, WCAG legibility, and zero-trust data boundaries?',
            testsConcept: 'Invariant-Bounded Generative UI Governance',
            tierHint: 'Tier 7–8 · Staff Systems Architect',
          },
        ],
      };

      const parsed = safeJsonParse(response?.text || '', fallback);
      res.json({ ...fallback, ...parsed });
    } catch (err: any) {
      console.warn('Horizon research error:', err?.message);
      res.status(500).json({ error: 'Unable to synthesize Year 5026 dossier.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
