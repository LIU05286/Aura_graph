import type { MemoryNode, MemoryEdge } from "../types/graph";
import { deepseekChat } from "../ai/deepseek";
import { hybridRetrieve } from "./retrieval";
import { safeParseJson, asString, asStringArray } from "./json";
import type { QaAnswer } from "./types";

/** 基于记忆回答问题:先 hybrid 检索取上下文,再让模型作答并回传引用的节点 id。
 *  deepseekChat 抛错向上传播(让 UI 报错)。 */
export async function answerQuestion(
  question: string,
  nodes: MemoryNode[],
  edges: MemoryEdge[],
  opts: { signal?: AbortSignal } = {}
): Promise<QaAnswer> {
  const retrieved = await hybridRetrieve(question, nodes, edges, { topK: 6, signal: opts.signal });
  if (retrieved.length === 0) {
    return { answer: "", usedNodeIds: [], contextIds: [] };
  }

  const context = retrieved.map((r) => ({
    id: r.node.id,
    title: r.node.title,
    type: r.node.type,
    date: r.node.createdAt.slice(0, 10),
    content: r.node.content.slice(0, 400),
  }));

  const system =
    "你是用户的私人记忆助手。只能依据提供的『记忆上下文』回答,不要编造上下文之外的事实。" +
    "若上下文不足以回答,就如实说明。回答用中文,简洁。" +
    'usedIds 只能取上下文里出现过的 id。只输出 JSON:{"answer":"...","usedIds":["..."]}';
  const user = "问题:" + question + "\n\n记忆上下文:\n" + JSON.stringify(context);

  const raw = await deepseekChat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { json: true, signal: opts.signal }
  );

  const parsed = safeParseJson<Record<string, unknown>>(raw);
  const contextIds = context.map((c) => c.id);
  const validIds = new Set(contextIds);
  const answer = asString(parsed?.answer).trim();
  const usedNodeIds = asStringArray(parsed?.usedIds).filter((id) => validIds.has(id));

  return {
    answer: answer || raw.trim(),
    usedNodeIds: usedNodeIds.length > 0 ? usedNodeIds : contextIds.slice(0, 3),
    contextIds,
  };
}
