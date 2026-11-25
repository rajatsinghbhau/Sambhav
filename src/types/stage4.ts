import { ConceptGraph } from './conceptGraph';

export type ActivityType =
  | 'Visual'
  | 'Hands-on'
  | 'Movement'
  | 'Pair Activity'
  | 'Group Activity'
  | 'Communication'
  | 'Quick Demonstration'
  | 'Teach-Back';

export interface TeachingActivity {
  id: string;
  title: string;
  type: ActivityType;
  conceptIds: string[];
  duration: number; // in minutes
  description: string;
  inclusiveTip: string;
}

export interface TeachingPlanItem {
  id: string;
  phase: 'Retrieve / Revise' | 'Hook' | 'Teach' | 'Engage Everyone' | 'Check' | 'Wrap-up';
  title: string;
  duration: number; // minutes
  description: string;
  activityId?: string;
  conceptId?: string;
}

export interface TeachingPlan {
  id: string;
  lessonTitle: string;
  totalDuration: number; // default 45 mins
  items: TeachingPlanItem[];
  teacherNote?: string;
  updatedAt: string;
}

export interface FictionalStudent {
  id: string;
  name: string;
  initialChain: string[]; // Scripted Teach-Back chain evaluated through real evaluateEvidence
}

export interface ConceptEvidenceCounts {
  conceptId: string;
  label: string;
  symbol: string;
  green: number;
  yellow: number;
  white: number;
}

export type ClassSnapshot = Record<string, ConceptEvidenceCounts>;

export interface StudentActivityLog {
  id: string;
  studentId: string;
  studentName: string;
  lessonTitle: string;
  events: string[];
  demonstratedConcepts: string[];
  reinforceConcepts: string[];
  nextConcept?: string;
}

export interface Doubt {
  id: string;
  studentId: string;
  studentName: string;
  conceptId: string;
  conceptSymbol: string;
  conceptLabel: string;
  question: string;
  answer?: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  answeredAt?: string;
}

export interface SimplifiedExplanation {
  conceptId: string;
  conceptSymbol: string;
  conceptLabel: string;
  simpleExplanation: string;
  realLifeExample: string;
  visualPrompt: string;
}

export type RevisionQueueSection = 'due_today' | 'coming_up' | 'before_exam';

export interface RevisionItem {
  id: string;
  conceptId: string;
  conceptSymbol: string;
  conceptLabel: string;
  lessonId: string;
  dueDate: string; // YYYY-MM-DD
  reason: string;
  section: RevisionQueueSection;
  status: 'pending' | 'completed';
}

export interface ExamRevisionSession {
  dayNumber: number;
  dayTitle: string;
  topic: string;
  conceptIds: string[];
  description: string;
  duration: number; // minutes
}

export interface ExamRevisionPlan {
  id: string;
  examDate: string;
  totalDays: number;
  sessions: ExamRevisionSession[];
}

export interface LearnedTopic {
  id: string;
  title: string;
  titleKn?: string;
  subtitle: string;
  symbol: string;
  graph: ConceptGraph;
  learnedDate: string;
  status: 'mastered' | 'revision_due' | 'in_progress';
  revisionsCompleted: number;
  lastRevisedAt?: string;
}

export type RevisionQuestionType =
  | 'visual_symbol'
  | 'real_life'
  | 'cause_effect'
  | 'sensory_observation'
  | 'curriculum_sequence'
  | 'concept_check'
  | string;

export interface RevisionCheckpointQuestion {
  id: string;
  type: RevisionQuestionType;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExamRevisionCheckpoint {
  conceptId: string;
  conceptLabel: string;
  memoryHook: string;
  questions: RevisionCheckpointQuestion[];
}
