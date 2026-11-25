import { ConceptGraph, GraphEvidenceEvaluation, NodeEvidenceResult } from '../types/conceptGraph';

/**
 * Pure deterministic evidence evaluation function.
 * Evaluates a child's conceptual sequence against the canonical Concept Graph.
 *
 * Rules:
 * 1. Filter out distractors and unknown IDs.
 * 2. Use the earliest occurrence of each canonical node.
 * 3. Duplicates provide no additional evidence.
 * 4. Evaluate canonical nodes in graph order.
 * 5. If a node is absent: status = WHITE ("Not yet demonstrated")
 * 6. If the first node is present: status = GREEN ("Demonstrated")
 * 7. For every other node:
 *    - if its required predecessor appears anywhere earlier in the child's chain -> GREEN
 *    - if the node exists but its predecessor is missing or appears later -> YELLOW
 * 8. Adjacency is NOT required.
 * 9. Same graph + same child chain must always produce the same result.
 * 10. Never produce scores, percentages, grades or "AI grade".
 */
export function evaluateEvidence(
  graph: ConceptGraph,
  childChain: string[]
): GraphEvidenceEvaluation {
  // Set of valid canonical node IDs in this graph
  const canonicalIds = new Set(graph.nodes.map(n => n.id));

  // 1. Filter out distractors and unknown IDs
  // 2 & 3. Keep earliest occurrence of each canonical node
  const cleanChain: string[] = [];
  const seenInClean = new Set<string>();

  for (const id of childChain) {
    if (canonicalIds.has(id)) {
      if (!seenInClean.has(id)) {
        seenInClean.add(id);
        cleanChain.push(id);
      }
    }
  }

  // Precompute map of node id -> position (index) in clean chain
  const cleanIndexMap = new Map<string, number>();
  cleanChain.forEach((id, idx) => {
    cleanIndexMap.set(id, idx);
  });

  const results: Record<string, NodeEvidenceResult> = {};
  const orderedResults: NodeEvidenceResult[] = [];

  // 4. Evaluate canonical nodes in graph order
  graph.nodes.forEach((node, nodeIndex) => {
    const isPresent = cleanIndexMap.has(node.id);

    if (!isPresent) {
      // 5. If a node is absent
      const res: NodeEvidenceResult = {
        nodeId: node.id,
        status: 'WHITE',
        statusLabel: 'Not yet demonstrated',
        explanation: node.explanation,
        symbol: node.symbol,
        label: node.label,
        kannadaLabel: node.kannadaLabel
      };
      results[node.id] = res;
      orderedResults.push(res);
      return;
    }

    if (nodeIndex === 0) {
      // 6. If the first node is present
      const res: NodeEvidenceResult = {
        nodeId: node.id,
        status: 'GREEN',
        statusLabel: 'Demonstrated',
        explanation: node.explanation,
        symbol: node.symbol,
        label: node.label,
        kannadaLabel: node.kannadaLabel
      };
      results[node.id] = res;
      orderedResults.push(res);
      return;
    }

    // 7. For every other node:
    // «The rule checks that the predecessor appears earlier in the child chain, not that the entire chain is correct.»
    const predecessor = graph.nodes[nodeIndex - 1];
    const currentNodePos = cleanIndexMap.get(node.id)!;
    const predecessorPos = cleanIndexMap.get(predecessor.id);

    const hasPredecessorEarlier =
      predecessorPos !== undefined && predecessorPos < currentNodePos;

    if (hasPredecessorEarlier) {
      const res: NodeEvidenceResult = {
        nodeId: node.id,
        status: 'GREEN',
        statusLabel: 'Demonstrated',
        explanation: node.explanation,
        symbol: node.symbol,
        label: node.label,
        kannadaLabel: node.kannadaLabel
      };
      results[node.id] = res;
      orderedResults.push(res);
    } else {
      const res: NodeEvidenceResult = {
        nodeId: node.id,
        status: 'YELLOW',
        statusLabel: 'Needs reinforcement',
        explanation: node.explanation,
        symbol: node.symbol,
        label: node.label,
        kannadaLabel: node.kannadaLabel
      };
      results[node.id] = res;
      orderedResults.push(res);
    }
  });

  return {
    results,
    orderedResults,
    cleanChain
  };
}

/**
 * Stage 2: Targeted Reinforcement
 * Identifies the weak concept needing immediate pedagogical attention.
 * Priority:
 * 1. first YELLOW node
 * 2. otherwise first WHITE node
 * 3. otherwise null
 */
export function getWeakConcept(evidence: GraphEvidenceEvaluation | null | undefined): NodeEvidenceResult | null {
  if (!evidence || !evidence.orderedResults || evidence.orderedResults.length === 0) {
    return null;
  }

  // 1. First YELLOW node
  const yellowNode = evidence.orderedResults.find(n => n.status === 'YELLOW');
  if (yellowNode) {
    return yellowNode;
  }

  // 2. Otherwise first WHITE node
  const whiteNode = evidence.orderedResults.find(n => n.status === 'WHITE');
  if (whiteNode) {
    return whiteNode;
  }

  // 3. Otherwise null (all GREEN)
  return null;
}

export interface TeacherRecap {
  reinforcedNode: NodeEvidenceResult | null;
  nextNode: NodeEvidenceResult | null;
  summarySentence: string;
  suggestedFocus: string;
  defaultRecapDraft: string;
}

/**
 * Stage 2: Teacher Recap Engine
 * Derives reinforcedNode (YELLOW -> GREEN) and nextNode (first WHITE after retry)
 * dynamically from before/after evidence objects.
 */
export function generateTeacherRecap(
  beforeEvidence: GraphEvidenceEvaluation | null | undefined,
  afterEvidence: GraphEvidenceEvaluation | null | undefined
): TeacherRecap {
  const beforeResults = beforeEvidence?.results || {};
  const afterOrdered = afterEvidence?.orderedResults || [];

  // Derive reinforcedNode: node that transitioned from YELLOW to GREEN
  let reinforcedNode: NodeEvidenceResult | null = null;
  for (const afterNode of afterOrdered) {
    const beforeNode = beforeResults[afterNode.nodeId];
    if (beforeNode && beforeNode.status === 'YELLOW' && afterNode.status === 'GREEN') {
      reinforcedNode = afterNode;
      break;
    }
  }

  // Derive nextNode: first WHITE node after retry
  const nextNode = afterOrdered.find(n => n.status === 'WHITE') || null;

  // Generate summary sentence dynamically:
  // e.g. "Condensation reinforced. Rain next."
  let summarySentence = '';
  if (reinforcedNode && nextNode) {
    summarySentence = `${reinforcedNode.label} reinforced. ${nextNode.label} next.`;
  } else if (reinforcedNode && !nextNode) {
    summarySentence = `${reinforcedNode.label} reinforced. All milestones demonstrated.`;
  } else if (!reinforcedNode && nextNode) {
    summarySentence = `No direct reinforcement transition. ${nextNode.label} next.`;
  } else {
    summarySentence = `All milestones demonstrated.`;
  }

  const suggestedFocus = nextNode ? `Tomorrow's focus: ${nextNode.label} formation` : "Tomorrow's focus: Topic mastery and synthesis";

  let defaultRecapDraft = '';
  if (reinforcedNode && nextNode) {
    defaultRecapDraft = `Quick recap: Review how ${reinforcedNode.label.toLowerCase()} operates (${reinforcedNode.explanation.toLowerCase()}), then connect it to ${nextNode.label.toLowerCase()}.`;
  } else if (reinforcedNode) {
    defaultRecapDraft = `Quick recap: Successfully reinforced ${reinforcedNode.label}. Student demonstrates understanding of ${reinforcedNode.explanation.toLowerCase()}`;
  } else if (nextNode) {
    defaultRecapDraft = `Quick recap: Proceed with introducing ${nextNode.label}: ${nextNode.explanation}`;
  } else {
    defaultRecapDraft = `Quick recap: Excellent lesson progression. All conceptual milestones are currently demonstrated.`;
  }

  return {
    reinforcedNode,
    nextNode,
    summarySentence,
    suggestedFocus,
    defaultRecapDraft
  };
}
