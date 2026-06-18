import type { MemoryNode, MemoryStatus } from "../types/graph";

/** 旧数据没有 status:一律视为"已整理",避免历史节点涌入收件箱 */
export function getNodeStatus(node: MemoryNode): MemoryStatus {
  return node.status ?? "processed";
}
