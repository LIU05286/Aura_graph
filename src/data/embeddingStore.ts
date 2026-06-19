import Dexie, { type Table } from "dexie";

/** 一条节点的向量记录 */
export interface VectorRow {
  id: string; // 节点 id
  sig: string; // 新鲜度签名:`${updatedAt}|${model}`,变化即重算
  vector: number[];
}

class EmbeddingDB extends Dexie {
  vectors!: Table<VectorRow, string>;
  constructor() {
    super("aura-embeddings");
    this.version(1).stores({ vectors: "id" });
    this.vectors = this.table("vectors");
  }
}

const edb = new EmbeddingDB();

export async function getVectors(ids: string[]): Promise<Map<string, VectorRow>> {
  if (ids.length === 0) return new Map();
  const rows = await edb.vectors.bulkGet(ids);
  const m = new Map<string, VectorRow>();
  rows.forEach((r, i) => {
    if (r) m.set(ids[i], r);
  });
  return m;
}

export async function putVectors(rows: VectorRow[]): Promise<void> {
  if (rows.length === 0) return;
  await edb.vectors.bulkPut(rows);
}

export async function deleteVectors(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await edb.vectors.bulkDelete(ids);
}
