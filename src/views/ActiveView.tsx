import { useGraphStore } from "../store/graphStore";
import TodayView from "./TodayView";
import InboxView from "./InboxView";
import MemoriesView from "./MemoriesView";
import GraphView from "./GraphView";
import ReviewView from "./ReviewView";
import AgentsView from "./AgentsView";
import SettingsView from "./SettingsView";

/** 根据 currentView 渲染当前主视图。 */
export default function ActiveView() {
  const view = useGraphStore((s) => s.currentView);
  switch (view) {
    case "today":
      return <TodayView />;
    case "inbox":
      return <InboxView />;
    case "memories":
      return <MemoriesView />;
    case "graph":
      return <GraphView />;
    case "review":
      return <ReviewView />;
    case "agents":
      return <AgentsView />;
    case "settings":
      return <SettingsView />;
    default:
      return <GraphView />;
  }
}
