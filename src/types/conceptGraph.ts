export interface ConceptNode {
  id: string;
  label: string; // English
  kannadaLabel: string;
  symbol: string;
  explanation: string;
}

export interface ConceptEdge {
  from: string;
  to: string;
  relation: string;
}

export interface ConceptGraph {
  id: string;
  title: string;
  subtitle: string;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

export interface DistractorNode {
  id: string;
  label: string;
  kannadaLabel?: string;
  symbol: string;
}

export type EvidenceStatus = 'GREEN' | 'YELLOW' | 'WHITE';

export interface NodeEvidenceResult {
  nodeId: string;
  status: EvidenceStatus;
  statusLabel: string; // "Demonstrated" | "Needs reinforcement" | "Not yet demonstrated"
  explanation: string;
  symbol: string;
  label: string;
  kannadaLabel?: string;
}

export interface GraphEvidenceEvaluation {
  results: Record<string, NodeEvidenceResult>;
  orderedResults: NodeEvidenceResult[];
  cleanChain: string[];
}
