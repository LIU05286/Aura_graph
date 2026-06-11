import type { MemoryNode, MemoryNodeType, TimeWindow } from "../types/graph";

/**
 * 计算当前可见的节点 id 集合。
 * 规则:类型未被关闭(不在 hiddenTypes) 且
 *      (无星座过滤 或 节点至少命中一个被激活的星座)。
 */
export function getVisibleNodeIds(
  nodes: MemoryNode[],
  hiddenTypes: Set<MemoryNodeType>,
  activeTags: Set<string>,
  timeWindow: TimeWindow | null = null
): Set<string> {
  const visible = new Set<string>();
  for (const n of nodes) {
    if (hiddenTypes.has(n.type)) continue;
    if (activeTags.size > 0 && !n.tags.some((t) => activeTags.has(t))) continue;
    if (timeWindow) {
      const ts = Date.parse(n.createdAt);
      if (!Number.isNaN(ts) && (ts < timeWindow.start || ts > timeWindow.end)) {
        continue;
      }
    }
    visible.add(n.id);
  }
  return visible;
}

/** 从所有节点收集去重后的标签列表(用于标签筛选面板) */
export function getAllTags(nodes: MemoryNode[]): string[] {
  const set = new Set<string>();
  for (const n of nodes) for (const t of n.tags) set.add(t);
  return Array.from(set);
}
