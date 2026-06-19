import type { ReactNode } from "react";
import type { MemoryNode } from "../../types/graph";
import { dayKey, formatDayHeader } from "../../utils/dateLabel";
import MemoryCard from "./MemoryCard";

interface MemoryListViewProps {
  nodes: MemoryNode[];
  onSelect?: (id: string) => void;
  renderActions?: (node: MemoryNode) => ReactNode;
  emptyText?: string;
  /** 按创建日期分组并显示日期小标题 */
  groupByDate?: boolean;
}

/** 记忆列表:把节点渲染成一列卡片 */
export default function MemoryListView({
  nodes,
  onSelect,
  renderActions,
  emptyText,
  groupByDate = false,
}: MemoryListViewProps) {
  if (nodes.length === 0) {
    return <div className="memory-list-empty">{emptyText}</div>;
  }

  const card = (node: MemoryNode) => (
    <MemoryCard
      key={node.id}
      node={node}
      onClick={onSelect ? () => onSelect(node.id) : undefined}
      actions={renderActions ? renderActions(node) : undefined}
    />
  );

  if (!groupByDate) {
    return <div className="memory-list">{nodes.map(card)}</div>;
  }

  // 按天分组(假定 nodes 已按时间倒序)
  const groups: { key: string; label: string; items: MemoryNode[] }[] = [];
  const index = new Map<string, number>();
  for (const n of nodes) {
    const k = dayKey(n.createdAt);
    let i = index.get(k);
    if (i === undefined) {
      i = groups.length;
      index.set(k, i);
      groups.push({ key: k, label: formatDayHeader(n.createdAt), items: [] });
    }
    groups[i].items.push(n);
  }

  return (
    <div className="memory-list">
      {groups.map((g) => (
        <div key={g.key}>
          <div className="memory-day">{g.label}</div>
          {g.items.map(card)}
        </div>
      ))}
    </div>
  );
}
