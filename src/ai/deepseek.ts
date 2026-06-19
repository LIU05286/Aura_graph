/** Chat 客户端:统一走服务器 /api/chat,key 在服务器侧,前端不持有。 */
import { apiChat } from "../api/client";

export const DEEPSEEK_MODEL = "server-managed";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** 调一次 chat,返回文本内容。json=true 时要求模型输出 JSON。 */
export async function deepseekChat(
  messages: ChatMessage[],
  opts: { json?: boolean; signal?: AbortSignal } = {}
): Promise<string> {
  const data = await apiChat(
    {
      messages,
      temperature: 0.3,
      stream: false,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    },
    { signal: opts.signal }
  );
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("AI:空响应");
  return content;
}
