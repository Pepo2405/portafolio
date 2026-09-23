import { useEffect, useRef } from "react";
import { useT } from "src/i18n";

interface Props {
  title: string;
  message: string;
  onClose: () => void;
}

export default function XpDialog({ title, message, onClose }: Props) {
  const t = useT();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape cierra el diálogo, como en Windows de verdad.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-72 overflow-hidden rounded-t-[6px] border border-luna-frame bg-white text-black shadow-2xl"
      >
        <div className="xp-titlebar flex h-7 items-center px-2 text-sm font-bold text-white [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
          {title}
        </div>
        <div className="p-4 text-sm">{message}</div>
        <div className="flex justify-end px-4 pb-3">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="min-w-[72px] rounded-sm border border-slate-400 bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-luna-selection"
          >
            {t("wmp.ok")}
          </button>
        </div>
      </div>
    </div>
  );
}
