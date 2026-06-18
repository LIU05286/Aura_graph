import { useMemo, useState, type KeyboardEvent } from "react";
import { useGraphStore } from "../../store/graphStore";
import { searchNodes } from "../../utils/graphSearch";
import { getVisibleNodeIds } from "../../utils/graphFilter";
import { TYPE_LABEL } from "../../data/visualMappings";
import { embedTexts, embedOne } from "../../ai/relay";
import { useEmbeddingsConfigured } from "../../ai/useAiConfig";
import type { MemoryNode } from "../../types/graph";
import { t } from "../../i18n";
import AiConfigGate from "./AiConfigGate";
import TypeDot from "../ui/TypeDot";

// 模块级 embedding 缓存:键为节点文本,文本不变即复用,跨渲染/重挂载保留(单会话)
const embedCache = new Map<string, number[]>();

function embedText(n: MemoryNode): string {
  return `${n.title}\n\n${n.content ?? ""}`.trim();
}

function cosine(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

type Mode = "text" | "semantic";
interface Ranked {
  node: MemoryNode;
  score: number;
}

/** 搜索框:文本(子串)/ 语义(向量)两种模式;点击结果选中并请求相机飞向 */
export default function SearchPanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const searchTerm = useGraphStore((s) => s.searchTerm);
  const hiddenTypes = useGraphStore((s) => s.hiddenTypes);
  const activeTags = useGraphStore((s) => s.activeTags);
  const timeWindow = useGraphStore((s) => s.timeWindow);
  const setSearchTerm = useGraphStore((s) => s.setSearchTerm);
  const selectNode = useGraphStore((s) => s.selectNode);
  const requestFocusNode = useGraphStore((s) => s.requestFocusNode);
  const openAiSettings = useGraphStore((s) => s.openAiSettings);
  const embeddingsOk = useEmbeddingsConfigured();

  const [mode, setMode] = useState<Mode>("text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [semanticResults, setSemanticResults] = useState<Ranked[] | null>(null);

  const visibleIds = useMemo(
    () => getVisibleNodeIds(nodes, hiddenTypes, activeTags, timeWindow),
    [nodes, hiddenTypes, activeTags, timeWindow]
  );

  const textResults = useMemo(() => {
    if (mode !== "text" || searchTerm.trim() === "") return [];
    return searchNodes(nodes, searchTerm).filter((n) => visibleIds.has(n.id));
  }, [mode, nodes, searchTerm, visibleIds]);

  const pick = (id: string) => {
    selectNode(id);
    requestFocusNode(id);
  };

  const runSemantic = async () => {
    if (!embeddingsOk) {
      openAiSettings();
      return;
    }
    const q = searchTerm.trim();
    if (!q) {
      setSemanticResults(null);
      return;
    }
    const candidates = nodes.filter((n) => visibleIds.has(n.id));
    if (candidates.length === 0) {
      setSemanticResults([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const missing = candidates.filter((n) => !embedCache.has(embedText(n)));
      if (missing.length > 0) {
        const vecs = await embedTexts(missing.map(embedText));
        missing.forEach((n, i) => {
          const v = vecs[i];
          if (v && v.length) embedCache.set(embedText(n), v);
        });
      }
      const qv = await embedOne(q);
      const ranked: Ranked[] = candidates
        .map((n) => {
          const v = embedCache.get(embedText(n));
          return { node: n, score: v ? cosine(qv, v) : 0 };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);
      setSemanticResults(ranked);
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
      setSemanticResults(null);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (mode === "semantic" && e.key === "Enter") {
      e.preventDefault();
      runSemantic();
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setSemanticResults(null);
  };

  return (
    <div className="ag-section">
      <label className="ag-eyebrow">{t("search.label")}</label>

      <div className="ag-search-modes">
        <button
          type="button"
          className={`ag-chip${mode === "text" ? " on" : ""}`}
          onClick={() => switchMode("text")}
        >
          {t("search.modeText")}
        </button>
        <button
          type="button"
          className={`ag-chip${mode === "semantic" ? " on" : ""}`}
          onClick={() => switchMode("semantic")}
        >
          {t("search.modeSemantic")}
        </button>
      </div>

      <input
        className="ag-input"
        placeholder={mode === "semantic" ? t("search.semanticPlaceholder") : t("search.placeholder")}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (mode === "semantic") setSemanticResults(null);
        }}
        onKeyDown={onKeyDown}
      />

      {mode === "semantic" &&
        (embeddingsOk ? (
          <button type="button" className="ag-chip ag-search-run" onClick={runSemantic} disabled={loading}>
            {loading ? t("search.searching") : t("search.semanticSearch")}
          </button>
        ) : (
          <AiConfigGate />
        ))}

      {(mode === "text" ? searchTerm.trim() !== "" : semanticResults !== null || error !== "") && (
        <div className="ag-results">
          {error && <div className="ag-result-empty">{error}</div>}
          {!error && mode === "text" && textResults.length === 0 && (
            <div className="ag-result-empty">{t("search.empty")}</div>
          )}
          {!error && mode === "text" && textResults.map((n) => (
            <button key={n.id} className="ag-result" onClick={() => pick(n.id)}>
              <TypeDot type={n.type} />
              <span className="ag-result-title">{n.title}</span>
              <span className="ag-result-type">{TYPE_LABEL[n.type]}</span>
            </button>
          ))}
          {!error && mode === "semantic" && semanticResults && semanticResults.length === 0 && (
            <div className="ag-result-empty">{t("search.semanticEmpty")}</div>
          )}
          {!error && mode === "semantic" && semanticResults && semanticResults.map(({ node, score }) => (
            <button key={node.id} className="ag-result" onClick={() => pick(node.id)}>
              <TypeDot type={node.type} />
              <span className="ag-result-title">{node.title}</span>
              <span className="ag-result-type">{(score * 100).toFixed(0)}%</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
