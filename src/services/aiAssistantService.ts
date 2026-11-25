import { TeachingActivity } from '../types/stage4';

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
