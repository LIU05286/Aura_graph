import type { ReactNode } from "react";
import type { MemoryNode } from "../../types/graph";
import type { TranslationKey } from "../../i18n/en";
import { TYPE_LABEL } from "../../data/visualMappings";
import { getNodeStatus } from "../../utils/memoryStatus";
import { formatShort } from "../../utils/dateLabel";
import { t } from "../../i18n";
import TypeDot from "../../components/ui/TypeDot";

interface MemoryCardProps {
  node: MemoryNode;
  onClick?: () => void;
  actions?: ReactNode;
}

/** 记忆卡片:类型 + 状态 + 标题 + 摘要 + 标签 + 日期(可带操作按钮) */
export default function MemoryCard({ node, onClick, actions }: MemoryCardProps) {
  const status = getNodeStatus(node);
  const title = node.title.trim() || t("memory.untitled");
  const snippet = node.content.trim().slice(0, 90);

  return (
    <div className="memory-card">
      <button type="button" className="memory-card-main" onClick={onClick}>
        <div className="memory-card-head">
          <span className="memory-card-type">
            <TypeDot type={node.type} />
            {TYPE_LABEL[node.type]}
          </span>
          <span className={`memory-status memory-status-${status}`}>
            {t(("status." + status) as TranslationKey)}
          </span>
        </div>
        <div className="memory-card-title">{title}</div>
        {snippet && <div className="memory-card-snippet">{snippet}</div>}
        <div className="memory-card-foot">
          {node.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="memory-card-tag">
              #{tag}
            </span>
          ))}
          <span className="memory-card-date">{formatShort(node.createdAt)}</span>
        </div>
      </button>
      {actions && <div className="memory-card-actions">{actions}</div>}
    </div>
  );
}
