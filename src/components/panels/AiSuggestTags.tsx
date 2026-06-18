import { useState } from "react";
import { useGraphStore } from "../../store/graphStore";
import type { MemoryNode } from "../../types/graph";
import { deepseekChat } from "../../ai/deepseek";
import { useChatConfigured } from "../../ai/useAiConfig";
import { t } from "../../i18n";
import AiConfigGate from "./AiConfigGate";

/** AI 标签建议:只建议,用户点 + 才写入节点 tags */
export default function AiSuggestTags({ node }: { node: MemoryNode }) {
  const nodes = useGraphStore((s) => s.nodes);
  const updateNode = useGraphStore((s) => s.updateNode);
  const chatOk = useChatConfigured();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);

  const suggest = async () => {
    setLoading(true);
    setError("");
    setSuggestions(null);
    try {
      // 现有标签词表(整图去重),提示模型尽量复用,避免标签碎片化
      const vocabulary = Array.from(new Set(nodes.flatMap((n) => n.tags))).sort();
      const existing = new Set(node.tags.map((x) => x.toLowerCase()));

      const system =
        "You assign short topic tags to a knowledge note. " +
        "Prefer reusing tags from the existing vocabulary when they fit; " +
        "otherwise propose concise new tags (one or two words, lowercase, no '#'). " +
        "Return at most 5 tags, most relevant first. " +
        'Reply ONLY as JSON: {"tags":["tag1","tag2"]}';

      const focal = { title: node.title, type: node.type, content: node.content };
      const user =
        "Note:\n" + JSON.stringify(focal) +
        "\n\nExisting tag vocabulary:\n" + JSON.stringify(vocabulary);

      const raw = await deepseekChat(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        { json: true }
      );

      const parsed = JSON.parse(raw) as { tags?: unknown };
      const list = Array.isArray(parsed.tags) ? parsed.tags : [];
      const cleaned: string[] = [];
      const seen = new Set<string>();
      for (const item of list) {
        if (typeof item !== "string") continue;
        const tag = item.trim().replace(/^#+/, "").toLowerCase();
        if (!tag) continue;
        if (existing.has(tag) || seen.has(tag)) continue;
        seen.add(tag);
        cleaned.push(tag);
      }
      setSuggestions(cleaned);
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setLoading(false);
    }
  };

  const accept = (tag: string) => {
    updateNode(node.id, { tags: [...node.tags, tag] });
    setSuggestions((prev) => (prev ? prev.filter((x) => x !== tag) : prev));
  };

  return (
    <div className="ag-ai ag-ai-tags">
      {chatOk ? (
        <button type="button" className="ag-chip ag-ai-btn" onClick={suggest} disabled={loading}>
          {loading ? t("ai.suggesting") : t("ai.suggestTags")}
        </button>
      ) : (
        <AiConfigGate />
      )}

      {error && <div className="ag-ai-error">{error}</div>}

      {suggestions && suggestions.length === 0 && !error && (
        <div className="ag-ai-empty">{t("ai.tagsNone")}</div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="ag-ai-tag-row">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              className="ag-chip ag-ai-tag"
              onClick={() => accept(tag)}
            >
              + #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
