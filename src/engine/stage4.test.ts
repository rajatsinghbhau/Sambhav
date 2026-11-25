import { describe, it, expect, beforeEach } from 'vitest';
import { WATER_CYCLE_GRAPH } from '../data/canonicalGraph';
import { DEMO_STUDENTS, SIMPLIFIED_EXPLANATIONS } from '../data/stage4Data';
import {
  getTeachingSuggestions,
  createDefaultTeachingPlan,
  getClassSnapshot,
  generateInitialRevisionQueue,
  generateExamRevisionPlan
} from './stage4Engine';
import { offlineStorage } from '../utils/offlinePersistence';
import { Doubt } from '../types/stage4';

describe('SAMBHAV 2.0 — STAGE 4 TESTS: TEACHER INTELLIGENCE + STUDENT SUPPORT', () => {
  beforeEach(() => {
    offlineStorage.clear();
  });

  // --- 1. CLASS LEARNING SNAPSHOT TESTS ---
  describe('1. Class Snapshot', () => {
    it('correctly aggregates evidence across 6 fictional students using real evaluateEvidence', () => {
      const snapshot = getClassSnapshot(DEMO_STUDENTS, WATER_CYCLE_GRAPH);

      // Verify all canonical nodes are accounted for
      expect(Object.keys(snapshot).length).toBe(7);

      // Sun is present in all 6 students at valid positions -> all 6 GREEN
      expect(snapshot.sun.green).toBe(6);
      expect(snapshot.sun.yellow).toBe(0);
      expect(snapshot.sun.white).toBe(0);

      // Condensation:
      // Ananya: yellow (condensation before vapour)
      // Rahul: green (sun -> heat -> water -> evap -> vapour -> condensation)
      // Meera: yellow (evaporation missing)
      // Arjun: white (chain ended at vapour)
      // Kavya: yellow (condensation before sun)
      // Rohan: green (full sequence)
      // Total: 2 green, 3 yellow, 1 white = 6
      expect(snapshot.condensation.green).toBe(2);
      expect(snapshot.condensation.yellow).toBe(3);
      expect(snapshot.condensation.white).toBe(1);
    });

    it('produces 100% deterministic snapshot on repeated runs', () => {
      const run1 = getClassSnapshot(DEMO_STUDENTS, WATER_CYCLE_GRAPH);
      const run2 = getClassSnapshot(DEMO_STUDENTS, WATER_CYCLE_GRAPH);
      expect(run1).toEqual(run2);
    });
  });

  // --- 2. PRE-CLASS TEACHING SUGGESTIONS TESTS ---
  describe('2. Pre-Class Teaching Suggestions', () => {
    it('returns curated deterministic teaching activities for condensation', () => {
      const suggestions = getTeachingSuggestions('condensation');
      expect(suggestions.length).toBeGreaterThanOrEqual(3);

      const coldGlass = suggestions.find(s => s.id === 'cold-glass');
      expect(coldGlass).toBeDefined();
      expect(coldGlass?.type).toBe('Hands-on');
      expect(coldGlass?.duration).toBe(5);
      expect(coldGlass?.description).toContain('cold glass');
      expect(coldGlass?.inclusiveTip).toBeDefined();
    });

    it('works pre-class without needing student failure or previous evidence', () => {
      // Calling getTeachingSuggestions without any prior evaluateEvidence
      const suggestions = getTeachingSuggestions('evaporation');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.conceptIds.includes('evaporation'))).toBe(true);
    });

    it('produces identical suggestions for the same concept on multiple calls', () => {
      const call1 = getTeachingSuggestions('condensation');
      const call2 = getTeachingSuggestions('condensation');
      expect(call1).toEqual(call2);
    });
  });

  // --- 3. TEACHING PLANNER TESTS ---
  describe('3. Teaching Planner', () => {
    it('creates a default plan totaling exactly 45 minutes across 6 phases', () => {
      const plan = createDefaultTeachingPlan('Water Cycle', 'condensation');
      expect(plan.totalDuration).toBe(45);
      expect(plan.items.length).toBe(6);

      // Verify the 6 phases
      const phases = plan.items.map(i => i.phase);
      expect(phases).toEqual([
        'Retrieve / Revise',
        'Hook',
        'Teach',
        'Engage Everyone',
        'Check',
        'Wrap-up'
      ]);

      const sumMinutes = plan.items.reduce((acc, it) => acc + it.duration, 0);
      expect(sumMinutes).toBe(45);
    });

    it('supports editing phase durations and saving to offline storage', () => {
      const plan = createDefaultTeachingPlan('Water Cycle', 'condensation');
      // Modify Teach phase to 20 mins and Wrap-up to 10 mins (total 50)
      plan.items[2].duration = 20;
      plan.items[5].duration = 10;
      plan.totalDuration = plan.items.reduce((acc, it) => acc + it.duration, 0);

      offlineStorage.saveTeachingPlan(plan);
      const loaded = offlineStorage.loadTeachingPlan();

      expect(loaded).not.toBeNull();
      expect(loaded?.totalDuration).toBe(55);
      expect(loaded?.items[2].duration).toBe(20);
      expect(loaded?.items[5].duration).toBe(10);
    });
  });

  // --- 4. STUDENT DOUBTS & TEACHER INBOX TESTS ---
  describe('4. Student Doubts and Teacher Response Loop', () => {
    it('allows student to create doubt, teacher to answer, and student to read explanation', () => {
      // Step A: Student asks a doubt
      const initialDoubts: Doubt[] = [];
      const newDoubt: Doubt = {
        id: 'doubt-test-1',
        studentId: 's-ananya',
        studentName: 'Ananya',
        conceptId: 'condensation',
        conceptSymbol: '☁️',
        conceptLabel: 'Condensation',
        question: 'Why does water vapour become drops on cold glass?',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      initialDoubts.push(newDoubt);
      offlineStorage.saveDoubts(initialDoubts);

      // Step B: Teacher retrieves doubt from inbox
      const teacherInbox = offlineStorage.loadDoubts();
      expect(teacherInbox.length).toBe(1);
      expect(teacherInbox[0].status).toBe('pending');
      expect(teacherInbox[0].question).toContain('cold glass');

      // Step C: Teacher answers and marks resolved
      teacherInbox[0].answer = 'When water vapour touches the cold glass, it cools and turns into liquid water droplets.';
      teacherInbox[0].status = 'resolved';
      teacherInbox[0].answeredAt = new Date().toISOString();
      offlineStorage.saveDoubts(teacherInbox);

      // Step D: Student sees teacher explanation
      const studentView = offlineStorage.loadDoubts();
      expect(studentView[0].status).toBe('resolved');
      expect(studentView[0].answer).toContain('turns into liquid water droplets');
    });
  });

  // --- 5. SIMPLIFIED EXPLANATIONS TESTS ---
  describe('5. Simplified Explanations', () => {
    it('provides offline simplified explanations and concrete real-life examples for every node', () => {
      for (const node of WATER_CYCLE_GRAPH.nodes) {
        const item = SIMPLIFIED_EXPLANATIONS[node.id];
        expect(item).toBeDefined();
        expect(item.conceptLabel).toBe(node.label);
        expect(item.simpleExplanation.length).toBeGreaterThan(10);
        expect(item.realLifeExample.length).toBeGreaterThan(10);
        expect(item.visualPrompt.length).toBeGreaterThan(5);
      }
    });
  });

  // --- 6. REVISION QUEUE & EXAM PLANNER TESTS ---
  describe('6. Revision Queue & Exam Revision Planner', () => {
    it('generates deterministic spaced revision schedule with reinforcement concepts due today', () => {
      const queue = generateInitialRevisionQueue(WATER_CYCLE_GRAPH, new Date('2026-11-25T12:00:00Z'));
      expect(queue.length).toBeGreaterThanOrEqual(4);

      // Condensation due today because of reinforcement
      const cond = queue.find(q => q.conceptId === 'condensation');
      expect(cond).toBeDefined();
      expect(cond?.section).toBe('due_today');
      expect(cond?.reason).toContain('Reinforcement');

      // Spaced items
      const vapour = queue.find(q => q.conceptId === 'vapour');
      expect(vapour?.section).toBe('coming_up');

      const sun = queue.find(q => q.conceptId === 'sun');
      expect(sun?.section).toBe('before_exam');
    });

    it('generates a 7-day deterministic exam revision roadmap editable by teacher', () => {
      const examPlan = generateExamRevisionPlan('2026-12-15');
      expect(examPlan.totalDays).toBe(7);
      expect(examPlan.sessions.length).toBe(7);
      expect(examPlan.sessions[0].dayTitle).toContain('Day 1');
      expect(examPlan.sessions[4].topic).toContain('Reinforcement');

      // Teacher edits plan
      examPlan.sessions[0].duration = 45;
      offlineStorage.saveExamPlan(examPlan);

      const reloaded = offlineStorage.loadExamPlan();
      expect(reloaded?.sessions[0].duration).toBe(45);
    });
  });

  // --- 7. ROLE-SEPARATED DEMO ACCESS TESTS ---
  describe('7. Role-Separated Demo Access (Student vs Teacher)', () => {
    it('persists and switches user roles cleanly between student and teacher', () => {
      // Step A: Save student role
      offlineStorage.saveCurrentRole('student');
      expect(offlineStorage.loadCurrentRole()).toBe('student');

      // Step B: Switch to teacher role
      offlineStorage.saveCurrentRole('teacher');
      expect(offlineStorage.loadCurrentRole()).toBe('teacher');

      // Step C: Log out to selector portal
      offlineStorage.saveCurrentRole(null);
      expect(offlineStorage.loadCurrentRole()).toBeNull();
    });
  });
});
