/**
 * DeepSeek 客户端(本地自用)。
 * 走 Vite dev 代理 /deepseek → https://api.deepseek.com;
 * Authorization 由代理在服务端注入(key 在 .env.local,不进前端打包)。
 * 仅在 `npm run dev` 下可用;生产构建无代理(发布版需真后端,见 P6)。
 */

// 现行模型;deepseek-chat 将于 2026-07-24 停用,故默认用 v4-flash。可改 v4-pro。
export const DEEPSEEK_MODEL = "deepseek-v4-pro";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** 调一次 DeepSeek chat completion,返回文本内容。json=true 时要求模型输出 JSON。 */
export async function deepseekChat(
  messages: ChatMessage[],
  opts: { json?: boolean; signal?: AbortSignal } = {}
): Promise<string> {
  const res = await fetch("/deepseek/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts.signal,
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
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
