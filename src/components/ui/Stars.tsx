/** 1~5 的重要度 / 强度星级显示 */
export default function Stars({ value }: { value: number }) {
  return (
    <div className="ag-stars" title={`重要度 ${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? "on" : ""}>
          ★
        </span>
      ))}
    </div>
  );
}
