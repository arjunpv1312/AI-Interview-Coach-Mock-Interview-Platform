import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { apiManager } from './src/lib/ApiManager';

async function generateContentWithRetry(options: any) {
  let attempts = 0;
  let maxRetries = Math.max(5, apiManager.getKeysLength() * 3);
  
  const modelsToTry = [
    options.model || 'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-pro-latest'
  ];

  while (attempts < maxRetries) {
    try {
      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) throw new Error("Missing API Key");
      const ai = new GoogleGenAI({ apiKey });
      
      const currentModel = modelsToTry[attempts % modelsToTry.length];
      const currentOptions = { ...options, model: currentModel };
      
      return await ai.models.generateContent(currentOptions);
    } catch (error: any) {
      const errString = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      attempts++;
      
      if (attempts >= maxRetries || apiManager.getKeysLength() === 0) {
        throw error;
      }

      if (errString.includes('API_KEY_INVALID') || errString.includes('403') || errString.includes('400') || errString.includes('NOT_FOUND') || errString.includes('404')) {
        // If 404/NOT_FOUND, maybe this model is not supported with this key. We should just try next model instead of next key, 
        // but if it's 403 API_KEY_INVALID, we remove the key.
        if (errString.includes('API_KEY_INVALID') || errString.includes('403')) {
           apiManager.removeCurrentKey();
           maxRetries--; // we lost a key
        }
        // Immediately try the next key/model
        continue;
      } else if (errString.includes('429') || errString.includes('Quota') || errString.includes('ResourceExhausted') || errString.includes('Too Many Requests') || errString.includes('503')) {
        apiManager.nextKey();
        // Wait a short moment before retry
        await new Promise(r => setTimeout(r, 1500));
      } else {
        // Could be a weird parsing error, just retry next model/key
        apiManager.nextKey();
      }
    }
  }
  throw new Error("Failed after retries");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/interact', async (req, res) => {
    try {
      const { company, role, history } = req.body;
      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.json({ text: "I'm sorry, but I cannot assist you right now. The Gemini API Key is missing from your server configuration. Please add it to continue the interview." });
      }

      let chatPrompt = `You are an elite, highly technical, and strictly professional interviewer at ${company} interviewing a candidate for the "${role}" position. You possess knowledge extrapolated from hundreds of thousands (1000s of lakhs) of real-world interview sessions, data, and technical evaluations at top-tier tech companies.
Your responses must be spoken-word conversational, VERY concise (1 or 2 sentences maximum), and MUST BE COMPLETELY IN ENGLISH.

Crucial Instructions:
1. FOCUS ON EXTREME DEPTH: Ask highly practical, deeply technical questions. Probe into system design at massive scale, complex database optimizations, inner workings of technologies, low-level architecture, caching, memory management, and advanced heuristic methods.
2. BE ADAPTIVE & RELENTLESS: If the candidate answers well, immediately pivot to a much harder, highly specific follow-up edge case. Do not congratulate them.
3. CONVERSATIONAL REALISM: Pure spoken text only. No markdown, lists, or asterisks (like *smiles*). NEVER write code blocks. Act perfectly professional and proportional to a top-tier tech interview.
4. PROBE WEAKNESSES: If they give a superficial or buzzword-heavy answer, ruthlessly (but politely) ask them to explain the exact inner workings, latency trade-offs, or underlying database implementations.
5. EXTREMELY BRIEF: Keep your prompts strictly under 40 words total. The candidate must do the heavy lifting in the conversation.

Conversation so far:
`;

      if (history && history.length > 0) {
        history.forEach((msg: any) => {
           chatPrompt += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.text}\n`;
        });
      } else {
        chatPrompt += "(Start the interview by introducing yourself briefly as the AI interviewer and asking the first interview question regarding the role.)\n";
      }
      
      chatPrompt += `\nInterviewer:`;

      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: chatPrompt,
      });

      if (!response?.text) {
        throw new Error("Empty response from AI");
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.warn('Error getting interaction:', error);
      let fallbackText = "I'm having a technical issue processing that. Could you please answer the previous question again, or rephrase it?";
      
      const errString = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (errString.includes('429') || errString.includes('Quota') || errString.includes('ResourceExhausted')) {
         apiManager.nextKey();
         fallbackText = "Our AI system is currently handling a maximum load. We are dynamically re-routing resources and switching nodes... Please wait up to 60 seconds and submit your response again.";
      } else if (errString.includes('403') || errString.includes('API_KEY_INVALID')) {
         fallbackText = "I'm sorry, there is an issue with the Gemini API Key. Please check your configuration.";
      }

      res.json({ error: true, text: fallbackText });
    }
  });

  // Simulate specific questions without chatting
  app.post('/api/simulate-questions', async (req, res) => {
    try {
      const { company, role, experience } = req.body;
      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.status(500).json({ error: "Missing Gemini API Key." });
      }

      let prompt = `You are an expert, elite technical recruiter and lead engineer at ${company} with access to hundreds of thousands of real interview datasets. Generate exactly 5 custom, highly-advanced interview questions for a ${role} position (Experience level: ${experience} years).
The questions must be intensely specific, focusing on real-world pain points: database architectural improvements, heuristic methods, performance under maximum effort, consolidation of distributed systems, and modern technology implementations mapping ${company}'s actual stack.
Do not include any introductory or concluding text. 
Return ONLY a JSON array of 5 strings.
Example: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;

      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.7,
            responseMimeType: "application/json"
        }
      });

      let text = response?.text || '';
      // Attempt to parse JSON
      try {
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            const rawQuestions = JSON.parse(jsonMatch[0]);
            return res.json({ questions: rawQuestions.slice(0, 5) });
        }
      } catch(e) {
         // fallback
      }
      
      // Fallback if parsing fails
      const fallbackQuestions = text.split('\n').filter(l => l.trim().length > 10).map(l => l.replace(/^[\d\.\-\*]\s*/, '').trim()).slice(0, 5);
      res.json({ questions: fallbackQuestions });
      
    } catch (error: any) {
      console.warn('Gemini Generate Simulation Error:', error);
      const errString = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      let fallbackText = "Failed to communicate with AI.";
      if (errString.includes('429') || errString.includes('Quota') || errString.includes('ResourceExhausted')) {
         fallbackText = "Our AI system is currently handling a maximum load. Please wait a moment and try again.";
      } else if (errString.includes('403') || errString.includes('API_KEY_INVALID')) {
         fallbackText = "There is an issue with the Gemini API Key. Please check the configurations.";
      }
      res.status(500).json({ error: fallbackText });
    }
  });

  app.post('/api/evaluate', async (req, res) => {
    try {
      const { company, role, history } = req.body;
      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.json({
          crackProbability: "Needs Work",
          overallScore: 0,
          overallSummary: "We couldn't fully evaluate your performance because the Gemini API Key is missing.",
          speakingSkills: "Not enough data.",
          technicalSkills: "Not enough data.",
          deepDive: "Your server is missing the Gemini API Key. Please add it to your configuration.",
          improvements: ["Add GEMINI_API_KEY to continue."],
          studyTopics: ["System Design Fundamentals", "Data Structures & Algorithms", "Mock Interview Practice"]
        });
      }

      let chatPrompt = `Analyze this interview transcript for a ${role} at ${company} using an evaluation model trained on hundreds of thousands (1000s of lakhs) of technical interviews from top-tier tech companies.
Evaluate the candidate with extreme rigor and precision, consolidating their performance into highly specific, actionable metrics. Compare their responses against the top 1% of engineers.

You MUST return ONLY a raw JSON object with the following fields: 
- crackProbability: string (Must be exactly one of: "Highly Likely", "Possible", "Needs Work")
- overallScore: number (A score from 0 to 100 based on rigorous tech-industry rubric, scaling effort and logic completeness)
- overallSummary: string (A blunt, 2-3 sentence overview of their performance. Explicitly state whether they have a well-founded chance to clear a final round at ${company} based on this performance.)
- speakingSkills: string (Evaluate their communication, clarity under pressure, and conciseness)
- technicalSkills: string (Evaluate the architectural correctness, algorithmic depth, database methodologies, routing, and optimization capabilities demonstrated)
- deepDive: string (A very comprehensive, multi-paragraph deep-dive analysis. Consolidate their strengths and weaknesses. Focus on their use of advanced technologies, database improvements, distributed systems scaling logic, or identify severe knowledge gaps and heuristic faults.)
- improvements: array of strings (List 3-5 specific, actionable areas they need to aggressively improve on)
- studyTopics: array of strings (List exactly 3 specific, advanced technical study areas or methodologies they must master)

Transcript:
`;

      history.forEach((msg: any) => {
         chatPrompt += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.text}\n`;
      });

      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: chatPrompt,
        config: { responseMimeType: "application/json" }
      });

      let responseText = response?.text || "";
      
      let parsedResponse = {
        crackProbability: "Needs Work",
        overallScore: 0,
        overallSummary: "We couldn't fully evaluate your performance.",
        speakingSkills: "Not enough data.",
        technicalSkills: "Not enough data.",
        deepDive: "There was a technical issue analyzing the interview data. Please try taking another interview.",
        improvements: ["Practice more interviews."],
        studyTopics: ["System Design Fundamentals", "Data Structures & Algorithms", "Mock Interview Practice"]
      };

      try {
        const jsonMatch = responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
        if (jsonMatch) {
            const jsonText = Array.isArray(jsonMatch) && jsonMatch[1] ? jsonMatch[1] : jsonMatch[0];
            parsedResponse = JSON.parse(jsonText);
        } else {
            parsedResponse = JSON.parse(responseText);
        }
      } catch (e) {
        console.warn("Failed to parse Gemini evaluation as JSON:", responseText, e);
      }

      res.json(parsedResponse);
    } catch (error: any) {
      console.warn('Error getting evaluation:', error);
      
      const errString = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      let summaryText = `We couldn't fully evaluate your performance due to a server error.`;
      if (errString.includes('429') || errString.includes('Quota') || errString.includes('ResourceExhausted')) {
          apiManager.nextKey();
          summaryText = "We are currently operating at maximum capacity. We have switched API nodes in the background. Please try submitting your evaluation again.";
      }

      res.json({
        crackProbability: "Needs Work",
        overallScore: 0,
        overallSummary: summaryText,
        speakingSkills: "Not enough data.",
        technicalSkills: "Not enough data.",
        deepDive: "There was an unexpected error connecting to the AI system. We apologize for the inconvenience and recommend trying your interview again.",
        improvements: ["Ensure stable network connection.", "Try another mock interview session."],
        studyTopics: ["System Design Fundamentals", "Data Structures & Algorithms", "Mock Interview Practice"]
      });
    }
  });

  app.post('/api/insights', async (req, res) => {
    try {
      const { userDetails, historyStr } = req.body;
      const prompt = `You are an expert career coach and technical interviewer analyzing a candidate's overall progress.
      
Candidate Profile:
${userDetails}

Summary of Past Sessions:
${historyStr}

Based on this data, provide a highly personalized and professional overall performance analysis.
Respond ONLY in JSON format with the following keys:
- strengths: array of strings (3-4 technical or communication strengths)
- weaknesses: array of strings (3-4 specific areas needing improvement)
- studyPlan: array of objects with keys: "topic" (string), "reason" (string), "actionableSteps" (string) (Provide 3 key areas of study)
- overallAdvice: string (A solid paradigm-shifting piece of advice for their career)`;

      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let responseText = response?.text || "";
      let parsedResponse;
      try {
        const jsonMatch = responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
        const jsonText = jsonMatch ? (Array.isArray(jsonMatch) && jsonMatch[1] ? jsonMatch[1] : jsonMatch[0]) : responseText;
        parsedResponse = JSON.parse(jsonText);
      } catch (e) {
        parsedResponse = {
           strengths: ["Shows dedication to practice"],
           weaknesses: ["Needs more consistent interview data"],
           studyPlan: [{topic: "General Interviewing", reason: "Need more data", actionableSteps: "Continue doing mock sessions."}],
           overallAdvice: "Keep practicing consistently to unlock tailored insights."
        };
      }
      res.json(parsedResponse);
    } catch (err: any) {
      console.warn("Insights error", err);
      res.json({
         strengths: ["System detected dedication"],
         weaknesses: ["Not enough data due to error"],
         studyPlan: [{topic: "General Practice", reason: "API Error", actionableSteps: "Try again later."}],
         overallAdvice: "We experienced a technical hiccup. Keep pushing forward and try refreshing later."
      });
    }
  });

  app.post('/api/learner', async (req, res) => {
    try {
      const { topic } = req.body;
      const prompt = `You are an expert tech lead and automated course generator. Provide the absolute latest industry trends, algorithms, and practices regarding: ${topic || 'General Software Engineering Interviews'}.
Create an educational module auto-updated with recent methods.
Respond ONLY in JSON format:
{
  "title": "Module Title",
  "lastUpdated": "Today's Date",
  "trends": ["trend1", "trend2"],
  "resources": [{"name": "Resource source", "url": "url if known, or text"}],
  "newQuestions": [{"question": "Q1", "concept": "what it tests"}]
}`;

      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let responseText = response?.text || "";
      let parsedResponse;
      try {
        const jsonMatch = responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
        const jsonText = jsonMatch ? (Array.isArray(jsonMatch) && jsonMatch[1] ? jsonMatch[1] : jsonMatch[0]) : responseText;
        parsedResponse = JSON.parse(jsonText);
      } catch (e) {
        parsedResponse = {
           title: "Latest in " + (topic || "Tech"),
           lastUpdated: new Date().toLocaleDateString(),
           trends: ["AI Coding Assistants", "System Design for Scale"],
           resources: [{name: "Google Tech Blog", url: "#"}],
           newQuestions: [{question: "How do you design a distributed cache?", concept: "Caching Strategies"}]
        };
      }
      res.json(parsedResponse);
    } catch (err: any) {
      console.warn("Learner error", err);
      const errString = String(err) + " " + JSON.stringify(err, Object.getOwnPropertyNames(err));
      let fallbackText = "Failed to generate learning module due to a technical issue.";
      if (errString.includes('429') || errString.includes('Quota') || errString.includes('ResourceExhausted')) {
         fallbackText = "Our AI system is currently handling a maximum load. Please wait a moment and try again.";
      } else if (errString.includes('403') || errString.includes('API_KEY_INVALID')) {
         fallbackText = "There is an issue with the Gemini API Key. Please check the configurations.";
      }
      res.status(500).json({ error: fallbackText });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
