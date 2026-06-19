import type { MemoryNode } from "../types/graph";
import type { ProposedNode } from "./types";
import { retrieveCandidates } from "./retrieval";
import { isEmbeddingsConfigured } from "../ai/aiConfig";

const THRESHOLD_SEMANTIC = 0.82;
const THRESHOLD_TEXT = 0.7;

/** 为每条建议节点找一个"可能重复"的已有节点(高相似度时给出合并候选)。绝不抛错。 */
export async function memoryMergeAgent(
  proposed: ProposedNode[],
  existing: MemoryNode[],
  opts: { signal?: AbortSignal } = {}
): Promise<ProposedNode[]> {
  if (existing.length === 0) return proposed;
  const threshold = isEmbeddingsConfigured() ? THRESHOLD_SEMANTIC : THRESHOLD_TEXT;

  const result: ProposedNode[] = [];
  for (const node of proposed) {
    try {
      const candidates = await retrieveCandidates(
        `${node.title}\n${node.content}`,
        existing,
        { topK: 1, signal: opts.signal }
      );
      const top = candidates[0];
      if (top && top.score >= threshold) {
        result.push({
          ...node,
          mergeCandidateId: top.node.id,
          mergeCandidateTitle: top.node.title,
        });
        continue;
      }
    } catch {
      // 忽略,按新建处理
    }
    result.push(node);
  }
  return result;
}
