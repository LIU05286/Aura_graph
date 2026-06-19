import type { MemoryNode } from "../types/graph";
import { embedOne, embedTexts } from "../ai/relay";
import { isEmbeddingsConfigured } from "../ai/aiConfig";

export interface Candidate {
  node: MemoryNode;
  score: number; // 0..1
}

// 会话级向量缓存:键含 updatedAt,节点变更后自动失效。第四阶段会替换为持久化存储。
const vecCache = new Map<string, number[]>();
const cacheKey = (n: MemoryNode) => `${n.id}:${n.updatedAt}`;

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

/** 找出与 query 最相关的已有节点;有 embeddings 用语义,否则回退文本。绝不抛错。 */
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
      const missing = nodes.filter((n) => !vecCache.has(cacheKey(n)));
      if (missing.length > 0) {
        const vecs = await embedTexts(
          missing.map((n) => `${n.title}\n${n.content}`),
          { signal: opts.signal }
        );
        missing.forEach((n, i) => vecCache.set(cacheKey(n), vecs[i] ?? []));
      }
      const scored = nodes.map((node) => ({
        node,
        score: cosine(qVec, vecCache.get(cacheKey(node)) ?? []),
      }));
      return scored.sort((a, b) => b.score - a.score).slice(0, topK);
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
