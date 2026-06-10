import { t } from "../../i18n";

/** 1~5 的重要度 / 强度星级显示 */
export default function Stars({ value }: { value: number }) {
  return (
    <div className="ag-stars" title={t("stars.tooltip", { value })}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? "on" : ""}>
          ★
        </span>
      ))}
    </div>
  );
}
