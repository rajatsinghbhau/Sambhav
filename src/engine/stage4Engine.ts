import { ConceptGraph } from '../types/conceptGraph';
import { evaluateEvidence } from './evidenceEngine';
import {
  TeachingActivity,
  TeachingPlan,
  FictionalStudent,
  ClassSnapshot,
  RevisionItem,
  ExamRevisionPlan
} from '../types/stage4';
import { CURATED_ACTIVITIES, DEMO_STUDENTS } from '../data/stage4Data';

/**
 * PART 2 & 3 — PRE-CLASS TEACHING SUPPORT
 * Retrieves deterministic curated activities for a concept.
 * Does NOT depend on students first failing.
 */
export function getTeachingSuggestions(conceptId: string): TeachingActivity[] {
  const matches = CURATED_ACTIVITIES.filter(act => act.conceptIds.includes(conceptId));
  if (matches.length > 0) {
    return matches;
  }
  // Fallback to general activities
  return CURATED_ACTIVITIES.slice(0, 3);
}

/**
 * PART 4 — TEACHING PLANNER
 * Default 45-minute plan:
 * 5 min  — Retrieve / Revise
 * 5 min  — Hook
 * 15 min — Teach
 * 10 min — Engage Everyone
 * 5 min  — Check
 * 5 min  — Wrap-up
 * Total = 45 min
 */
export function createDefaultTeachingPlan(
  lessonTitle: string = 'Water Cycle',
  featuredConceptId: string = 'condensation'
): TeachingPlan {
  return {
    id: `plan-${Date.now()}`,
    lessonTitle,
    totalDuration: 45,
    teacherNote: 'Plan prepared for inclusive multi-modal participation. Teacher decides.',
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        phase: 'Retrieve / Revise',
        title: 'Review previous concept (Evaporation & Vapour)',
        duration: 5,
        description: 'Ask: What happens when liquid water is heated by the Sun?',
        conceptId: 'evaporation'
      },
      {
        id: 'item-2',
        phase: 'Hook',
        title: 'Cold Glass Observation Hook',
        duration: 5,
        description: 'Ask: “Why do water drops appear on the outside of a cold glass?”',
        conceptId: featuredConceptId,
        activityId: 'cold-glass'
      },
      {
        id: 'item-3',
        phase: 'Teach',
        title: 'Teach with Concept Graph',
        duration: 15,
        description: 'Use the Concept Graph sequence to walk through Vapour → Cooling → Condensation.',
        conceptId: featuredConceptId
      },
      {
        id: 'item-4',
        phase: 'Engage Everyone',
        title: 'Visual + Movement + AAC Practice',
        duration: 10,
        description: 'Students act as cooling water particles, touch communication boards, and observe visual droplet formation.',
        conceptId: featuredConceptId,
        activityId: 'condensation-movement'
      },
      {
        id: 'item-5',
        phase: 'Check',
        title: 'Check understanding on Concept Graph',
        duration: 5,
        description: 'Students place Condensation in the milestone sequence on their individual screens.',
        conceptId: featuredConceptId
      },
      {
        id: 'item-6',
        phase: 'Wrap-up',
        title: 'Teach-Back + Student Doubts',
        duration: 5,
        description: 'Students complete Teach-Back attempt and submit any open doubts before class ends.',
        conceptId: featuredConceptId
      }
    ]
  };
}

/**
 * PART 5 — CLASS LEARNING SNAPSHOT
 * Runs 6 fictional student chains through the EXISTING real evaluateEvidence(graph, chain).
 * Never hardcodes evidence colors.
 */
export function getClassSnapshot(
  students: FictionalStudent[] = DEMO_STUDENTS,
  graph: ConceptGraph
): ClassSnapshot {
  const snapshot: ClassSnapshot = {};

  // Initialize all canonical graph nodes
  for (const node of graph.nodes) {
    snapshot[node.id] = {
      conceptId: node.id,
      label: node.label,
      symbol: node.symbol,
      green: 0,
      yellow: 0,
      white: 0
    };
  }

  // Evaluate each student deterministically
  for (const student of students) {
    const evaluation = evaluateEvidence(graph, student.initialChain);
    for (const res of evaluation.orderedResults) {
      if (snapshot[res.nodeId]) {
        if (res.status === 'GREEN') {
          snapshot[res.nodeId].green += 1;
        } else if (res.status === 'YELLOW') {
          snapshot[res.nodeId].yellow += 1;
        } else if (res.status === 'WHITE') {
          snapshot[res.nodeId].white += 1;
        }
      }
    }
  }

  return snapshot;
}

/**
 * PART 10 & 11 — REVISION ENGINE & QUEUE
 * Post-class revision schedule:
 * +2 days, +7 days, +21 days, Exam revision
 */
export function generateInitialRevisionQueue(
  graph: ConceptGraph,
  baseDate: Date = new Date()
): RevisionItem[] {
  const formatDate = (daysAhead: number) => {
    const d = new Date(baseDate.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'rev-cond-today',
      conceptId: 'condensation',
      conceptSymbol: '☁️',
      conceptLabel: 'Condensation',
      lessonId: graph.id,
      dueDate: formatDate(0), // Today
      reason: 'Reinforcement needed across classroom attempt 1',
      section: 'due_today',
      status: 'pending'
    },
    {
      id: 'rev-vapour-upcoming',
      conceptId: 'vapour',
      conceptSymbol: '💨',
      conceptLabel: 'Vapour',
      lessonId: graph.id,
      dueDate: formatDate(2), // +2 days
      reason: 'Scheduled reinforcement check (+2 days)',
      section: 'coming_up',
      status: 'pending'
    },
    {
      id: 'rev-evap-upcoming',
      conceptId: 'evaporation',
      conceptSymbol: '⬆️',
      conceptLabel: 'Evaporation',
      lessonId: graph.id,
      dueDate: formatDate(7), // +7 days
      reason: 'Milestone spaced retention (+7 days)',
      section: 'coming_up',
      status: 'pending'
    },
    {
      id: 'rev-sun-exam',
      conceptId: 'sun',
      conceptSymbol: '☀️',
      conceptLabel: 'Sun & Solar Energy',
      lessonId: graph.id,
      dueDate: formatDate(21), // +21 days
      reason: 'Comprehensive Unit Exam preparation',
      section: 'before_exam',
      status: 'pending'
    }
  ];
}

/**
 * PART 12 — EXAM REVISION PLANNER
 * Deterministic 7-day revision plan based on curriculum history.
 * No LLM generation.
 */
export function generateExamRevisionPlan(
  examDateStr: string = '2026-12-15'
): ExamRevisionPlan {
  return {
    id: `exam-plan-${Date.now()}`,
    examDate: examDateStr,
    totalDays: 7,
    sessions: [
      {
        dayNumber: 1,
        dayTitle: 'Day 1 — Foundation Milestone',
        topic: 'Water Cycle Overview',
        conceptIds: ['sun', 'heat', 'water'],
        description: 'Review solar energy, thermal heat, and liquid bodies.',
        duration: 30
      },
      {
        dayNumber: 2,
        dayTitle: 'Day 2 — States of Water',
        topic: 'States of Matter & Phase Changes',
        conceptIds: ['water', 'evaporation', 'vapour'],
        description: 'Solid, liquid, and gas transformations in nature.',
        duration: 35
      },
      {
        dayNumber: 3,
        dayTitle: 'Day 3 — Atmosphere Dynamics',
        topic: 'Evaporation + Condensation',
        conceptIds: ['evaporation', 'vapour', 'condensation'],
        description: 'Deep dive into cooling vapour and water droplet formation on cold surfaces.',
        duration: 40
      },
      {
        dayNumber: 4,
        dayTitle: 'Day 4 — Interactive Teach-Back',
        topic: 'Mixed Teach-Back Practice',
        conceptIds: ['sun', 'evaporation', 'condensation', 'rain'],
        description: 'Students assemble milestone chains using multi-modal AAC boards.',
        duration: 35
      },
      {
        dayNumber: 5,
        dayTitle: 'Day 5 — Targeted Strengthening',
        topic: 'Concepts Needing Reinforcement',
        conceptIds: ['condensation'],
        description: 'Focused hands-on cold glass observation and partner explanations.',
        duration: 40
      },
      {
        dayNumber: 6,
        dayTitle: 'Day 6 — Full Concept Graph',
        topic: 'Full Cycle Synthesis',
        conceptIds: ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation', 'rain'],
        description: 'Complete 7-step sequence walkthrough from sunlight to rainfall.',
        duration: 45
      },
      {
        dayNumber: 7,
        dayTitle: 'Day 7 — Quick Recall & Doubts',
        topic: 'Pre-Exam Confidence Check',
        conceptIds: ['condensation', 'rain'],
        description: 'Resolve outstanding student doubts and quick-fire symbol recognition.',
        duration: 25
      }
    ]
  };
}
