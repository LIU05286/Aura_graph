import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGraphStore } from "../../store/graphStore";

const STORAGE_KEY = "aura.onboarded.v1";

const STEPS: { title: string; body: string }[] = [
  {
    title: "欢迎来到 Aura Graph",
    body: "这是你的私人记忆星图。日常用法很简单:记录 → AI 整理 → 自动关联 → 日后回想与复盘。",
  },
  {
    title: "今天 · 主入口",
    body: "在『今天』里快速记一句,或粘贴一段文字让『AI 整理』帮你拆成记忆、打标签、找关联(需先在设置里配置 AI)。",
  },
  {
    title: "收件箱 / 记忆",
    body: "新记录默认进『收件箱』等待整理;『记忆』里按状态和日期查看全部记录。",
  },
  {
    title: "星图 / 智能体 / 复盘",
    body: "『星图』可视化探索,越新的记忆越亮;『智能体』基于你的记忆问答并标出引用;『复盘』生成本周/本月的主题、情绪与待办。",
  },
  {
    title: "设置 & 重看本指南",
    body: "在『设置』里配置 AI、导入导出、清空数据。任何时候点导航的『使用指南』都能重看这份说明。",
  },
];

/** 首次进入自动弹出(localStorage 记一次);也可由 store.helpOpen 随时打开 */
export default function Onboarding() {
  const helpOpen = useGraphStore((s) => s.helpOpen);
  const openHelp = useGraphStore((s) => s.openHelp);
  const closeHelp = useGraphStore((s) => s.closeHelp);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") openHelp();
    } catch {
      // 忽略隐私模式下的 localStorage 异常
    }
  }, [openHelp]);

  if (!helpOpen) return null;

  const isLast = step === STEPS.length - 1;
  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // 忽略
    }
    setStep(0);
    closeHelp();
  };

  const cur = STEPS[step];
  return createPortal(
    <div
      className="ag-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) finish();
      }}
    >
      <div className="ag-modal onboard">
        <div className="onboard-step">
          {step + 1} / {STEPS.length}
        </div>
        <div className="onboard-title">{cur.title}</div>
        <p className="onboard-body">{cur.body}</p>
        <div className="onboard-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`onboard-dot${i === step ? " is-active" : ""}`} />
          ))}
        </div>
        <div className="onboard-actions">
          <button type="button" className="ag-chip" onClick={finish}>
            跳过
          </button>
          <div className="onboard-right">
            {step > 0 && (
              <button type="button" className="ag-chip" onClick={() => setStep((s) => s - 1)}>
                上一步
              </button>
            )}
            {isLast ? (
              <button type="button" className="ag-chip ag-chip-primary" onClick={finish}>
                开始使用
              </button>
            ) : (
              <button
                type="button"
                className="ag-chip ag-chip-primary"
                onClick={() => setStep((s) => s + 1)}
              >
                下一步
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
