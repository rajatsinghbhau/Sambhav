import { TeachingActivity, ExamRevisionCheckpoint } from '../types/stage4';
import { AiSimulation } from '../types/simulation';

export interface AiActivityResponse {
  success: boolean;
  concept: string;
  activities: TeachingActivity[];
  isFallback?: boolean;
}

export interface AiExplanationResponse {
  success: boolean;
  concept: string;
  sensory: string;
  visual: string;
  science: string;
  realLifeExample: string;
  isFallback?: boolean;
}

/**
 * Calls serverless endpoint to generate 4 diverse inclusive activities with Gemini 2.5 Flash.
 * Falls back safely with zero crashes if offline or API key missing.
 */
export async function generateAiActivities(
  conceptLabel: string,
  conceptExplanation: string
): Promise<AiActivityResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('/api/generate-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conceptLabel, conceptExplanation }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.activities) && data.activities.length > 0) {
      return data;
    }
  } catch (e) {
    console.warn('AI activity generation offline or timed out; using curated library:', e);
  }
  return null;
}

/**
 * Calls serverless endpoint to generate 3 child-friendly explanation tiers with Gemini 2.5 Flash.
 * Falls back safely with zero crashes if offline or API key missing.
 */
export async function generateAiExplanation(
  conceptLabel: string,
  conceptExplanation: string
): Promise<AiExplanationResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('/api/generate-simple-explanation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conceptLabel, conceptExplanation }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.success && data.sensory && data.visual && data.science) {
      return data;
    }
  } catch (e) {
    console.warn('AI simple explanation offline or timed out; using curated explanation:', e);
  }
  return null;
}

/**
 * Calls serverless endpoint to generate 6 multi-tier inclusive exam checkpoint questions with Gemini 2.5 Flash.
 * Falls back safely with zero crashes if offline or API key missing.
 */
export async function generateAiExamCheckpoint(
  conceptLabel: string,
  conceptExplanation: string
): Promise<ExamRevisionCheckpoint | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('/api/generate-exam-checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conceptLabel, conceptExplanation }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
      return {
        conceptId: data.conceptId || conceptLabel.toLowerCase().replace(/\s+/g, '-'),
        conceptLabel: data.conceptLabel || conceptLabel,
        memoryHook: data.memoryHook || 'Keep revising this key concept!',
        questions: data.questions
      };
    }
  } catch (e) {
    console.warn('AI exam checkpoint offline or timed out; using curated checkpoint:', e);
  }
  return null;
}

// Client in-memory simulation cache for instant 0ms responses
const clientSimulationCache = new Map<string, AiSimulation>();

/**
 * Calls serverless endpoint to generate an interactive cause-and-effect simulation
 * for ANY teacher question or topic using Groq / Gemini with offline fallback and client cache.
 */
export async function generateAiSandboxSimulation(
  question: string,
  topic: string,
  concepts?: any[]
): Promise<AiSimulation | null> {
  const cacheKey = `${(topic || '').trim().toLowerCase()}:::${(question || '').trim().toLowerCase()}`;
  if (clientSimulationCache.has(cacheKey)) {
    return clientSimulationCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('/api/generate-sandbox-simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, topic, concepts }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.steps) && data.steps.length > 0) {
      const simResult: AiSimulation = {
        topic: data.topic || topic,
        topicKn: data.topicKn || topic,
        inquiryQuestion: data.inquiryQuestion || question,
        inquiryQuestionKn: data.inquiryQuestionKn || question,
        introMessage: data.introMessage || 'Welcome to the simulation!',
        introMessageKn: data.introMessageKn || 'ವಿಜ್ಞಾನ ಪ್ರಯೋಗಕ್ಕೆ ಸುಸ್ವಾಗತ!',
        themeType: data.themeType || 'general',
        steps: data.steps,
        celebrationMessage: data.celebrationMessage || 'Great job completing this experiment!',
        celebrationMessageKn: data.celebrationMessageKn || 'ಪ್ರಯೋಗ ಯಶಸ್ವಿಯಾಗಿ ಮುಗಿದಿದೆ!',
        isAiGenerated: !data.isFallback
      };
      clientSimulationCache.set(cacheKey, simResult);
      return simResult;
    }
  } catch (e) {
    console.warn('AI sandbox simulation request failed; using dynamic graph generator:', e);
  }
  return null;
}
