/**
 * AI 服务配置(BYOK)。双端点:chat 与 embeddings 各自独立的 base URL / key / model。
 * 存浏览器 localStorage —— 小配置、需同步读以 gate UI;key 只留在用户本机。
 * 客户端(relay.ts / deepseek.ts)在调用时读取本模块,故配置改动即时生效。
 */

const STORAGE_KEY = "aura-graph.ai-config.v1";

/** 单个 OpenAI 兼容端点 */
export interface AiEndpoint {
  baseUrl: string;
  apiKey: string;
  model: string;
}

/** 双端点配置 */
export interface AiConfig {
  chat: AiEndpoint;
  embeddings: AiEndpoint;
}

/** 默认值:地址 / key 留空待用户填;model 给现行默认 */
export const DEFAULT_AI_CONFIG: AiConfig = {
  chat: { baseUrl: "", apiKey: "", model: "deepseek-v4-pro" },
  embeddings: { baseUrl: "", apiKey: "", model: "text-embedding-3-small" },
};

/** 返回一份全新的默认配置(避免调用方误改共享默认对象) */
function cloneDefaults(): AiConfig {
  return {
    chat: { ...DEFAULT_AI_CONFIG.chat },
    embeddings: { ...DEFAULT_AI_CONFIG.embeddings },
  };
}

/** 把任意输入清洗成一个合法端点;字段缺失 / 类型不符则取 fallback */
function sanitizeEndpoint(raw: unknown, fallback: AiEndpoint): AiEndpoint {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const rec = raw as Record<string, unknown>;
  return {
    baseUrl: typeof rec.baseUrl === "string" ? rec.baseUrl.trim() : fallback.baseUrl,
    apiKey: typeof rec.apiKey === "string" ? rec.apiKey.trim() : fallback.apiKey,
    model:
      typeof rec.model === "string" && rec.model.trim() !== ""
        ? rec.model.trim()
        : fallback.model,
  };
}

/** 读配置;损坏 / 缺失时回退默认,绝不抛错 */
export function loadAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      chat: sanitizeEndpoint(parsed.chat, DEFAULT_AI_CONFIG.chat),
      embeddings: sanitizeEndpoint(parsed.embeddings, DEFAULT_AI_CONFIG.embeddings),
    };
  } catch {
    return cloneDefaults();
  }
}

/** 写配置 + 通知订阅者;localStorage 不可用时静默失败(隐私模式 / 配额) */
export function saveAiConfig(config: AiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // 忽略写入失败:不阻断 UI
  }
  emit();
}

/** chat 端点是否可用(地址 + key 都非空) */
export function isChatConfigured(config: AiConfig = loadAiConfig()): boolean {
  return config.chat.baseUrl !== "" && config.chat.apiKey !== "";
}

/** embeddings 端点是否可用 */
export function isEmbeddingsConfigured(config: AiConfig = loadAiConfig()): boolean {
  return config.embeddings.baseUrl !== "" && config.embeddings.apiKey !== "";
}

/** 去掉 base 尾部斜杠、path 头部斜杠后拼接,避免出现 // 或缺斜杠 */
function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/** chat completions 完整地址 */
export function chatCompletionsUrl(config: AiConfig = loadAiConfig()): string {
  return joinUrl(config.chat.baseUrl, "chat/completions");
}

/** embeddings 完整地址 */
export function embeddingsUrl(config: AiConfig = loadAiConfig()): string {
  return joinUrl(config.embeddings.baseUrl, "embeddings");
}

/** —— 轻量订阅:设置面板保存后,gate 组件可即时重渲染(配合 useSyncExternalStore) —— */
type Listener = () => void;
const listeners = new Set<Listener>();

function emit(): void {
  for (const l of listeners) l();
}

/** 订阅配置变化,返回取消订阅函数 */
export function subscribeAiConfig(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
