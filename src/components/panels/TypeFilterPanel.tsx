import { useGraphStore } from "../../store/graphStore";
import { NODE_TYPES } from "../../types/graph";
import { TYPE_COLOR, TYPE_LABEL } from "../../data/visualMappings";
import Chip from "../ui/Chip";
import TypeDot from "../ui/TypeDot";

/** 类型筛选:点亮即显示,熄灭即隐藏该类型 */
export default function TypeFilterPanel() {
  const hiddenTypes = useGraphStore((s) => s.hiddenTypes);
  const toggleType = useGraphStore((s) => s.toggleType);

  return (
    <div className="ag-section">
      <label className="ag-eyebrow">类型 · 点亮即显示</label>
      <div className="ag-chips">
        {NODE_TYPES.map((t) => {
          const on = !hiddenTypes.has(t);
          return (
            <Chip
              key={t}
              active={on}
              color={TYPE_COLOR[t]}
              onClick={() => toggleType(t)}
            >
              <TypeDot type={t} />
              {TYPE_LABEL[t]}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
