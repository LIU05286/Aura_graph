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

/** 路由:判断文字是否值得结构化,并猜主类型。
 *  注意:网络 / HTTP 错误会向上抛出(让上层显示错误),只有"AI 有响应但 JSON 无法解析"才回退。 */
export async function routerAgent(
  text: string,
  opts: { signal?: AbortSignal } = {}
): Promise<RouteResult> {
  const system =
    "你是记忆整理系统的路由器。判断用户这段文字是否值得结构化为记忆,并猜测主类型。" +
    "可选类型:" + NODE_TYPES.join(", ") + "。" +
    '只输出 JSON:{"shouldExtract":true,"suggestedType":"note","reason":"简短中文理由"}';

  // 不在此处 try/catch:deepseekChat 抛错(网络/鉴权/HTTP)必须向上传播。
  const raw = await deepseekChat(
    [
      { role: "system", content: system },
      { role: "user", content: text },
    ],
    { json: true, signal: opts.signal }
  );

  const parsed = safeParseJson<Record<string, unknown>>(raw);
  if (!parsed) return FALLBACK; // AI 响应了但 JSON 解析失败,温和兜底
  const type = asString(parsed.suggestedType) as MemoryNodeType;
  return {
    shouldExtract: parsed.shouldExtract !== false,
    suggestedType: (NODE_TYPES as string[]).includes(type) ? type : "note",
    reason: asString(parsed.reason),
  };
}
