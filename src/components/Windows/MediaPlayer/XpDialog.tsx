interface Props {
  title: string;
  message: string;
  onClose: () => void;
}

export default function XpDialog({ title, message, onClose }: Props) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
      <div className="w-72 overflow-hidden rounded-t-[6px] border border-luna-frame bg-white text-black shadow-2xl">
        <div className="xp-titlebar flex h-7 items-center px-2 text-sm font-bold text-white [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
          {title}
        </div>
        <div className="p-4 text-sm">{message}</div>
        <div className="flex justify-end px-4 pb-3">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="min-w-[72px] rounded-sm border border-slate-400 bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
