import type { ReactNode } from "react";
import type { MemoryNode } from "../../types/graph";
import MemoryCard from "./MemoryCard";

interface MemoryListViewProps {
  nodes: MemoryNode[];
  onSelect?: (id: string) => void;
  renderActions?: (node: MemoryNode) => ReactNode;
  emptyText?: string;
}

/** 记忆列表:把节点渲染成一列卡片 */
export default function MemoryListView({
  nodes,
  onSelect,
  renderActions,
  emptyText,
}: MemoryListViewProps) {
  if (nodes.length === 0) {
    return <div className="memory-list-empty">{emptyText}</div>;
  }
  return (
    <div className="memory-list">
      {nodes.map((node) => (
        <MemoryCard
          key={node.id}
          node={node}
          onClick={onSelect ? () => onSelect(node.id) : undefined}
          actions={renderActions ? renderActions(node) : undefined}
        />
      ))}
    </div>
  );
}
