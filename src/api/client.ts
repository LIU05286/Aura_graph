import type { AuraGraph, Galaxy } from "../types/graph";

/** 服务器保存的整份文档 */
export interface ServerDoc {
  galaxies: Galaxy[];
  activeGalaxyId: string | null;
  graphs: Record<string, AuraGraph>;
}

export interface ChatResponse {
  choices?: { message?: { content?: string } }[];
}
export interface EmbeddingsResponse {
  data?: { index?: number; embedding?: number[] }[];
}

async function jsonFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`接口 ${path} 返回 ${res.status}:${text.slice(0, 200)}`);
  }
  return res;
}

export async function apiGetData(): Promise<ServerDoc> {
  const res = await jsonFetch("/api/data");
  return res.json();
}
export async function apiPutData(doc: ServerDoc): Promise<void> {
  await jsonFetch("/api/data", { method: "PUT", body: JSON.stringify(doc) });
}
export async function apiChat(
  body: unknown,
  opts: { signal?: AbortSignal } = {}
): Promise<ChatResponse> {
  const res = await jsonFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  return res.json();
}
export async function apiEmbeddings(
  body: unknown,
  opts: { signal?: AbortSignal } = {}
): Promise<EmbeddingsResponse> {
  const res = await jsonFetch("/api/embeddings", {
    method: "POST",
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  return res.json();
}
