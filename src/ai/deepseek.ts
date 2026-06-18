/**
 * Chat 客户端(OpenAI 兼容)。
 * BYOK:从 aiConfig 读 chat 端点的 base URL / key / model,浏览器直连。
 * 未配置时:dev 下回落到 Vite proxy(/deepseek,key 由代理注入);生产下抛友好错误。
 */

import { loadAiConfig, isChatConfigured, chatCompletionsUrl } from "./aiConfig";

// dev 回落(走 proxy)时使用的默认 chat 模型
export const DEEPSEEK_MODEL = "deepseek-v4-pro";
const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** 解析本次 chat 调用的 url / headers / model:优先 BYOK 配置,dev 下回落 proxy */
function resolveChat(): {
  url: string;
  headers: Record<string, string>;
  model: string;
} {
  const config = loadAiConfig();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (isChatConfigured(config)) {
    headers["Authorization"] = `Bearer ${config.chat.apiKey}`;
    return { url: chatCompletionsUrl(config), headers, model: config.chat.model };
  }
  if (isDev) {
    return { url: "/deepseek/chat/completions", headers, model: DEEPSEEK_MODEL };
  }
  throw new Error("Chat model not configured — add your API key in ⚙ Settings.");
}

/** 调一次 chat completion,返回文本内容。json=true 时要求模型输出 JSON。 */
export async function deepseekChat(
  messages: ChatMessage[],
  opts: { json?: boolean; signal?: AbortSignal } = {}
): Promise<string> {
  const { url, headers, model } = resolveChat();
  const res = await fetch(url, {
    method: "POST",
    headers,
    signal: opts.signal,
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      stream: false,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DeepSeek ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("DeepSeek: empty response");
  return content;
}
