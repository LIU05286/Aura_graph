import type { MemoryNode, MemoryEdgeType } from "../types/graph";
import { deepseekChat } from "../ai/deepseek";
import { retrieveCandidates } from "./retrieval";
import { safeParseJson, asArray, asString } from "./json";
import type { ProposedNode, ProposedRelation } from "./types";

const EDGE_TYPES: MemoryEdgeType[] = [
  "related", "causes", "supports", "contradicts", "source", "similar", "extends",
];

/** 为建议节点推荐与"已有节点"的关系。失败返回已收集到的部分,绝不抛错。 */
export async function relationAgent(
  proposed: ProposedNode[],
  existing: MemoryNode[],
  opts: { signal?: AbortSignal } = {}
): Promise<ProposedRelation[]> {
  if (existing.length === 0) return [];
  const out: ProposedRelation[] = [];

  for (const node of proposed) {
    try {
      const candidates = await retrieveCandidates(
        `${node.title}\n${node.content}`,
        existing,
        { topK: 5, signal: opts.signal }
      );
      if (candidates.length === 0) continue;

      const system =
        "你为新记忆与候选已有记忆推荐关系。" +
        "关系类型只能取:" + EDGE_TYPES.join(", ") + "。" +
        "targetId 只能取候选列表里的 id。最多 3 条最有意义的。" +
        '只输出 JSON:{"relations":[{"targetId":"...","type":"related","reason":"简短中文理由"}]}';
      const user =
        "新记忆:\n" +
        JSON.stringify({ title: node.title, content: node.content, type: node.type }) +
        "\n\n候选已有记忆:\n" +
        JSON.stringify(
          candidates.map((c) => ({ id: c.node.id, title: c.node.title, type: c.node.type }))
        );

      const raw = await deepseekChat(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        { json: true, signal: opts.signal }
      );
      const parsed = safeParseJson<{ relations?: unknown }>(raw);
      const validIds = new Set(candidates.map((c) => c.node.id));
      for (const item of asArray(parsed?.relations)) {
        if (!item || typeof item !== "object") continue;
        const rec = item as Record<string, unknown>;
        const targetId = asString(rec.targetId);
        const type = asString(rec.type) as MemoryEdgeType;
        if (validIds.has(targetId) && (EDGE_TYPES as string[]).includes(type)) {
          out.push({ sourceTempId: node.tempId, targetId, type, reason: asString(rec.reason) });
        }
      }
    } catch {
      // 跳过该节点
    }
  }
  return out;
}
