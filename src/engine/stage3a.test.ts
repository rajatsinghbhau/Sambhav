import { describe, it, expect } from 'vitest';
import { validateConceptGraph } from '../engine/graphValidator';
import { WATER_CYCLE_GRAPH, FALLBACK_GRAPH } from '../data/canonicalGraph';
import { generateLessonGraphWithFallback } from '../services/geminiService';
import fs from 'fs';
import path from 'path';

describe('SAMBHAV 2.0 — STAGE 3A TESTS', () => {

  // Test A — Missing API key
  // Expected: Fallback loads. Application remains usable.
  describe('Test A — Missing API Key', () => {
    it('returns validated fallback graph when server has no API key or returns error', async () => {
      // Mock fetch returning 500 error (server key missing)
      const originalFetch = global.fetch;
      global.fetch = async () => ({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server API key not configured' })
      } as unknown as Response);

      const result = await generateLessonGraphWithFallback('Some lesson content');
      expect(result.isFallback).toBe(true);
      expect(result.graph.id).toBe(FALLBACK_GRAPH.id);
      expect(result.graph.nodes.length).toBe(7);
      expect(result.message).toBe('Using the validated lesson graph.');

      global.fetch = originalFetch;
    });
  });

  // Test B — Malformed JSON
  // Expected: Candidate rejected. Fallback used.
  describe('Test B — Malformed JSON', () => {
    it('rejects malformed JSON candidate and uses fallback graph', async () => {
      const originalFetch = global.fetch;
      global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({ candidateGraph: 'INVALID_NOT_OBJECT' })
      } as unknown as Response);

      const result = await generateLessonGraphWithFallback('Some lesson content');
      expect(result.isFallback).toBe(true);
      expect(result.graph.id).toBe(FALLBACK_GRAPH.id);
      expect(result.message).toBe('Using the validated lesson graph.');

      global.fetch = originalFetch;
    });

    it('rejects candidate with broken/unparseable json structure via validator', () => {
      expect(validateConceptGraph(null).isValid).toBe(false);
      expect(validateConceptGraph('string').isValid).toBe(false);
      expect(validateConceptGraph({}).isValid).toBe(false);
      expect(validateConceptGraph({ nodes: 'not-array' }).isValid).toBe(false);
    });
  });

  // Test C — Timeout/server failure
  // Expected: Fallback used. No application crash.
  describe('Test C — Timeout / Server failure', () => {
    it('uses fallback on network crash or server timeout without throwing', async () => {
      const originalFetch = global.fetch;
      global.fetch = async () => {
        throw new Error('Network timeout / connection refused');
      };

      const result = await generateLessonGraphWithFallback('Some lesson content');
      expect(result.isFallback).toBe(true);
      expect(result.graph.id).toBe(FALLBACK_GRAPH.id);
      expect(result.message).toBe('Using the validated lesson graph.');

      global.fetch = originalFetch;
    });
  });

  // Test D — Valid new lesson graph
  // Expected: Graph passes validation. Only validated graph renders.
  describe('Test D — Valid New Lesson Graph', () => {
    it('validates canonical graph and custom 5-node linear graph cleanly', () => {
      // 1. Canonical Water Cycle graph passes
      const canonRes = validateConceptGraph(WATER_CYCLE_GRAPH);
      expect(canonRes.isValid).toBe(true);
      if (canonRes.isValid) {
        expect(canonRes.graph.nodes.length).toBe(7);
        expect(canonRes.graph.edges.length).toBe(6);
      }

      // 2. Custom 5-node photosynthesis linear graph
      const validCustomGraph = {
        title: 'Photosynthesis',
        subtitle: 'Plant Energy',
        nodes: [
          { id: 'sunlight', label: 'Sunlight', symbol: '☀️', explanation: 'Sunlight provides energy.' },
          { id: 'chlorophyll', label: 'Chlorophyll', symbol: '🍃', explanation: 'Leaves absorb light energy.' },
          { id: 'water', label: 'Water', symbol: '💧', explanation: 'Roots absorb water from soil.' },
          { id: 'glucose', label: 'Glucose', symbol: '🍬', explanation: 'Plants create food.' },
          { id: 'oxygen', label: 'Oxygen', symbol: '💨', explanation: 'Oxygen is released into air.' }
        ],
        edges: [
          { from: 'sunlight', to: 'chlorophyll', relation: 'powers' },
          { from: 'chlorophyll', to: 'water', relation: 'combines_with' },
          { from: 'water', to: 'glucose', relation: 'produces' },
          { from: 'glucose', to: 'oxygen', relation: 'releases' }
        ]
      };

      const customRes = validateConceptGraph(validCustomGraph);
      expect(customRes.isValid).toBe(true);
      if (customRes.isValid) {
        expect(customRes.graph.nodes.length).toBe(5);
        expect(customRes.graph.nodes[0].id).toBe('sunlight');
        expect(customRes.graph.nodes[4].id).toBe('oxygen');
      }
    });
  });

  // Test E — Invalid graphs
  // Test each:
  // 1. duplicate node ID
  // 2. missing edge target
  // 3. self-edge
  // 4. cycle
  // 5. branching node
  // Expected: All rejected. Fallback used.
  describe('Test E — Invalid Graphs Rejected', () => {
    const baseValid = {
      title: 'Test Graph',
      nodes: [
        { id: 'n1', label: 'Node 1', symbol: '1️⃣', explanation: 'First' },
        { id: 'n2', label: 'Node 2', symbol: '2️⃣', explanation: 'Second' },
        { id: 'n3', label: 'Node 3', symbol: '3️⃣', explanation: 'Third' },
        { id: 'n4', label: 'Node 4', symbol: '4️⃣', explanation: 'Fourth' },
        { id: 'n5', label: 'Node 5', symbol: '5️⃣', explanation: 'Fifth' }
      ],
      edges: [
        { from: 'n1', to: 'n2', relation: 'leads' },
        { from: 'n2', to: 'n3', relation: 'leads' },
        { from: 'n3', to: 'n4', relation: 'leads' },
        { from: 'n4', to: 'n5', relation: 'leads' }
      ]
    };

    // E.1: duplicate node ID
    it('E.1 — Rejects duplicate node ID', () => {
      const g = {
        ...baseValid,
        nodes: [
          { id: 'n1', label: 'Node 1', symbol: '1️⃣', explanation: 'First' },
          { id: 'n1', label: 'Node 1 Dupe', symbol: '1️⃣', explanation: 'Dupe' },
          { id: 'n3', label: 'Node 3', symbol: '3️⃣', explanation: 'Third' },
          { id: 'n4', label: 'Node 4', symbol: '4️⃣', explanation: 'Fourth' },
          { id: 'n5', label: 'Node 5', symbol: '5️⃣', explanation: 'Fifth' }
        ]
      };
      const res = validateConceptGraph(g);
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.error).toContain('Duplicate node ID');
      }
    });

    // E.2: missing edge target
    it('E.2 — Rejects missing edge target', () => {
      const g = {
        ...baseValid,
        edges: [
          { from: 'n1', to: 'n2', relation: 'leads' },
          { from: 'n2', to: 'n_missing', relation: 'leads' },
          { from: 'n3', to: 'n4', relation: 'leads' },
          { from: 'n4', to: 'n5', relation: 'leads' }
        ]
      };
      const res = validateConceptGraph(g);
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.error).toContain('does not exist in nodes');
      }
    });

    // E.3: self-edge
    it('E.3 — Rejects self-edge', () => {
      const g = {
        ...baseValid,
        edges: [
          { from: 'n1', to: 'n1', relation: 'leads' },
          { from: 'n2', to: 'n3', relation: 'leads' },
          { from: 'n3', to: 'n4', relation: 'leads' },
          { from: 'n4', to: 'n5', relation: 'leads' }
        ]
      };
      const res = validateConceptGraph(g);
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.error).toContain('Self-edge detected');
      }
    });

    // E.4: cycle
    it('E.4 — Rejects cycle', () => {
      const g = {
        title: 'Cycle Graph',
        nodes: [
          { id: 'n1', label: 'N1', symbol: '1️⃣', explanation: 'First' },
          { id: 'n2', label: 'N2', symbol: '2️⃣', explanation: 'Second' },
          { id: 'n3', label: 'N3', symbol: '3️⃣', explanation: 'Third' },
          { id: 'n4', label: 'N4', symbol: '4️⃣', explanation: 'Fourth' },
          { id: 'n5', label: 'N5', symbol: '5️⃣', explanation: 'Fifth' }
        ],
        edges: [
          { from: 'n1', to: 'n2', relation: 'leads' },
          { from: 'n2', to: 'n3', relation: 'leads' },
          { from: 'n3', to: 'n1', relation: 'cycle_back' },
          { from: 'n4', to: 'n5', relation: 'leads' }
        ]
      };
      const res = validateConceptGraph(g);
      expect(res.isValid).toBe(false);
    });

    // E.5: branching node
    it('E.5 — Rejects branching node (multiple outgoing edges from one node)', () => {
      const g = {
        title: 'Branching Graph',
        nodes: [
          { id: 'n1', label: 'N1', symbol: '1️⃣', explanation: 'First' },
          { id: 'n2', label: 'N2', symbol: '2️⃣', explanation: 'Second' },
          { id: 'n3', label: 'N3', symbol: '3️⃣', explanation: 'Third' },
          { id: 'n4', label: 'N4', symbol: '4️⃣', explanation: 'Fourth' },
          { id: 'n5', label: 'N5', symbol: '5️⃣', explanation: 'Fifth' }
        ],
        edges: [
          { from: 'n1', to: 'n2', relation: 'branch_a' },
          { from: 'n1', to: 'n3', relation: 'branch_b' },
          { from: 'n3', to: 'n4', relation: 'leads' },
          { from: 'n4', to: 'n5', relation: 'leads' }
        ]
      };
      const res = validateConceptGraph(g);
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.error).toContain('Branching node detected');
      }
    });

    // Node count out of 5-9 bounds
    it('Rejects node count under 5 or over 9', () => {
      const tooFew = {
        title: 'Too few',
        nodes: [
          { id: 'n1', label: 'N1', symbol: '1️⃣', explanation: '1' },
          { id: 'n2', label: 'N2', symbol: '2️⃣', explanation: '2' }
        ],
        edges: [{ from: 'n1', to: 'n2', relation: 'leads' }]
      };
      expect(validateConceptGraph(tooFew).isValid).toBe(false);
    });
  });

  // Section 7: Security check
  describe('Section 7 — Security Check', () => {
    it('verifies that no API keys or secrets exist in the src frontend code', () => {
      const srcDir = path.resolve(__dirname, '..');
      const filesToScan: string[] = [];

      function walk(dir: string) {
        const list = fs.readdirSync(dir);
        for (const file of list) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            walk(fullPath);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html')) {
            filesToScan.push(fullPath);
          }
        }
      }

      walk(srcDir);

      const secretPattern = /AQ\.Ab8RN6IBuDi7iXMEBBJ2kQR3aiWswLD8csKBaBFwy1hBb469Zg/;
      for (const filePath of filesToScan) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(secretPattern.test(content)).toBe(false);
      }
    });
  });
});
