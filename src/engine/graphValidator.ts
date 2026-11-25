import { ConceptGraph } from '../types/conceptGraph';

export interface ValidationSuccess {
  isValid: true;
  graph: ConceptGraph;
}

export interface ValidationFailure {
  isValid: false;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Strict Graph Validator for SAMBHAV 2.0.
 * Rejects candidate structures unless ALL conditions pass:
 *
 * Nodes:
 * - 5–9 nodes
 * - unique IDs
 * - every node has an English label
 * - every node has a symbol
 * - every node has an explanation
 *
 * Edges:
 * - every source exists
 * - every target exists
 * - no self-edges
 * - no duplicate edges
 * - no cycles
 * - directed graph
 *
 * Linear structure:
 * - exactly one start node (in-degree 0)
 * - every node has at most one incoming edge (in-degree <= 1)
 * - every node has at most one outgoing edge (out-degree <= 1)
 * - topological sort produces one unique sequence
 * - sequence covers every node exactly once
 *
 * Schema safety:
 * - Rejects malformed or unexpected structures.
 */
export function validateConceptGraph(candidate: unknown): ValidationResult {
  if (!candidate || typeof candidate !== 'object') {
    return { isValid: false, error: 'Candidate graph is not an object or is null.' };
  }

  const obj = candidate as Record<string, unknown>;

  // Check title & subtitle
  const title = typeof obj.title === 'string' && obj.title.trim().length > 0 ? obj.title.trim() : 'Lesson Graph';
  const subtitle = typeof obj.subtitle === 'string' ? obj.subtitle.trim() : "Today's Lesson";
  const id = typeof obj.id === 'string' && obj.id.trim().length > 0 ? obj.id.trim() : `graph-${Date.now()}`;

  // Validate nodes array
  if (!Array.isArray(obj.nodes)) {
    return { isValid: false, error: 'Nodes must be an array.' };
  }

  const rawNodes = obj.nodes;

  // Rule: 5–9 nodes
  if (rawNodes.length < 5 || rawNodes.length > 9) {
    return {
      isValid: false,
      error: `Graph must contain between 5 and 9 nodes. Found ${rawNodes.length}.`
    };
  }

  const nodeMap = new Map<string, { id: string; label: string; kannadaLabel: string; symbol: string; explanation: string }>();
  const seenIds = new Set<string>();

  for (let i = 0; i < rawNodes.length; i++) {
    const n = rawNodes[i];
    if (!n || typeof n !== 'object') {
      return { isValid: false, error: `Node at index ${i} is not a valid object.` };
    }

    const nodeId = typeof n.id === 'string' ? n.id.trim().toLowerCase() : '';
    const label = typeof n.label === 'string' ? n.label.trim() : '';
    const symbol = typeof n.symbol === 'string' ? n.symbol.trim() : '';
    const explanation = typeof n.explanation === 'string' ? n.explanation.trim() : '';
    const kannadaLabel = typeof n.kannadaLabel === 'string' && n.kannadaLabel.trim().length > 0 ? n.kannadaLabel.trim() : label;

    if (!nodeId) {
      return { isValid: false, error: `Node at index ${i} is missing a valid id.` };
    }
    if (seenIds.has(nodeId)) {
      return { isValid: false, error: `Duplicate node ID detected: "${nodeId}".` };
    }
    seenIds.add(nodeId);

    if (!label) {
      return { isValid: false, error: `Node "${nodeId}" is missing an English label.` };
    }
    if (!symbol) {
      return { isValid: false, error: `Node "${nodeId}" is missing a symbol.` };
    }
    if (!explanation) {
      return { isValid: false, error: `Node "${nodeId}" is missing an explanation.` };
    }

    nodeMap.set(nodeId, { id: nodeId, label, kannadaLabel, symbol, explanation });
  }

  // Validate edges array
  if (!Array.isArray(obj.edges)) {
    return { isValid: false, error: 'Edges must be an array.' };
  }

  const rawEdges = obj.edges;
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  const adjacency = new Map<string, string>();
  const seenEdgeKeys = new Set<string>();

  for (const nodeId of seenIds) {
    inDegree.set(nodeId, 0);
    outDegree.set(nodeId, 0);
  }

  for (let i = 0; i < rawEdges.length; i++) {
    const e = rawEdges[i];
    if (!e || typeof e !== 'object') {
      return { isValid: false, error: `Edge at index ${i} is not a valid object.` };
    }

    const from = typeof e.from === 'string' ? e.from.trim().toLowerCase() : '';
    const to = typeof e.to === 'string' ? e.to.trim().toLowerCase() : '';

    if (!from || !to) {
      return { isValid: false, error: `Edge at index ${i} is missing source or target.` };
    }

    // Rule: every source exists
    if (!seenIds.has(from)) {
      return { isValid: false, error: `Edge source "${from}" does not exist in nodes.` };
    }

    // Rule: every target exists
    if (!seenIds.has(to)) {
      return { isValid: false, error: `Edge target "${to}" does not exist in nodes.` };
    }

    // Rule: no self-edges
    if (from === to) {
      return { isValid: false, error: `Self-edge detected on node "${from}".` };
    }

    // Rule: no duplicate edges
    const edgeKey = `${from}->${to}`;
    if (seenEdgeKeys.has(edgeKey)) {
      return { isValid: false, error: `Duplicate edge detected: "${edgeKey}".` };
    }
    seenEdgeKeys.add(edgeKey);

    // Rule: linear structure -> out-degree <= 1 (no branching from source)
    const currentOut = outDegree.get(from) || 0;
    if (currentOut >= 1) {
      return { isValid: false, error: `Branching node detected: "${from}" has multiple outgoing edges.` };
    }
    outDegree.set(from, currentOut + 1);

    // Rule: linear structure -> in-degree <= 1 (no convergence into target)
    const currentIn = inDegree.get(to) || 0;
    if (currentIn >= 1) {
      return { isValid: false, error: `Branching node detected: "${to}" has multiple incoming edges.` };
    }
    inDegree.set(to, currentIn + 1);

    adjacency.set(from, to);
  }

  // Linear structure rules:
  // For a linear chain of N nodes, there must be exactly N - 1 edges
  if (rawEdges.length !== rawNodes.length - 1) {
    return {
      isValid: false,
      error: `A linear graph of ${rawNodes.length} nodes must have exactly ${rawNodes.length - 1} edges. Found ${rawEdges.length}.`
    };
  }

  // Exactly one start node with in-degree 0
  const startNodes: string[] = [];
  for (const [nodeId, deg] of inDegree.entries()) {
    if (deg === 0) {
      startNodes.push(nodeId);
    }
  }

  if (startNodes.length !== 1) {
    return {
      isValid: false,
      error: `A linear graph must have exactly one start node. Found ${startNodes.length}.`
    };
  }

  // Exactly one end node with out-degree 0
  const endNodes: string[] = [];
  for (const [nodeId, deg] of outDegree.entries()) {
    if (deg === 0) {
      endNodes.push(nodeId);
    }
  }

  if (endNodes.length !== 1) {
    return {
      isValid: false,
      error: `A linear graph must have exactly one end node. Found ${endNodes.length}.`
    };
  }

  // Topological walk to verify no cycle and all nodes visited in one unique sequence
  const sequence: string[] = [];
  let current: string | undefined = startNodes[0];
  const visited = new Set<string>();

  while (current) {
    if (visited.has(current)) {
      return { isValid: false, error: `Cycle detected at node "${current}".` };
    }
    visited.add(current);
    sequence.push(current);
    current = adjacency.get(current);
  }

  if (sequence.length !== rawNodes.length) {
    return {
      isValid: false,
      error: `Graph sequence does not cover every node. Visited ${sequence.length} of ${rawNodes.length}.`
    };
  }

  // Construct canonical, validated graph in topological order
  const validatedNodes = sequence.map(id => nodeMap.get(id)!);
  const validatedEdges = [];
  for (let i = 0; i < sequence.length - 1; i++) {
    const fromId = sequence[i];
    const toId = sequence[i + 1];
    // Find original relation if specified
    const origEdge = rawEdges.find((e: Record<string, unknown>) => e.from === fromId && e.to === toId);
    const rel = (origEdge && typeof origEdge.relation === 'string') ? origEdge.relation.trim() : 'leads_to';
    validatedEdges.push({ from: fromId, to: toId, relation: rel });
  }

  return {
    isValid: true,
    graph: {
      id,
      title,
      subtitle,
      nodes: validatedNodes,
      edges: validatedEdges
    }
  };
}
