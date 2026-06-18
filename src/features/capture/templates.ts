import type { MemoryNodeType } from "../../types/graph";
import type { TranslationKey } from "../../i18n/en";

export interface CaptureTemplate {
  id: string;
  labelKey: TranslationKey;
  placeholderKey: TranslationKey;
  type: MemoryNodeType;
}

/** 记录模板:决定新记忆的类型与输入提示 */
export const CAPTURE_TEMPLATES: CaptureTemplate[] = [
  { id: "life", labelKey: "tpl.life", placeholderKey: "tpl.life.ph", type: "life" },
  { id: "idea", labelKey: "tpl.idea", placeholderKey: "tpl.idea.ph", type: "idea" },
  { id: "book", labelKey: "tpl.book", placeholderKey: "tpl.book.ph", type: "book" },
  { id: "phrase", labelKey: "tpl.phrase", placeholderKey: "tpl.phrase.ph", type: "phrase" },
  { id: "knowledge", labelKey: "tpl.knowledge", placeholderKey: "tpl.knowledge.ph", type: "knowledge" },
  { id: "project", labelKey: "tpl.project", placeholderKey: "tpl.project.ph", type: "project" },
];
