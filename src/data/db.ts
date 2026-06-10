import Dexie, { type Table } from "dexie";
import type { MemoryNode, MemoryEdge } from "../types/graph";

export interface GraphRow {
  id: string;
  nodes: MemoryNode[];
  edges: MemoryEdge[];
}

class AuraGraphDB extends Dexie {
  graph!: Table<GraphRow, string>;

  constructor() {
    super("aura-graph");
    this.version(1).stores({ graph: "id" });
    this.graph = this.table("graph");
  }
}

export const db = new AuraGraphDB();
