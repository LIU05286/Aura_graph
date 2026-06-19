import type { MemoryNodeType } from "../types/graph";
import { NODE_TYPES } from "../types/graph";
import { deepseekChat } from "../ai/deepseek";
import { safeParseJson, asString } from "./json";

export interface RouteResult {
  shouldExtract: boolean;
  suggestedType: MemoryNodeType;
  reason: string;
}

const FALLBACK: RouteResult = { shouldExtract: true, suggestedType: "note", reason: "" };

/** 路由:判断文字是否值得结构化,并猜主类型。失败回退"可提取/note"。 */
export async function routerAgent(
  text: string,
  opts: { signal?: AbortSignal } = {}
): Promise<RouteResult> {
  const system =
    "你是记忆整理系统的路由器。判断用户这段文字是否值得结构化为记忆,并猜测主类型。" +
    "可选类型:" + NODE_TYPES.join(", ") + "。" +
    '只输出 JSON:{"shouldExtract":true,"suggestedType":"note","reason":"简短中文理由"}';
  try {
    const raw = await deepseekChat(
      [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
      { json: true, signal: opts.signal }
    );
    const parsed = safeParseJson<Record<string, unknown>>(raw);
    if (!parsed) return FALLBACK;
    const type = asString(parsed.suggestedType) as MemoryNodeType;
    return {
      shouldExtract: parsed.shouldExtract !== false,
      suggestedType: (NODE_TYPES as string[]).includes(type) ? type : "note",
      reason: asString(parsed.reason),
    };
  } catch {
    return FALLBACK;
  }
}
