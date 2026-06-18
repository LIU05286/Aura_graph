import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 768px)";

function getMql(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(QUERY);
}

function subscribe(callback: () => void): () => void {
  const mql = getMql();
  if (!mql) return () => {};
  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }
  mql.addListener(callback);
  return () => mql.removeListener(callback);
}

function getSnapshot(): boolean {
  const mql = getMql();
  return mql ? mql.matches : false;
}

/** 是否处于移动端布局(视口宽度 ≤ 768px) */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
