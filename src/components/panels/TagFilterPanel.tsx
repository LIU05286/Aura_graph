import { useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getAllTags } from "../../utils/graphFilter";
import Chip from "../ui/Chip";

/** 星座(标签)筛选:不选即显示全部,选中后只聚焦命中这些星座的节点 */
export default function TagFilterPanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const activeTags = useGraphStore((s) => s.activeTags);
  const toggleTag = useGraphStore((s) => s.toggleTag);

  const tags = useMemo(() => getAllTags(nodes), [nodes]);

  return (
    <div className="ag-section">
      <label className="ag-eyebrow">星座 · 不选即全部</label>
      <div className="ag-chips">
        {tags.map((tag) => (
          <Chip
            key={tag}
            tag
            active={activeTags.has(tag)}
            onClick={() => toggleTag(tag)}
          >
            #{tag}
          </Chip>
        ))}
      </div>
    </div>
  );
}
