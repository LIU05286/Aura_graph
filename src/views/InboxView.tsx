import { useMemo } from "react";
import { useGraphStore } from "../store/graphStore";
import { getNodeStatus } from "../utils/memoryStatus";
import MemoryListView from "../features/memories/MemoryListView";
import { t } from "../i18n";

/** 收件箱:待整理记录,可标记整理完成 / 归档 */
export default function InboxView() {
  const nodes = useGraphStore((s) => s.nodes);
  const selectNode = useGraphStore((s) => s.selectNode);
  const updateNode = useGraphStore((s) => s.updateNode);

  const inboxNodes = useMemo(
    () =>
      nodes
        .filter((n) => getNodeStatus(n) === "inbox")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [nodes]
  );

  return (
    <div className="page-scroll">
      <div className="page-inner">
        <div className="page-title">{t("inbox.title")}</div>
        <MemoryListView
          nodes={inboxNodes}
          onSelect={(id) => selectNode(id)}
          emptyText={t("inbox.empty")}
          renderActions={(node) => (
            <>
              <button
                type="button"
                className="memory-action"
                onClick={() => updateNode(node.id, { status: "processed" })}
              >
                {t("inbox.markProcessed")}
              </button>
              <button
                type="button"
                className="memory-action"
                onClick={() => updateNode(node.id, { status: "archived" })}
              >
                {t("inbox.archive")}
              </button>
            </>
          )}
        />
      </div>
    </div>
  );
}
