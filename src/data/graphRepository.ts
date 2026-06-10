import { db } from "./db";
import type { AuraGraph } from "../types/graph";

const CURRENT = "current";

export async function loadGraph(): Promise<AuraGraph | null> {
  const row = await db.graph.get(CURRENT);
  if (!row) return null;
  return { nodes: row.nodes, edges: row.edges };
}

export async function saveGraph(graph: AuraGraph): Promise<void> {
  await db.graph.put({ id: CURRENT, nodes: graph.nodes, edges: graph.edges });
}
