import { InterviewConfig } from '../types';

export interface PrewarmedTurnResult {
  text?: string;
  error?: boolean;
  quotaExceeded?: boolean;
  difficultyTier?: number;
  baseTier?: number;
  tierLabel?: string;
  tierShift?: 'up' | 'down' | 'steady';
  adaptiveDelta?: number;
}

const prewarmCache = new Map<string, Promise<PrewarmedTurnResult | null>>();
const QUOTA_COOLDOWN_MS = 60_000;
let quotaCooldownUntil = 0;

export function markQuotaCooldown(durationMs = QUOTA_COOLDOWN_MS): void {
  quotaCooldownUntil = Math.max(quotaCooldownUntil, Date.now() + durationMs);
  prewarmCache.clear();
}

export function isQuotaCooldownActive(): boolean {
  return Date.now() < quotaCooldownUntil;
}

export function getConfigPrewarmSignature(config: InterviewConfig): string {
  return JSON.stringify({
    company: config.company,
    role: config.role,
    type: config.type,
    experience: config.experience,
    difficulty: config.difficulty,
    strictMode: Boolean(config.strictMode),
    startWithResume: config.startWithResume !== false,
    focusTopics: (config.focusTopics || '').trim(),
    resumeId: config.resumeProfile?.id || 'none',
  });
}

export function prewarmOpeningTurn(
  config: InterviewConfig
): Promise<PrewarmedTurnResult | null> {
  if (!config.company || !config.role || isQuotaCooldownActive()) {
    return Promise.resolve(null);
  }
  const signature = getConfigPrewarmSignature(config);
  const existing = prewarmCache.get(signature);
  if (existing) {
    return existing;
  }

  // Keep cache bounded cleanly to the latest few configs
  if (prewarmCache.size > 4) {
    const oldestKey = prewarmCache.keys().next().value;
    if (oldestKey) prewarmCache.delete(oldestKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 14000);

  const requestPromise = fetch('/api/interact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company: config.company,
      role: config.role,
      type: config.type,
      difficulty: config.difficulty,
      experience: config.experience,
      resumeProfile: config.resumeProfile || null,
      startWithResume: config.startWithResume !== false,
      strictMode: Boolean(config.strictMode),
      focusTopics: config.focusTopics || '',
      history: [],
    }),
    signal: controller.signal,
  })
    .then(async (res) => {
      clearTimeout(timeoutId);
      const raw = await res.text();
      const parsed = JSON.parse(raw) as PrewarmedTurnResult;
      if (
        res.status === 429 ||
        parsed?.quotaExceeded ||
        parsed?.text?.includes('high load')
      ) {
        markQuotaCooldown();
        return null;
      }
      if (parsed?.error || !parsed?.text) {
        prewarmCache.delete(signature);
        return null;
      }
      return parsed;
    })
    .catch(() => {
      clearTimeout(timeoutId);
      prewarmCache.delete(signature);
      return null;
    });

  prewarmCache.set(signature, requestPromise);
  return requestPromise;
}

export function consumePrewarmedOpeningTurn(
  config: InterviewConfig
): Promise<PrewarmedTurnResult | null> | null {
  if (isQuotaCooldownActive()) {
    return null;
  }
  const signature = getConfigPrewarmSignature(config);
  const cached = prewarmCache.get(signature) || null;
  if (cached) {
    prewarmCache.delete(signature);
  }
  return cached;
}
