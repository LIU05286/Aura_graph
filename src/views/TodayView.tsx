import { useMemo } from "react";
import { useGraphStore } from "../store/graphStore";
import { getNodeStatus } from "../utils/memoryStatus";
import CaptureCenter from "../features/capture/CaptureCenter";
import MemoryListView from "../features/memories/MemoryListView";
import { t } from "../i18n";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString();
}

/** 今天:记录中心 + 今日记录 + 收件箱待整理提示 */
export default function TodayView() {
  const nodes = useGraphStore((s) => s.nodes);
  const selectNode = useGraphStore((s) => s.selectNode);
  const setCurrentView = useGraphStore((s) => s.setCurrentView);

  const todayNodes = useMemo(
    () =>
      nodes
        .filter((n) => isToday(n.createdAt))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [nodes]
  );

  const inboxCount = useMemo(
    () => nodes.filter((n) => getNodeStatus(n) === "inbox").length,
    [nodes]
  );

  return (
    <div className="page-scroll">
      <div className="page-inner">
        <CaptureCenter />

        {inboxCount > 0 && (
          <button
            type="button"
            className="today-inbox-banner"
            onClick={() => setCurrentView("inbox")}
          >
            <span>{t("today.inboxPending", { count: inboxCount })}</span>
            <span className="today-inbox-go">{t("today.goInbox")}</span>
          </button>
        )}

        <div className="page-section-title">{t("today.todayRecords")}</div>
        <MemoryListView
          nodes={todayNodes}
          onSelect={(id) => selectNode(id)}
          emptyText={t("list.empty")}
        />
      </div>
    </div>
  );
}
