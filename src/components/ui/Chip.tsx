import type { ReactNode, CSSProperties } from "react";

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  /** 激活时的主色(类型筛选用;标签筛选留空,由 CSS 处理) */
  color?: string;
  /** 是否为星座(标签)样式 */
  tag?: boolean;
  /** 静态展示(不可点击,如详情面板里的标签) */
  isStatic?: boolean;
}

export default function Chip({
  children,
  active = false,
  onClick,
  color,
  tag = false,
  isStatic = false,
}: ChipProps) {
  const className = ["ag-chip", active ? "on" : "", tag ? "tag" : "", isStatic ? "static" : ""]
    .filter(Boolean)
    .join(" ");

  const style: CSSProperties | undefined =
    active && color && !tag ? { borderColor: color, color } : undefined;

  if (isStatic) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" className={className} style={style} onClick={onClick}>
      {children}
    </button>
  );
}
