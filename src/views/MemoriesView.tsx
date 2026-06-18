import { useMemo, useState } from "react";
import { useGraphStore } from "../store/graphStore";
import { getNodeStatus } from "../utils/memoryStatus";
import type { MemoryStatus } from "../types/graph";
import type { TranslationKey } from "../i18n/en";
import MemoryListView from "../features/memories/MemoryListView";
import { t } from "../i18n";

type Filter = "all" | MemoryStatus;

const FILTERS: { id: Filter; labelKey: TranslationKey }[] = [
  { id: "all", labelKey: "memories.filterAll" },
  { id: "inbox", labelKey: "status.inbox" },
  { id: "processed", labelKey: "status.processed" },
  { id: "archived", labelKey: "status.archived" },
];

/** 记忆:全部记录 + 按状态筛选 */
export default function MemoriesView() {
  const nodes = useGraphStore((s) => s.nodes);
  const selectNode = useGraphStore((s) => s.selectNode);
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => {
    const filtered =
      filter === "all" ? nodes : nodes.filter((n) => getNodeStatus(n) === filter);
    return filtered.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [nodes, filter]);

  return (
    <div className="page-scroll">
      <div className="page-inner">
        <div className="page-title">{t("memories.title")}</div>
        <div className="memories-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`memories-filter${f.id === filter ? " is-active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
        <MemoryListView
          nodes={list}
          onSelect={(id) => selectNode(id)}
          emptyText={t("list.empty")}
        />
      </div>
    </div>
  );
}
