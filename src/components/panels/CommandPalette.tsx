import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useGraphStore } from "../../store/graphStore";
import { computeLayout } from "../../utils/graphLayout";
import { TYPE_LABEL } from "../../data/visualMappings";
import TypeDot from "../ui/TypeDot";
import { t } from "../../i18n";

interface Action {
  id: string;
  label: string;
  run: () => void;
}

/** ⌘K / Ctrl-K 命令面板:跳到任意星,或运行快捷动作。Esc / 点遮罩关闭。 */
export default function CommandPalette() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selectNode = useGraphStore((s) => s.selectNode);
  const requestFocusNode = useGraphStore((s) => s.requestFocusNode);
  const openCreateNode = useGraphStore((s) => s.openCreateNode);
  const setNodePositions = useGraphStore((s) => s.setNodePositions);
  const resetToSeed = useGraphStore((s) => s.resetToSeed);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey as unknown as EventListener);
    return () => window.removeEventListener("keydown", onKey as unknown as EventListener);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const actions: Action[] = useMemo(
    () => [
      { id: "new", label: t("cmd.newNode"), run: () => openCreateNode() },
      {
        id: "relayout",
        label: t("cmd.relayout"),
        run: () => setNodePositions(computeLayout(nodes, edges)),
      },
      {
        id: "demo",
        label: t("cmd.loadDemo"),
        run: () => {
          if (window.confirm(t("io.confirmReset"))) resetToSeed();
        },
      },
    ],
    [nodes, edges, openCreateNode, setNodePositions, resetToSeed]
  );

  const q = query.trim().toLowerCase();
  const matchedActions =
    q === "" ? actions : actions.filter((a) => a.label.toLowerCase().includes(q));
  const matchedNodes = useMemo(() => {
    if (q === "") return nodes.slice(0, 8);
    return nodes.filter((n) => n.title.toLowerCase().includes(q)).slice(0, 8);
  }, [nodes, q]);

  if (!open) return null;

  const close = () => setOpen(false);
  const runAction = (a: Action) => {
    a.run();
    close();
  };
  const pick = (id: string) => {
    selectNode(id);
    requestFocusNode(id);
    close();
  };
  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (matchedActions[0]) runAction(matchedActions[0]);
    else if (matchedNodes[0]) pick(matchedNodes[0].id);
  };

  return (
    <div className="ag-cmd-overlay" onClick={close}>
      <div className="ag-cmd" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="ag-cmd-input"
          placeholder={t("cmd.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
        />
        <div className="ag-cmd-results">
          {matchedActions.length > 0 && (
            <>
              <div className="ag-cmd-group">{t("cmd.actions")}</div>
              {matchedActions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="ag-cmd-row"
                  onClick={() => runAction(a)}
                >
                  <span className="ag-cmd-icon">⌘</span>
                  <span className="ag-cmd-label">{a.label}</span>
                </button>
              ))}
            </>
          )}
          {matchedNodes.length > 0 && (
            <>
              <div className="ag-cmd-group">{t("cmd.stars")}</div>
              {matchedNodes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="ag-cmd-row"
                  onClick={() => pick(n.id)}
                >
                  <TypeDot type={n.type} />
                  <span className="ag-cmd-label">{n.title}</span>
                  <span className="ag-cmd-type">{TYPE_LABEL[n.type]}</span>
                </button>
              ))}
            </>
          )}
          {matchedActions.length === 0 && matchedNodes.length === 0 && (
            <div className="ag-cmd-empty">{t("cmd.empty")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
