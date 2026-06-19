/** Embeddings 客户端:统一走服务器 /api/embeddings,key 在服务器侧。 */
import { apiEmbeddings } from "../api/client";

export const EMBEDDING_MODEL = "server-managed";

/** 批量取 embedding,返回与 input 等长、顺序对应的向量数组。 */
export async function embedTexts(
  input: string[],
  opts: { signal?: AbortSignal } = {}
): Promise<number[][]> {
  if (input.length === 0) return [];
  const data = await apiEmbeddings({ input }, { signal: opts.signal });
  const arr = data.data;
  if (!Array.isArray(arr)) throw new Error("embeddings:响应格式异常");
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
