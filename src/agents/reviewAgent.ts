import type { MemoryNode } from "../types/graph";
import { deepseekChat } from "../ai/deepseek";
import { safeParseJson, asString, asStringArray } from "./json";
import type { ReviewResult } from "./types";

/** 复盘:分析给定时间段的记忆,产出总览、主题、情绪、灵感、待办。
 *  deepseekChat 抛错向上传播。 */
export async function reviewAgent(
  nodes: MemoryNode[],
  periodLabel: string,
  opts: { signal?: AbortSignal } = {}
): Promise<ReviewResult> {
  if (nodes.length === 0) {
    return { summary: "", themes: [], mood: "", ideas: [], todos: [] };
  }
  const items = nodes.slice(0, 40).map((n) => ({
    title: n.title,
    type: n.type,
    tags: n.tags,
    date: n.createdAt.slice(0, 10),
    content: n.content.slice(0, 200),
  }));

  const system =
    "你是用户的复盘助手。基于这段时间的记忆,总结主题、情绪基调、值得展开的灵感、以及待推进的事项。用中文。" +
    '只输出 JSON:{"summary":"两三句总览","themes":["主题"],"mood":"一句情绪基调","ideas":["值得展开的灵感"],"todos":["待推进事项"]}';
  const user = `时间段:${periodLabel}\n记忆:\n` + JSON.stringify(items);

  const raw = await deepseekChat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { json: true, signal: opts.signal }
  );
  const parsed = safeParseJson<Record<string, unknown>>(raw);
  return {
    summary: asString(parsed?.summary),
    themes: asStringArray(parsed?.themes),
    mood: asString(parsed?.mood),
    ideas: asStringArray(parsed?.ideas),
    todos: asStringArray(parsed?.todos),
  };
}
