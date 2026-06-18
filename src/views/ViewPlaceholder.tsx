import { t } from "../i18n";
import type { TranslationKey } from "../i18n/en";

/** 占位视图:第一阶段未实现的页面统一用它。 */
export default function ViewPlaceholder({ titleKey }: { titleKey: TranslationKey }) {
  return (
    <div className="view-placeholder">
      <div className="view-placeholder-title">{t(titleKey)}</div>
      <div className="view-placeholder-hint">{t("view.comingSoon")}</div>
    </div>
  );
}
