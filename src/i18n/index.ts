import { en, type TranslationKey } from "./en";

/**
 * 取词函数。第二个参数可传入插值变量,会替换文案里的 {key}。
 * 例:t("control.footer", { count: 17 })
 */
export function t(
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  let text: string = en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}
