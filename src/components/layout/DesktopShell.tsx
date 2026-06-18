import NavSidebar from "./NavSidebar";
import Inspector from "./Inspector";
import ActiveView from "../../views/ActiveView";

/** 桌面端三栏:左导航 + 中主工作区 + 右 Inspector */
export default function DesktopShell() {
  return (
    <div className="ds-shell">
      <NavSidebar />
      <main className="ds-main">
        <ActiveView />
      </main>
      <Inspector />
    </div>
  );
}
