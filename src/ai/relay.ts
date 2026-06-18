/**
 * Embeddings 客户端(OpenAI 兼容)。
 * BYOK:从 aiConfig 读 embeddings 端点的 base URL / key / model,浏览器直连。
 * 未配置时:dev 下回落到 Vite proxy(/relay,key 由代理注入),保留零配置本地体验;
 * 生产下抛友好错误(提示去 ⚙ Settings 填 key)。
 */

import { loadAiConfig, isEmbeddingsConfigured, embeddingsUrl } from "./aiConfig";

// dev 回落(走 proxy)时使用的默认 embedding 模型
export const EMBEDDING_MODEL = "text-embedding-3-small";
const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

interface EmbeddingItem {
  index?: number;
  embedding?: number[];
}

/** 解析本次 embeddings 调用的 url / headers / model:优先 BYOK 配置,dev 下回落 proxy */
function resolveEmbeddings(): {
  url: string;
  headers: Record<string, string>;
  model: string;
} {
  const config = loadAiConfig();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (isEmbeddingsConfigured(config)) {
    headers["Authorization"] = `Bearer ${config.embeddings.apiKey}`;
    return { url: embeddingsUrl(config), headers, model: config.embeddings.model };
  }
  if (isDev) {
    return { url: "/relay/v1/embeddings", headers, model: EMBEDDING_MODEL };
  }
  throw new Error("Embeddings not configured — add your API key in ⚙ Settings.");
}

/** 批量取 embedding,返回与 input 等长、顺序对应的向量数组。 */
export async function embedTexts(
  input: string[],
  opts: { signal?: AbortSignal } = {}
): Promise<number[][]> {
  if (input.length === 0) return [];
  const { url, headers, model } = resolveEmbeddings();
  const res = await fetch(url, {
    method: "POST",
    headers,
    signal: opts.signal,
    body: JSON.stringify({ model, input }),
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
