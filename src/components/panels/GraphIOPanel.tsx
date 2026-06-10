import { useRef, type ChangeEvent } from "react";
import { useGraphStore } from "../../store/graphStore";
import { t } from "../../i18n";
import { exportGraphToFile, parseGraphFromText } from "../../utils/graphIO";

export default function GraphIOPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const replaceGraph = useGraphStore((s) => s.replaceGraph);
  const resetToSeed = useGraphStore((s) => s.resetToSeed);

  const onExport = () => {
    exportGraphToFile({ nodes, edges });
  };

  const onPickFile = () => {
    inputRef.current?.click();
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const graph = parseGraphFromText(text);
        replaceGraph(graph);
      } catch (error) {
        const message = error instanceof Error ? error.message : t("io.importFailed");
        console.error(error);
        window.alert(message);
      } finally {
        event.target.value = "";
      }
    };
    reader.onerror = () => {
      const error = reader.error ?? new Error("导入失败");
      console.error(error);
      window.alert(error instanceof Error ? error.message : "导入失败");
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const onReset = () => {
    if (window.confirm(t("io.confirmReset"))) {
      resetToSeed();
    }
  };

  return (
    <div className="ag-section">
      <label className="ag-eyebrow">{t("io.dataLabel")}</label>
      <div className="ag-chips">
        <button type="button" className="ag-chip" onClick={onExport}>
          {t("io.exportJson")}
        </button>
        <button type="button" className="ag-chip" onClick={onPickFile}>
          {t("io.importJson")}
        </button>
        <button type="button" className="ag-chip" onClick={onReset}>
          {t("io.reset")}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="ag-file-input"
        onChange={onFileChange}
      />
    </div>
  );
}
