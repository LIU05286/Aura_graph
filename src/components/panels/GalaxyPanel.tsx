import { useGraphStore } from "../../store/graphStore";
import { t } from "../../i18n";
import Chip from "../ui/Chip";

/** 星系切换器:列出所有星系(当前高亮)+ 新建 / 重命名 / 删除 */
export default function GalaxyPanel() {
  const galaxies = useGraphStore((s) => s.galaxies);
  const activeGalaxyId = useGraphStore((s) => s.activeGalaxyId);
  const switchGalaxy = useGraphStore((s) => s.switchGalaxy);
  const createGalaxy = useGraphStore((s) => s.createGalaxy);
  const renameGalaxy = useGraphStore((s) => s.renameGalaxy);
  const deleteGalaxy = useGraphStore((s) => s.deleteGalaxy);

  const active = galaxies.find((g) => g.id === activeGalaxyId) ?? null;

  const onNew = () => {
    const name = window.prompt(t("galaxy.promptNewName"));
    if (name && name.trim()) {
      void createGalaxy(name.trim());
    }
  };

  const onRename = () => {
    if (!active) return;
    const name = window.prompt(t("galaxy.promptRename"), active.name);
    if (name && name.trim()) {
      void renameGalaxy(active.id, name.trim());
    }
  };

  const onDelete = () => {
    if (!active) return;
    if (galaxies.length <= 1) {
      window.alert(t("galaxy.cannotDeleteLast"));
      return;
    }
    if (window.confirm(t("galaxy.confirmDelete", { name: active.name }))) {
      void deleteGalaxy(active.id);
    }
  };

  return (
    <div className="ag-section">
      <label className="ag-eyebrow">{t("galaxy.label")}</label>
      <div className="ag-chips">
        {galaxies.map((g) => (
          <Chip
            key={g.id}
            active={g.id === activeGalaxyId}
            color={g.accentColor}
            onClick={() => switchGalaxy(g.id)}
          >
            {g.name}
          </Chip>
        ))}
      </div>
      <div className="ag-chips">
        <button type="button" className="ag-chip ag-chip-primary" onClick={onNew}>
          {t("galaxy.new")}
        </button>
        <button
          type="button"
          className="ag-chip"
          onClick={onRename}
          disabled={!active}
        >
          {t("galaxy.rename")}
        </button>
        <button
          type="button"
          className="ag-chip"
          onClick={onDelete}
          disabled={!active || galaxies.length <= 1}
        >
          {t("galaxy.delete")}
        </button>
      </div>
    </div>
  );
}
