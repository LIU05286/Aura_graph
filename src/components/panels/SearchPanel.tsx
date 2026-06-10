import { useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { searchNodes } from "../../utils/graphSearch";
import { getVisibleNodeIds } from "../../utils/graphFilter";
import { TYPE_LABEL } from "../../data/visualMappings";
import { t } from "../../i18n";
import TypeDot from "../ui/TypeDot";

/** 搜索框 + 结果列表;点击结果会选中并请求相机飞向 */
export default function SearchPanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const searchTerm = useGraphStore((s) => s.searchTerm);
  const hiddenTypes = useGraphStore((s) => s.hiddenTypes);
  const activeTags = useGraphStore((s) => s.activeTags);
  const setSearchTerm = useGraphStore((s) => s.setSearchTerm);
  const selectNode = useGraphStore((s) => s.selectNode);
  const requestFocusNode = useGraphStore((s) => s.requestFocusNode);

  const visibleIds = useMemo(
    () => getVisibleNodeIds(nodes, hiddenTypes, activeTags),
    [nodes, hiddenTypes, activeTags]
  );

  const results = useMemo(() => {
    if (searchTerm.trim() === "") return [];
    return searchNodes(nodes, searchTerm).filter((n) => visibleIds.has(n.id));
  }, [nodes, searchTerm, visibleIds]);

  const pick = (id: string) => {
    selectNode(id);
    requestFocusNode(id);
  };

  return (
    <div className="ag-section">
      <label className="ag-eyebrow">{t("search.label")}</label>
      <input
        className="ag-input"
        placeholder={t("search.placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm.trim() !== "" && (
        <div className="ag-results">
          {results.length === 0 && (
            <div className="ag-result-empty">{t("search.empty")}</div>
          )}
          {results.map((n) => (
            <button key={n.id} className="ag-result" onClick={() => pick(n.id)}>
              <TypeDot type={n.type} />
              <span className="ag-result-title">{n.title}</span>
              <span className="ag-result-type">{TYPE_LABEL[n.type]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
