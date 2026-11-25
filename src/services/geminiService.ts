import { ConceptGraph } from '../types/conceptGraph';
import { validateConceptGraph } from '../engine/graphValidator';
import { FALLBACK_GRAPH } from '../data/canonicalGraph';

export interface LessonGenerationResult {
  graph: ConceptGraph;
  isFallback: boolean;
  message?: string;
}

/**
 * Client service to request lesson graph generation.
 * Architecture: Browser -> Serverless Function (/api/generate-lesson-graph) -> LLM -> Validation
 *
 * The browser NEVER touches the LLM API key directly.
 * If any failure occurs (missing key, server error, timeout, malformed JSON, validation failure):
 * 1. Reject candidate
 * 2. Load validated fallback graph
 * 3. Continue normally
 * 4. Show non-blocking message: "Using the validated lesson graph."
 */
export async function generateLessonGraphWithFallback(
  lessonText: string
): Promise<LessonGenerationResult> {
  const fallbackMessage = 'Using the validated lesson graph.';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('/api/generate-lesson-graph', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lessonText }),
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      // Serverless function unavailable, network failure, or timeout
      return {
        graph: FALLBACK_GRAPH,
        isFallback: true,
        message: fallbackMessage
      };
    }

    const payload = await response.json().catch(() => null);
    if (!payload || !payload.candidateGraph) {
      // Malformed response JSON
      return {
        graph: FALLBACK_GRAPH,
        isFallback: true,
        message: fallbackMessage
      };
    }

    // Strict validation
    const validation = validateConceptGraph(payload.candidateGraph);
    if (!validation.isValid) {
      console.warn('Candidate graph rejected by strict validator:', validation.error);
      return {
        graph: FALLBACK_GRAPH,
        isFallback: true,
        message: fallbackMessage
      };
    }

    // Validated graph ready for teacher review
    return {
      graph: validation.graph,
      isFallback: false
    };
  } catch (err) {
    console.warn('Unexpected error in lesson graph generation:', err);
    return {
      graph: FALLBACK_GRAPH,
      isFallback: true,
      message: fallbackMessage
    };
  }
}
