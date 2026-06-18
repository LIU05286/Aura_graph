import { useGraphStore } from "../../store/graphStore";
import { APP_VIEWS, type AppView } from "../../types/graph";
import { t } from "../../i18n";
import type { TranslationKey } from "../../i18n/en";
import GalaxyPanel from "../panels/GalaxyPanel";

const NAV_LABEL: Record<AppView, TranslationKey> = {
  today: "nav.today",
  inbox: "nav.inbox",
  memories: "nav.memories",
  graph: "nav.graph",
  review: "nav.review",
  agents: "nav.agents",
  settings: "nav.settings",
};

/** 桌面端左侧导航:品牌 + 星系切换 + 七视图入口 */
export default function NavSidebar() {
  const currentView = useGraphStore((s) => s.currentView);
  const setCurrentView = useGraphStore((s) => s.setCurrentView);

  return (
    <nav className="ds-nav">
      <div className="ds-nav-brand">
        <span className="ag-brand-mark" />
        <div>
          <div className="ag-brand-name">{t("app.name")}</div>
          <div className="ag-brand-sub">{t("app.tagline")}</div>
        </div>
      </div>

      <GalaxyPanel />

      <ul className="ds-nav-list">
        {APP_VIEWS.map((view) => (
          <li key={view}>
            <button
              type="button"
              className={`ds-nav-item${view === currentView ? " is-active" : ""}`}
              onClick={() => setCurrentView(view)}
            >
              {t(NAV_LABEL[view])}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
