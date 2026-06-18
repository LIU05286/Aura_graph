import { useSyncExternalStore } from "react";
import {
  subscribeAiConfig,
  isChatConfigured,
  isEmbeddingsConfigured,
} from "./aiConfig";

/** chat 端点是否已配置(随设置保存即时更新) */
export function useChatConfigured(): boolean {
  return useSyncExternalStore(subscribeAiConfig, () => isChatConfigured());
}

/** embeddings 端点是否已配置(随设置保存即时更新) */
export function useEmbeddingsConfigured(): boolean {
  return useSyncExternalStore(subscribeAiConfig, () => isEmbeddingsConfigured());
}
