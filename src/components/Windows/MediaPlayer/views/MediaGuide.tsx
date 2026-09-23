import { useT } from "src/i18n";

export default function MediaGuide() {
  const t = useT();
  return (
    <div className="h-full overflow-y-auto p-5 text-white">
      <div className="mb-3 border-b border-white/15 pb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">
        {t("wmp.guide")}
      </div>
      <h2 className="mb-2 text-lg font-semibold">Windows Media Player</h2>
      <p className="max-w-prose text-sm text-white/80">
        {t("wmp.guideText")}
      </p>
    </div>
  );
}
