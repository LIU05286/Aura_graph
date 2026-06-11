/**
 * 中转站客户端(OpenAI 兼容,yunwu.ai)—— 目前仅用于 embedding。
 * 走 Vite dev 代理 /relay → RELAY_BASE_URL(默认 https://yunwu.ai);
 * Authorization 由代理在服务端注入(key 在 .env.local,不进前端打包)。
 * 仅在 `npm run dev` 下可用;生产构建无代理(发布版需真后端,见 P6)。
 */

export const EMBEDDING_MODEL = "text-embedding-3-small";

interface EmbeddingItem {
  index?: number;
  embedding?: number[];
}

/** 批量取 embedding,返回与 input 等长、顺序对应的向量数组。 */
export async function embedTexts(
  input: string[],
  opts: { signal?: AbortSignal } = {}
): Promise<number[][]> {
  if (input.length === 0) return [];
  const res = await fetch("/relay/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts.signal,
    body: JSON.stringify({ model: EMBEDDING_MODEL, input }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Relay ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { data?: EmbeddingItem[] };
  const arr = data.data;
  if (!Array.isArray(arr)) throw new Error("Relay: malformed embeddings response");
  return arr
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((d) => d.embedding ?? []);
}

/** 单条便捷封装 */
export async function embedOne(
  text: string,
  opts: { signal?: AbortSignal } = {}
): Promise<number[]> {
  const [v] = await embedTexts([text], opts);
  return v ?? [];
}
