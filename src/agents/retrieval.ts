import type { MemoryNode, MemoryEdge } from "../types/graph";
import { embedOne, embedTexts, EMBEDDING_MODEL } from "../ai/relay";
import { isEmbeddingsConfigured, loadAiConfig } from "../ai/aiConfig";
import { getVectors, putVectors } from "../data/embeddingStore";

export interface Candidate {
  node: MemoryNode;
  score: number;
}

/** hybrid 检索结果:带各信号分数,便于问答取上下文与展示 */
export interface RetrievedNode {
  node: MemoryNode;
  score: number;
  signals: { text: number; semantic: number; neighbor: number };
}

function currentModel(): string {
  return loadAiConfig().embeddings.model || EMBEDDING_MODEL;
}
function sigOf(n: MemoryNode, model: string): string {
  return `${n.updatedAt}|${model}`;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function textScore(query: string, node: MemoryNode): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const hay = (node.title + " " + node.content).toLowerCase();
  let s = 0;
  if (node.title.toLowerCase().includes(q)) s += 0.6;
  if (node.content.toLowerCase().includes(q)) s += 0.3;
  const words = q.split(/\s+/).filter(Boolean);
  const hit = words.filter((w) => hay.includes(w)).length;
  s += words.length ? (hit / words.length) * 0.4 : 0;
  return Math.min(1, s);
}

/**
 * 确保给定节点都有最新 embedding(持久化到 aura-embeddings 库)。
 * 仅对缺失或过期(updatedAt/model 变化)的节点重算。返回 id→vector。
 * 未配置 embeddings 返回空 Map。
 */
export async function ensureEmbeddings(
  nodes: MemoryNode[],
  opts: { signal?: AbortSignal } = {}
): Promise<Map<string, number[]>> {
  const out = new Map<string, number[]>();
  if (!isEmbeddingsConfigured() || nodes.length === 0) return out;
  const model = currentModel();
  const stored = await getVectors(nodes.map((n) => n.id));
  const stale: MemoryNode[] = [];
  for (const n of nodes) {
    const row = stored.get(n.id);
    if (row && row.sig === sigOf(n, model)) out.set(n.id, row.vector);
    else stale.push(n);
  }
  if (stale.length > 0) {
    const vecs = await embedTexts(
      stale.map((n) => `${n.title}\n${n.content}`),
      { signal: opts.signal }
    );
    const rows = stale.map((n, i) => ({ id: n.id, sig: sigOf(n, model), vector: vecs[i] ?? [] }));
    await putVectors(rows);
    rows.forEach((r) => out.set(r.id, r.vector));
  }
  return out;
}

/** 与 query 最相关的已有节点(合并/关系 agent 用)。有 embeddings 走语义(持久化),否则文本。绝不抛错。 */
export async function retrieveCandidates(
  query: string,
  nodes: MemoryNode[],
  opts: { topK?: number; signal?: AbortSignal } = {}
): Promise<Candidate[]> {
  const topK = opts.topK ?? 5;
  if (nodes.length === 0) return [];
  if (isEmbeddingsConfigured()) {
    try {
      const qVec = await embedOne(query, { signal: opts.signal });
      const vecMap = await ensureEmbeddings(nodes, { signal: opts.signal });
      return nodes
        .map((node) => ({ node, score: cosine(qVec, vecMap.get(node.id) ?? []) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    } catch {
      // 回退文本
    }
  }
  return nodes
    .map((node) => ({ node, score: textScore(query, node) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * 混合检索:文本 + 语义 + 图邻居扩展。返回带各信号分数的结果(供问答取上下文)。
 * embeddings 不可用时自动退化为纯文本。绝不抛错。
 */
export async function hybridRetrieve(
  query: string,
  nodes: MemoryNode[],
  edges: MemoryEdge[],
  opts: { topK?: number; signal?: AbortSignal } = {}
): Promise<RetrievedNode[]> {
  const topK = opts.topK ?? 6;
  if (nodes.length === 0) return [];

  const textScores = new Map<string, number>();
  for (const n of nodes) textScores.set(n.id, textScore(query, n));

  const semScores = new Map<string, number>();
  if (isEmbeddingsConfigured()) {
    try {
      const qVec = await embedOne(query, { signal: opts.signal });
      const vecMap = await ensureEmbeddings(nodes, { signal: opts.signal });
      for (const n of nodes) semScores.set(n.id, cosine(qVec, vecMap.get(n.id) ?? []));
    } catch {
      // 文本模式
    }
  }
  const hasSem = semScores.size > 0;

  const base = new Map<string, number>();
  for (const n of nodes) {
    const tx = textScores.get(n.id) ?? 0;
    const sm = semScores.get(n.id) ?? 0;
    base.set(n.id, hasSem ? sm * 0.7 + tx * 0.3 : tx);
  }

  const ranked = [...nodes].sort((a, b) => (base.get(b.id) ?? 0) - (base.get(a.id) ?? 0));
  const seeds = ranked.slice(0, Math.min(topK, ranked.length)).filter((n) => (base.get(n.id) ?? 0) > 0);
  const seedIds = new Set(seeds.map((n) => n.id));

  const adj = new Map<string, Set<string>>();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, new Set());
    if (!adj.has(e.target)) adj.set(e.target, new Set());
    adj.get(e.source)!.add(e.target);
    adj.get(e.target)!.add(e.source);
  }
  const neighborBoost = new Map<string, number>();
  for (const s of seeds) {
    const sBase = base.get(s.id) ?? 0;
    for (const nb of adj.get(s.id) ?? []) {
      if (seedIds.has(nb)) continue;
      neighborBoost.set(nb, Math.max(neighborBoost.get(nb) ?? 0, sBase * 0.25));
    }
  }

  return nodes
    .map((n) => {
      const b = base.get(n.id) ?? 0;
      const nb = neighborBoost.get(n.id) ?? 0;
      return {
        node: n,
        score: b + nb,
        signals: {
          text: textScores.get(n.id) ?? 0,
          semantic: semScores.get(n.id) ?? 0,
          neighbor: nb,
        },
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
