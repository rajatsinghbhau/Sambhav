import { describe, it, expect } from 'vitest';
import { WATER_CYCLE_GRAPH } from '../data/canonicalGraph';
import { evaluateEvidence, getWeakConcept, generateTeacherRecap } from '../engine/evidenceEngine';

describe('SAMBHAV 2.0 Deterministic Evidence Engine (Stage 1 Tests)', () => {
  // Test 1 — Full correct chain
  it('Test 1 — Full correct chain produces all seven GREEN', () => {
    const chain = ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation', 'rain'];
    const result = evaluateEvidence(WATER_CYCLE_GRAPH, chain);

    expect(result.results['sun'].status).toBe('GREEN');
    expect(result.results['heat'].status).toBe('GREEN');
    expect(result.results['water'].status).toBe('GREEN');
    expect(result.results['evaporation'].status).toBe('GREEN');
    expect(result.results['vapour'].status).toBe('GREEN');
    expect(result.results['condensation'].status).toBe('GREEN');
    expect(result.results['rain'].status).toBe('GREEN');

    Object.values(result.results).forEach(nodeRes => {
      expect(nodeRes.statusLabel).toBe('Demonstrated');
    });
  });

  // Test 2 — Demo chain
  it('Test 2 — Demo chain evaluates correctly with predecessor logic', () => {
    const chain = ['condensation', 'sun', 'heat', 'water', 'evaporation', 'vapour'];
    const result = evaluateEvidence(WATER_CYCLE_GRAPH, chain);

    expect(result.results['sun'].status).toBe('GREEN');
    expect(result.results['heat'].status).toBe('GREEN');
    expect(result.results['water'].status).toBe('GREEN');
    expect(result.results['evaporation'].status).toBe('GREEN');
    expect(result.results['vapour'].status).toBe('GREEN');
    expect(result.results['condensation'].status).toBe('YELLOW');
    expect(result.results['rain'].status).toBe('WHITE');

    expect(result.results['condensation'].statusLabel).toBe('Needs reinforcement');
    expect(result.results['rain'].statusLabel).toBe('Not yet demonstrated');
  });

  // Test 3 — Distractor
  it('Test 3 — Distractor (Wind) is ignored', () => {
    const chain = ['sun', 'heat', 'water', 'wind', 'evaporation', 'vapour'];
    const result = evaluateEvidence(WATER_CYCLE_GRAPH, chain);

    expect(result.results['sun'].status).toBe('GREEN');
    expect(result.results['heat'].status).toBe('GREEN');
    expect(result.results['water'].status).toBe('GREEN');
    expect(result.results['evaporation'].status).toBe('GREEN');
    expect(result.results['vapour'].status).toBe('GREEN');
    expect(result.results['condensation'].status).toBe('WHITE');
    expect(result.results['rain'].status).toBe('WHITE');
    expect(result.results['wind']).toBeUndefined();
  });

  // Test 4 — Empty chain
  it('Test 4 — Empty chain produces all WHITE without crash', () => {
    const chain: string[] = [];
    const result = evaluateEvidence(WATER_CYCLE_GRAPH, chain);

    expect(Object.keys(result.results).length).toBe(7);
    WATER_CYCLE_GRAPH.nodes.forEach(node => {
      expect(result.results[node.id].status).toBe('WHITE');
      expect(result.results[node.id].statusLabel).toBe('Not yet demonstrated');
    });
  });

  // Test 5 — Duplicate
  it('Test 5 — Duplicate node does not provide extra evidence', () => {
    const chain = ['sun', 'sun', 'heat'];
    const result = evaluateEvidence(WATER_CYCLE_GRAPH, chain);

    expect(result.results['sun'].status).toBe('GREEN');
    expect(result.results['heat'].status).toBe('GREEN');
    expect(result.results['water'].status).toBe('WHITE');
    expect(result.results['evaporation'].status).toBe('WHITE');
    expect(result.results['vapour'].status).toBe('WHITE');
    expect(result.results['condensation'].status).toBe('WHITE');
    expect(result.results['rain'].status).toBe('WHITE');
  });

  // Test 6 — Distractors only
  it('Test 6 — Distractors only results in all canonical nodes WHITE', () => {
    const chain = ['snow', 'wind'];
    const result = evaluateEvidence(WATER_CYCLE_GRAPH, chain);

    WATER_CYCLE_GRAPH.nodes.forEach(node => {
      expect(result.results[node.id].status).toBe('WHITE');
    });
  });

  // Test 7 — Non-adjacency
  it('Test 7 — Non-adjacency allows GREEN when predecessor is anywhere earlier', () => {
    const chain = ['sun', 'heat', 'rain', 'water', 'evaporation'];
    const result = evaluateEvidence(WATER_CYCLE_GRAPH, chain);

    expect(result.results['sun'].status).toBe('GREEN');
    expect(result.results['heat'].status).toBe('GREEN');
    expect(result.results['water'].status).toBe('GREEN');
    expect(result.results['evaporation'].status).toBe('GREEN');
    expect(result.results['rain'].status).toBe('YELLOW');
    expect(result.results['vapour'].status).toBe('WHITE');
    expect(result.results['condensation'].status).toBe('WHITE');
  });

  // Test 8 — Duplicate + distractor
  it('Test 8 — Duplicate and distractor combination handled accurately', () => {
    const chain = ['sun', 'heat', 'water', 'wind', 'evaporation', 'evaporation'];
    const result = evaluateEvidence(WATER_CYCLE_GRAPH, chain);

    expect(result.results['sun'].status).toBe('GREEN');
    expect(result.results['heat'].status).toBe('GREEN');
    expect(result.results['water'].status).toBe('GREEN');
    expect(result.results['evaporation'].status).toBe('GREEN');
    expect(result.results['vapour'].status).toBe('WHITE');
    expect(result.results['condensation'].status).toBe('WHITE');
    expect(result.results['rain'].status).toBe('WHITE');
  });
});

describe('SAMBHAV 2.0 Stage 2: Targeted Reinforcement (getWeakConcept)', () => {
  it('identifies the first YELLOW node when YELLOW exists', () => {
    // Attempt 1: Condensation -> Sun -> Heat -> Water -> Evaporation -> Vapour
    const attempt1Chain = ['condensation', 'sun', 'heat', 'water', 'evaporation', 'vapour'];
    const evidence = evaluateEvidence(WATER_CYCLE_GRAPH, attempt1Chain);

    const weak = getWeakConcept(evidence);
    expect(weak).not.toBeNull();
    expect(weak?.nodeId).toBe('condensation');
    expect(weak?.status).toBe('YELLOW');
    expect(weak?.label).toBe('Condensation');
  });

  it('identifies the first WHITE node when no YELLOW exists but WHITE exists', () => {
    // Chain with only Sun -> Heat -> Water (no YELLOW, but Evaporation onwards is WHITE)
    const partialChain = ['sun', 'heat', 'water'];
    const evidence = evaluateEvidence(WATER_CYCLE_GRAPH, partialChain);

    const weak = getWeakConcept(evidence);
    expect(weak).not.toBeNull();
    expect(weak?.nodeId).toBe('evaporation');
    expect(weak?.status).toBe('WHITE');
    expect(weak?.label).toBe('Evaporation');
  });

  it('returns null when all concepts are GREEN', () => {
    const fullChain = ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation', 'rain'];
    const evidence = evaluateEvidence(WATER_CYCLE_GRAPH, fullChain);

    const weak = getWeakConcept(evidence);
    expect(weak).toBeNull();
  });

  it('returns null or handles gracefully when evidence is empty or null', () => {
    expect(getWeakConcept(null)).toBeNull();
    expect(getWeakConcept(undefined)).toBeNull();
    expect(getWeakConcept({ results: {}, orderedResults: [], cleanChain: [] })).toBeNull();
  });
});

describe('SAMBHAV 2.0 Stage 2: Teacher Recap Engine (generateTeacherRecap)', () => {
  it('generates accurate recap for standard demo transition (YELLOW -> GREEN for condensation, Rain next)', () => {
    // Before: Condensation -> Sun -> Heat -> Water -> Evaporation -> Vapour
    const beforeChain = ['condensation', 'sun', 'heat', 'water', 'evaporation', 'vapour'];
    const beforeEvidence = evaluateEvidence(WATER_CYCLE_GRAPH, beforeChain);

    // After retry: Sun -> Heat -> Water -> Evaporation -> Vapour -> Condensation (no Rain)
    const afterChain = ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation'];
    const afterEvidence = evaluateEvidence(WATER_CYCLE_GRAPH, afterChain);

    // Verify after evidence has Sun-Condensation GREEN and Rain WHITE
    expect(afterEvidence.results['condensation'].status).toBe('GREEN');
    expect(afterEvidence.results['rain'].status).toBe('WHITE');

    const recap = generateTeacherRecap(beforeEvidence, afterEvidence);

    expect(recap.reinforcedNode?.nodeId).toBe('condensation');
    expect(recap.nextNode?.nodeId).toBe('rain');
    expect(recap.summarySentence).toBe('Condensation reinforced. Rain next.');
    expect(recap.suggestedFocus).toContain('Rain');
  });

  it('generates recap for a different before/after chain (e.g. Heat reinforced, Water next)', () => {
    // Before: Heat -> Sun
    const beforeChain = ['heat', 'sun']; // Sun is present after Heat -> Heat is YELLOW
    const beforeEvidence = evaluateEvidence(WATER_CYCLE_GRAPH, beforeChain);
    expect(beforeEvidence.results['heat'].status).toBe('YELLOW');

    // After: Sun -> Heat
    const afterChain = ['sun', 'heat'];
    const afterEvidence = evaluateEvidence(WATER_CYCLE_GRAPH, afterChain);
    expect(afterEvidence.results['heat'].status).toBe('GREEN');

    const recap = generateTeacherRecap(beforeEvidence, afterEvidence);
    expect(recap.reinforcedNode?.nodeId).toBe('heat');
    expect(recap.nextNode?.nodeId).toBe('water');
    expect(recap.summarySentence).toBe('Heat reinforced. Water next.');
  });

  it('handles scenario with no reinforcement transition (e.g. both attempts had no YELLOW->GREEN)', () => {
    const beforeChain = ['sun', 'heat'];
    const beforeEvidence = evaluateEvidence(WATER_CYCLE_GRAPH, beforeChain);

    const afterChain = ['sun', 'heat', 'water'];
    const afterEvidence = evaluateEvidence(WATER_CYCLE_GRAPH, afterChain);

    const recap = generateTeacherRecap(beforeEvidence, afterEvidence);
    expect(recap.reinforcedNode).toBeNull();
    expect(recap.nextNode?.nodeId).toBe('evaporation');
    expect(recap.summarySentence).toBe('No direct reinforcement transition. Evaporation next.');
  });

  it('handles scenario when all nodes are demonstrated after retry (no next WHITE node)', () => {
    // Before: Rain -> Sun -> Heat -> Water -> Evaporation -> Vapour -> Condensation
    const beforeChain = ['rain', 'sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation'];
    const beforeEvidence = evaluateEvidence(WATER_CYCLE_GRAPH, beforeChain);
    expect(beforeEvidence.results['rain'].status).toBe('YELLOW');

    // After: Sun -> Heat -> Water -> Evaporation -> Vapour -> Condensation -> Rain
    const afterChain = ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation', 'rain'];
    const afterEvidence = evaluateEvidence(WATER_CYCLE_GRAPH, afterChain);

    const recap = generateTeacherRecap(beforeEvidence, afterEvidence);
    expect(recap.reinforcedNode?.nodeId).toBe('rain');
    expect(recap.nextNode).toBeNull();
    expect(recap.summarySentence).toBe('Rain reinforced. All milestones demonstrated.');
  });
});

describe('SAMBHAV 2.0 Stage 2: Full Flow Test', () => {
  it('executes full flow without crashing and verifies data consistency', () => {
    // Step 1: Approved Graph exists
    expect(WATER_CYCLE_GRAPH.nodes.length).toBe(7);

    // Step 2: Attempt 1
    const attempt1Chain = ['condensation', 'sun', 'heat', 'water', 'evaporation', 'vapour'];
    const beforeEvidence = evaluateEvidence(WATER_CYCLE_GRAPH, attempt1Chain);
    expect(beforeEvidence.results['condensation'].status).toBe('YELLOW');

    // Step 3: Identify weak concept
    const weak = getWeakConcept(beforeEvidence);
    expect(weak?.nodeId).toBe('condensation');

    // Step 4: Reinforcement practice (grounded in Condensation explanation)
    expect(weak?.explanation).toContain('condensation');

    // Step 5: Second Teach-Back Retry: Sun -> Heat -> Water -> Evaporation -> Vapour -> Condensation
    const retryChain = ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation'];
    const afterEvidence = evaluateEvidence(WATER_CYCLE_GRAPH, retryChain);

    // Verify after evidence statuses
    expect(afterEvidence.results['sun'].status).toBe('GREEN');
    expect(afterEvidence.results['heat'].status).toBe('GREEN');
    expect(afterEvidence.results['water'].status).toBe('GREEN');
    expect(afterEvidence.results['evaporation'].status).toBe('GREEN');
    expect(afterEvidence.results['vapour'].status).toBe('GREEN');
    expect(afterEvidence.results['condensation'].status).toBe('GREEN');
    expect(afterEvidence.results['rain'].status).toBe('WHITE');

    // Step 6: Teacher Recap derivation
    const recap = generateTeacherRecap(beforeEvidence, afterEvidence);
    expect(recap.reinforcedNode?.nodeId).toBe('condensation');
    expect(recap.nextNode?.nodeId).toBe('rain');
    expect(recap.summarySentence).toBe('Condensation reinforced. Rain next.');
  });
});
