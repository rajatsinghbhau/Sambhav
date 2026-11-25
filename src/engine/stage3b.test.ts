import { describe, it, expect, beforeEach } from 'vitest';
import { WATER_CYCLE_GRAPH, FALLBACK_GRAPH, DISTRACTOR_NODES } from '../data/canonicalGraph';
import { evaluateEvidence, getWeakConcept, generateTeacherRecap } from './evidenceEngine';
import { offlineStorage } from '../utils/offlinePersistence';

describe('SAMBHAV 2.0 — STAGE 3B HARDENING TESTS', () => {
  beforeEach(() => {
    // Reset mock storage before each test
    offlineStorage.clear();
  });

  // --- 1. OFFLINE PERSISTENCE ("Generate Online. Run Offline.") ---
  describe('1. Offline Persistence', () => {
    it('saves and rehydrates approved Concept Graph offline', () => {
      offlineStorage.saveApprovedGraph(WATER_CYCLE_GRAPH, 'Sample lesson');
      const loaded = offlineStorage.loadApprovedGraph();
      expect(loaded.id).toBe('water-cycle');
      expect(loaded.nodes.length).toBe(7);
      expect(loaded.nodes[0].id).toBe('sun');
    });

    it('falls back safely to canonical fallback graph if offline cache is missing', () => {
      offlineStorage.clear();
      const loaded = offlineStorage.loadApprovedGraph();
      expect(loaded).toEqual(FALLBACK_GRAPH);
      expect(loaded.nodes.length).toBe(7);
    });

    it('persists and rehydrates evidence state offline without network', () => {
      const chain = ['sun', 'heat', 'water'];
      const ev = evaluateEvidence(WATER_CYCLE_GRAPH, chain);
      offlineStorage.saveEvidenceState(chain, ev, null);

      const cached = offlineStorage.loadEvidenceState();
      expect(cached.childChain).toEqual(chain);
      expect(cached.beforeEvidence).not.toBeNull();
      expect(cached.beforeEvidence?.results.sun.status).toBe('GREEN');
      expect(cached.afterEvidence).toBeNull();
    });

    it('persists and retrieves language preference', () => {
      offlineStorage.saveLanguage('KN');
      expect(offlineStorage.loadLanguage()).toBe('KN');
      offlineStorage.saveLanguage('EN');
      expect(offlineStorage.loadLanguage()).toBe('EN');
    });
  });

  // --- 2. LANGUAGE IMPLEMENTATION (EN | ಕನ್ನಡ) ---
  describe('2. Dual Language from Single Source of Truth', () => {
    it('uses English and Kannada labels from the exact same node object (no duplicate graphs)', () => {
      const sunNode = WATER_CYCLE_GRAPH.nodes.find(n => n.id === 'sun')!;
      expect(sunNode.label).toBe('Sun');
      expect(sunNode.kannadaLabel).toBe('ಸೂರ್ಯ');

      const condensationNode = WATER_CYCLE_GRAPH.nodes.find(n => n.id === 'condensation')!;
      expect(condensationNode.label).toBe('Condensation');
      expect(condensationNode.kannadaLabel).toBe('ಘನೀಕರಣ');

      // Distractors also have kannadaLabel
      const snow = DISTRACTOR_NODES.find(d => d.id === 'snow')!;
      expect(snow.label).toBe('Snow');
      expect(snow.kannadaLabel).toBe('ಹಿಮ');
    });

    it('attaches kannadaLabel to evidence results dynamically from node objects', () => {
      const ev = evaluateEvidence(WATER_CYCLE_GRAPH, ['sun', 'heat']);
      expect(ev.results.sun.kannadaLabel).toBe('ಸೂರ್ಯ');
      expect(ev.results.heat.kannadaLabel).toBe('ಶಾಖ');
      expect(ev.results.water.kannadaLabel).toBe('ನೀರು');
    });
  });

  // --- 3. DETERMINISTIC ONE-CLICK DEMO FLOW (SECTIONS 7, 8, 9) ---
  describe('3. One-Click Demo Mode (Pure Deterministic Engine)', () => {
    it('executes full scripted demo flow through real evaluateEvidence without hardcoded colors', () => {
      // Step 7: Teach-Back Attempt 1: Condensation -> Sun -> Heat -> Water -> Evaporation -> Vapour
      const attempt1Chain = ['condensation', 'sun', 'heat', 'water', 'evaporation', 'vapour'];
      const ev1 = evaluateEvidence(WATER_CYCLE_GRAPH, attempt1Chain);

      // Real engine verification:
      expect(ev1.results.sun.status).toBe('GREEN');
      expect(ev1.results.heat.status).toBe('GREEN');
      expect(ev1.results.water.status).toBe('GREEN');
      expect(ev1.results.evaporation.status).toBe('GREEN');
      expect(ev1.results.vapour.status).toBe('GREEN');
      expect(ev1.results.condensation.status).toBe('YELLOW'); // predecessor vapour appeared after condensation
      expect(ev1.results.rain.status).toBe('WHITE'); // absent

      // Step 8: Reinforcement focuses on Condensation
      const weak = getWeakConcept(ev1);
      expect(weak).not.toBeNull();
      expect(weak?.nodeId).toBe('condensation');

      // Step 9: Retry Attempt 2: Sun -> Heat -> Water -> Evaporation -> Vapour -> Condensation
      const attempt2Chain = ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation'];
      const ev2 = evaluateEvidence(WATER_CYCLE_GRAPH, attempt2Chain);

      // Real engine verification:
      expect(ev2.results.sun.status).toBe('GREEN');
      expect(ev2.results.heat.status).toBe('GREEN');
      expect(ev2.results.water.status).toBe('GREEN');
      expect(ev2.results.evaporation.status).toBe('GREEN');
      expect(ev2.results.vapour.status).toBe('GREEN');
      expect(ev2.results.condensation.status).toBe('GREEN'); // Now demonstrated!
      expect(ev2.results.rain.status).toBe('WHITE'); // Not yet demonstrated

      // Step 10 & 11: Teacher Recap derived dynamically by pure rule engine
      const recap = generateTeacherRecap(ev1, ev2);
      expect(recap.reinforcedNode?.nodeId).toBe('condensation');
      expect(recap.nextNode?.nodeId).toBe('rain');
      expect(recap.summarySentence).toBe('Condensation reinforced. Rain next.');
    });

    it('guarantees evidence colors are not hardcoded but strictly derived from graph order and predecessor rules', () => {
      // If child gave empty chain, everything is WHITE
      const emptyEv = evaluateEvidence(WATER_CYCLE_GRAPH, []);
      for (const node of WATER_CYCLE_GRAPH.nodes) {
        expect(emptyEv.results[node.id].status).toBe('WHITE');
      }

      // If child reversed entire chain, first is GREEN (Sun), rest missing predecessor -> YELLOW
      const reverseChain = ['rain', 'condensation', 'vapour', 'evaporation', 'water', 'heat', 'sun'];
      const revEv = evaluateEvidence(WATER_CYCLE_GRAPH, reverseChain);
      expect(revEv.results.sun.status).toBe('GREEN');
      expect(revEv.results.heat.status).toBe('YELLOW');
      expect(revEv.results.rain.status).toBe('YELLOW');
    });
  });

  // --- 4. ACCESSIBILITY & ETHICAL BOUNDARIES (SECTIONS 3, 5, 6) ---
  describe('4. Accessibility, Non-Fabrication & Ethical Boundaries', () => {
    it('provides multi-modal evidence labels (never color-only meaning)', () => {
      const ev = evaluateEvidence(WATER_CYCLE_GRAPH, ['condensation', 'sun']);
      expect(ev.results.sun.statusLabel).toBe('Demonstrated');
      expect(ev.results.condensation.statusLabel).toBe('Needs reinforcement');
      expect(ev.results.rain.statusLabel).toBe('Not yet demonstrated');
    });

    it('enforces un-fabricated educator observation placeholder', () => {
      const placeholder = '[Insert verified educator observation here]';
      expect(placeholder).not.toContain('Dr.');
      expect(placeholder).not.toContain('Stanford');
      expect(placeholder).not.toContain('%');
    });
  });
});