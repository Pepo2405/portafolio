import { useEffect, useRef } from "react";
import { VIZ_LIST, paintThumb } from "../viz/engine";
import type { VizId } from "../viz/engine";

interface Props {
  viz: VizId;
  onVizChange: (v: VizId) => void;
}

function VizThumb({ id }: { id: VizId }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;
    paintThumb(g, id);
  }, [id]);
  return (
    <canvas
      ref={ref}
      width={34}
      height={34}
      aria-hidden="true"
      className="block h-[34px] w-[34px] shrink-0 rounded-[3px] border border-black/40"
    />
  );
}

export default function Visualizations({ viz, onVizChange }: Props) {
  return (
    <div className="h-full overflow-y-auto p-4 text-white">
      <div className="mb-3 border-b border-white/15 pb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">
        Visualizaciones
      </div>
      <div className="flex flex-col gap-2" role="listbox" aria-label="Elegir visualizador">
        {VIZ_LIST.map((v) => {
          const active = viz === v.id;
          return (
            <button
              key={v.id}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onVizChange(v.id)}
              className={`flex items-center gap-3 rounded border p-2 text-left transition-colors ${
                active
                  ? "border-sky-400/70 bg-sky-400/15"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <VizThumb id={v.id} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{v.name}</span>
                <span className="block truncate text-xs text-white/60">
                  {v.hint} · {v.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
