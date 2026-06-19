import type { MemoryNode } from "../types/graph";
import { routerAgent } from "./routerAgent";
import { memoryExtractionAgent } from "./memoryExtractionAgent";
import { memoryMergeAgent } from "./memoryMergeAgent";
import { relationAgent } from "./relationAgent";
import type { AgentProposal } from "./types";

export interface OrchestratorOptions {
  signal?: AbortSignal;
  onStep?: (step: string) => void;
}

/** 编排:路由 → 抽取 → 合并候选 → 关系建议。返回提案,不写库。 */
export async function runOrganize(
  text: string,
  existing: MemoryNode[],
  opts: OrchestratorOptions = {}
): Promise<AgentProposal> {
  const step = (s: string) => opts.onStep?.(s);

  step("router");
  const route = await routerAgent(text, { signal: opts.signal });

  step("extract");
  const extracted = await memoryExtractionAgent(text, route.suggestedType, {
    signal: opts.signal,
  });

  step("merge");
  const withMerge = await memoryMergeAgent(extracted, existing, { signal: opts.signal });

  step("relations");
  const relations = await relationAgent(withMerge, existing, { signal: opts.signal });

  const tagSet = new Set<string>();
  for (const n of withMerge) for (const tg of n.tags) tagSet.add(tg);

  return { nodes: withMerge, tags: Array.from(tagSet), relations };
}
