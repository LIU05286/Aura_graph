import type { MemoryNode } from "../types/graph";

/**
 * 按标题 + 正文做大小写不敏感的子串匹配。
 * 返回命中节点 id 集合;若搜索词为空返回 null(表示"无搜索"状态)。
 */
export function getMatchedNodeIds(
  nodes: MemoryNode[],
  term: string
): Set<string> | null {
  const q = term.trim().toLowerCase();
  if (q === "") return null;
  const matched = new Set<string>();
  for (const n of nodes) {
    if ((n.title + " " + n.content).toLowerCase().includes(q)) {
      matched.add(n.id);
    }
  }
  return matched;
}

/** 返回命中的节点列表(供搜索结果面板使用) */
export function searchNodes(nodes: MemoryNode[], term: string): MemoryNode[] {
  const ids = getMatchedNodeIds(nodes, term);
  if (!ids) return [];
  return nodes.filter((n) => ids.has(n.id));
}
