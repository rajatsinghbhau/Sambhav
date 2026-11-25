import { ConceptGraph, GraphEvidenceEvaluation } from '../types/conceptGraph';
import { FALLBACK_GRAPH } from '../data/canonicalGraph';

const STORAGE_KEYS = {
  GRAPH: 'sambhav_approved_graph',
  LESSON: 'sambhav_lesson_text',
  CHILD_CHAIN: 'sambhav_child_chain',
  BEFORE_EVIDENCE: 'sambhav_before_evidence',
  AFTER_EVIDENCE: 'sambhav_after_evidence',
  LANGUAGE: 'sambhav_language_mode',
};

export interface OfflineCacheState {
  graph: ConceptGraph;
  lessonText: string;
  childChain: string[];
  beforeEvidence: GraphEvidenceEvaluation | null;
  afterEvidence: GraphEvidenceEvaluation | null;
  language: 'EN' | 'KN';
}

// In-memory fallback if localStorage is unavailable, restricted, or during testing
const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {}
  return memoryStore[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {}
  memoryStore[key] = value;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {}
  delete memoryStore[key];
}

/**
 * Offline Persistence Helper: "Generate Online. Run Offline."
 * Completely robust to missing storage or browser restrictions.
 */
export const offlineStorage = {
  saveApprovedGraph(graph: ConceptGraph, lessonText?: string) {
    try {
      safeSetItem(STORAGE_KEYS.GRAPH, JSON.stringify(graph));
      if (lessonText) {
        safeSetItem(STORAGE_KEYS.LESSON, lessonText);
      }
    } catch (e) {
      console.warn('Offline storage write failed (e.g. quota exceeded):', e);
    }
  },

  loadApprovedGraph(): ConceptGraph {
    try {
      const raw = safeGetItem(STORAGE_KEYS.GRAPH);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse offline graph cache:', e);
    }
    return FALLBACK_GRAPH;
  },

  saveEvidenceState(
    childChain: string[],
    beforeEvidence: GraphEvidenceEvaluation | null,
    afterEvidence: GraphEvidenceEvaluation | null
  ) {
    try {
      safeSetItem(STORAGE_KEYS.CHILD_CHAIN, JSON.stringify(childChain));
      if (beforeEvidence) {
        safeSetItem(STORAGE_KEYS.BEFORE_EVIDENCE, JSON.stringify(beforeEvidence));
      }
      if (afterEvidence) {
        safeSetItem(STORAGE_KEYS.AFTER_EVIDENCE, JSON.stringify(afterEvidence));
      }
    } catch (e) {
      console.warn('Failed to save evidence state to offline storage:', e);
    }
  },

  loadEvidenceState(): {
    childChain: string[];
    beforeEvidence: GraphEvidenceEvaluation | null;
    afterEvidence: GraphEvidenceEvaluation | null;
  } {
    try {
      const rawChain = safeGetItem(STORAGE_KEYS.CHILD_CHAIN);
      const rawBefore = safeGetItem(STORAGE_KEYS.BEFORE_EVIDENCE);
      const rawAfter = safeGetItem(STORAGE_KEYS.AFTER_EVIDENCE);

      return {
        childChain: rawChain ? JSON.parse(rawChain) : [],
        beforeEvidence: rawBefore ? JSON.parse(rawBefore) : null,
        afterEvidence: rawAfter ? JSON.parse(rawAfter) : null,
      };
    } catch {
      return { childChain: [], beforeEvidence: null, afterEvidence: null };
    }
  },

  saveLanguage(lang: 'EN' | 'KN') {
    try {
      safeSetItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch {}
  },

  loadLanguage(): 'EN' | 'KN' {
    try {
      const lang = safeGetItem(STORAGE_KEYS.LANGUAGE);
      if (lang === 'KN' || lang === 'EN') return lang;
    } catch {}
    return 'EN';
  },

  clear() {
    try {
      safeRemoveItem(STORAGE_KEYS.GRAPH);
      safeRemoveItem(STORAGE_KEYS.LESSON);
      safeRemoveItem(STORAGE_KEYS.CHILD_CHAIN);
      safeRemoveItem(STORAGE_KEYS.BEFORE_EVIDENCE);
      safeRemoveItem(STORAGE_KEYS.AFTER_EVIDENCE);
      safeRemoveItem(STORAGE_KEYS.LANGUAGE);
    } catch {}
  }
};

/**
 * Graceful Service Worker Registration for PWA caching.
 * Non-blocking: if it fails, normal browser app continues without interruption.
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        // Non-blocking fallback
        console.info('Service Worker registration skipped/failed (app functions normally):', err);
      });
    });
  }
}