import { useState } from "react";
import { useGraphStore } from "../../store/graphStore";
import type { AppView } from "../../types/graph";
import { t } from "../../i18n";
import type { TranslationKey } from "../../i18n/en";
import BottomSheet from "../ui/BottomSheet";

const PRIMARY: AppView[] = ["today", "inbox", "memories", "graph"];
const MORE: AppView[] = ["review", "agents", "settings"];

const NAV_LABEL: Record<AppView, TranslationKey> = {
  today: "nav.today",
  inbox: "nav.inbox",
  memories: "nav.memories",
  graph: "nav.graph",
  review: "nav.review",
  agents: "nav.agents",
  settings: "nav.settings",
};

/** 手机端底部 Tab:4 个主入口 + “更多”弹层(复盘 / 智能体 / 设置) */
export default function MobileTabBar() {
  const currentView = useGraphStore((s) => s.currentView);
  const setCurrentView = useGraphStore((s) => s.setCurrentView);
  const [moreOpen, setMoreOpen] = useState(false);

  const pickMore = (view: AppView) => {
    setCurrentView(view);
    setMoreOpen(false);
  };

  const moreActive = MORE.includes(currentView);

  return (
    <>
      <nav className="ms-tabbar">
        {PRIMARY.map((view) => (
          <button
            key={view}
            type="button"
            className={`ms-tab${view === currentView ? " is-active" : ""}`}
            onClick={() => setCurrentView(view)}
          >
            {t(NAV_LABEL[view])}
          </button>
        ))}
        <button
          type="button"
          className={`ms-tab${moreActive ? " is-active" : ""}`}
          onClick={() => setMoreOpen(true)}
        >
          {t("nav.more")}
        </button>
      </nav>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title={t("nav.more")}>
        <div className="ms-more-list">
          {MORE.map((view) => (
            <button
              key={view}
              type="button"
              className={`ms-more-item${view === currentView ? " is-active" : ""}`}
              onClick={() => pickMore(view)}
            >
              {t(NAV_LABEL[view])}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
