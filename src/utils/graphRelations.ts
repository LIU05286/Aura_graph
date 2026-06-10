import type { MemoryNode, MemoryEdge } from "../types/graph";

/** 按 id 取节点 */
export function getNodeById(
  nodes: MemoryNode[],
  id: string | null
): MemoryNode | undefined {
  if (!id) return undefined;
  return nodes.find((n) => n.id === id);
}

/** 查找与某节点直接相连的所有节点(无向) */
export function getConnectedNodes(
  nodes: MemoryNode[],
  edges: MemoryEdge[],
  nodeId: string
): MemoryNode[] {
  const neighborIds = new Set<string>();
  for (const e of edges) {
    if (e.source === nodeId) neighborIds.add(e.target);
    if (e.target === nodeId) neighborIds.add(e.source);
  }
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const result: MemoryNode[] = [];
  for (const id of neighborIds) {
    const n = byId.get(id);
    if (n) result.push(n);
  }
  return result;
}

export function getIncidentEdges(edges: MemoryEdge[], nodeId: string): MemoryEdge[] {
  return edges.filter((e) => e.source === nodeId || e.target === nodeId);
}
