import type { Accent } from "../Visualizer";
import { ACCENT_COLORS } from "../Visualizer";

interface Props {
  accent: Accent;
  onAccentChange: (a: Accent) => void;
}

const OPTIONS: { value: Accent; label: string }[] = [
  { value: "blue", label: "Azul clásico" },
  { value: "red", label: "Rojo" },
  { value: "green", label: "Verde" },
];

export default function Visualizations({ accent, onAccentChange }: Props) {
  return (
    <div className="h-full overflow-y-auto p-4 text-white">
      <div className="mb-3 border-b border-white/15 pb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">
        Visualizaciones
      </div>
      <p className="mb-3 text-sm text-white/70">Color de acento del visualizador:</p>
      <div className="flex flex-col gap-2">
        {OPTIONS.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="wmp-accent"
              checked={accent === opt.value}
              onChange={() => onAccentChange(opt.value)}
            />
            <span
              className="inline-block h-4 w-4 rounded-sm"
              style={{ background: ACCENT_COLORS[opt.value] }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
