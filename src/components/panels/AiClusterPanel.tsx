import { useState } from "react";
import { useGraphStore } from "../../store/graphStore";
import { deepseekChat } from "../../ai/deepseek";
import { t } from "../../i18n";

interface Cluster {
  name: string;
  nodeIds: string[];
}

/** AI 聚类:把当前星系节点归成几个主题星座;用户点 Apply 才把组名作为标签写入成员 */
export default function AiClusterPanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const updateNode = useGraphStore((s) => s.updateNode);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clusters, setClusters] = useState<Cluster[] | null>(null);

  const suggest = async () => {
    setLoading(true);
    setError("");
    setClusters(null);
    try {
      if (nodes.length < 3) {
        setError(t("cluster.tooFew"));
        return;
      }
      const items = nodes.map((n) => ({
        id: n.id,
        title: n.title,
        type: n.type,
        tags: n.tags,
      }));
      const system =
        "You organize knowledge-graph nodes into a few thematic groups (constellations). " +
        "Use 2 to 6 groups; every group needs a short lowercase name (one or two words, no '#'). " +
        "Each node may appear in at most one group; you may leave unrelated nodes out. " +
        "Only use id values from the provided list. " +
        'Reply ONLY as JSON: {"clusters":[{"name":"...","nodeIds":["..."]}]}';
      const user = "Nodes:\n" + JSON.stringify(items);

      const raw = await deepseekChat(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        { json: true }
      );

      const parsed = JSON.parse(raw) as { clusters?: unknown };
      const list = Array.isArray(parsed.clusters) ? parsed.clusters : [];
      const validIds = new Set(nodes.map((n) => n.id));
      const cleaned: Cluster[] = [];
      for (const item of list) {
        if (!item || typeof item !== "object") continue;
        const rec = item as Record<string, unknown>;
        const name =
          typeof rec.name === "string"
            ? rec.name.trim().replace(/^#+/, "").toLowerCase()
            : "";
        const ids = Array.isArray(rec.nodeIds)
          ? Array.from(
              new Set(
                rec.nodeIds.filter(
                  (x): x is string => typeof x === "string" && validIds.has(x)
                )
              )
            )
          : [];
        if (name && ids.length > 0) cleaned.push({ name, nodeIds: ids });
      }
      setClusters(cleaned);
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setLoading(false);
    }
  };

  const apply = (c: Cluster) => {
    for (const id of c.nodeIds) {
      const node = nodes.find((n) => n.id === id);
      if (!node) continue;
      if (node.tags.includes(c.name)) continue;
      updateNode(id, { tags: [...node.tags, c.name] });
    }
    setClusters((prev) => (prev ? prev.filter((x) => x !== c) : prev));
  };

  const titleOf = (id: string) => nodes.find((n) => n.id === id)?.title ?? id;

  return (
    <div className="ag-section ag-cluster">
      <label className="ag-eyebrow">{t("cluster.label")}</label>
      <button
        type="button"
        className="ag-chip ag-chip-primary ag-ai-btn"
        onClick={suggest}
        disabled={loading}
      >
        {loading ? t("ai.suggesting") : t("cluster.suggest")}
      </button>

      {error && <div className="ag-ai-error">{error}</div>}
      {clusters && clusters.length === 0 && !error && (
        <div className="ag-ai-empty">{t("cluster.none")}</div>
      )}

      {clusters && clusters.length > 0 && (
        <div className="ag-cluster-list">
          {clusters.map((c, i) => (
            <div key={i} className="ag-cluster-item">
              <div className="ag-cluster-head">
                <span className="ag-cluster-name">#{c.name}</span>
                <button type="button" className="ag-chip ag-cluster-apply" onClick={() => apply(c)}>
                  {t("cluster.apply")}
                </button>
              </div>
              <div className="ag-cluster-members">
                {c.nodeIds.map((id) => (
                  <span key={id} className="ag-cluster-member">{titleOf(id)}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
