import type { MemoryNodeType } from "../../types/graph";
import { TYPE_COLOR } from "../../data/visualMappings";

/** 一个按类型着色的小圆点,带轻微发光 */
export default function TypeDot({ type }: { type: MemoryNodeType }) {
  return (
    <span
      className="ag-dot"
      style={{ background: TYPE_COLOR[type], color: TYPE_COLOR[type] }}
    />
  );
}
