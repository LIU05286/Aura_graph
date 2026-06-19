import type { MemoryNode, MemoryNodeType } from "../types/graph";
import type { ProposedNode } from "./types";
import { retrieveCandidates } from "./retrieval";
import { isEmbeddingsConfigured } from "../ai/aiConfig";

const THRESHOLD_SEMANTIC = 0.85;
const THRESHOLD_TEXT = 0.78;

// 按天记录的"情景型"类型:同样内容不同天属于不同事件,不做合并建议。
const EPISODIC: Set<MemoryNodeType> = new Set(["life", "event"]);

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
    if (EPISODIC.has(node.type)) {
      result.push(node); // 生活 / 事件:不判重
      continue;
    }
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
          mergeCandidateDate: top.node.createdAt,
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
