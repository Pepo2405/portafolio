import { useT } from "src/i18n";
import type { AudioPlayer } from "../useAudioPlayer";

interface Props {
  player: AudioPlayer;
}

export default function Library({ player }: Props) {
  const t = useT();
  return (
    <div className="h-full overflow-y-auto p-3 text-white">
      <div className="mb-2 border-b border-white/15 pb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">
        {t("wmp.library")}
      </div>
      <ul className="text-sm">
        {player.tracks.map((tr, i) => {
          const active = i === player.currentIndex;
          return (
            <li key={`${tr.url}-${i}`}>
              <button
                type="button"
                onClick={() => player.playIndex(i)}
                className={`flex w-full items-center justify-between gap-3 rounded px-2 py-1.5 text-left hover:bg-white/10 ${
                  active ? "bg-white/15 font-semibold" : ""
                }`}
              >
                <span className="truncate">{tr.title}</span>
                <span className="shrink-0 text-xs text-white/60">{tr.artist ?? ""}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
