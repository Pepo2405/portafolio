import { TbPlayerPause, TbPlayerPlay, TbPlayerSkipBack, TbPlayerSkipForward, TbPlayerStop, TbVolume } from "react-icons/tb";
import { AudioPlayer } from "./useAudioPlayer";

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  player: AudioPlayer;
}

export default function Controls({ player }: Props) {
  const { playing, position, duration, volume } = player;
  const pct = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <div className="wmp-body shrink-0 px-4 pb-3 pt-2">
      {/* seek bar */}
      <div className="mb-2 flex items-center gap-2 text-[11px] text-white/80">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={position}
          onChange={(e) => player.seek(Number(e.target.value))}
          className="h-1 flex-1 accent-sky-400"
          aria-label="Progreso"
          style={{ background: `linear-gradient(90deg, #4a7fd0 ${pct}%, #223 ${pct}%)` }}
        />
        <span className="tabular-nums">
          {fmt(position)} / {fmt(duration)}
        </span>
      </div>

      {/* blue pod */}
      <div className="wmp-pod mx-auto flex max-w-md items-center justify-center gap-3 px-4 py-2">
        <button type="button" aria-label="Anterior" onClick={player.prev} className="wmp-btn">
          <TbPlayerSkipBack className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pausar" : "Reproducir"}
          onClick={player.togglePlay}
          className="wmp-btn"
        >
          {playing ? <TbPlayerPause className="h-7 w-7" /> : <TbPlayerPlay className="h-7 w-7" />}
        </button>
        <button type="button" aria-label="Siguiente" onClick={player.next} className="wmp-btn">
          <TbPlayerSkipForward className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Detener" onClick={player.stop} className="wmp-btn">
          <TbPlayerStop className="h-5 w-5" />
        </button>
        <div className="ml-2 flex items-center gap-1">
          <TbVolume className="wmp-btn h-4 w-4" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => player.setVolume(Number(e.target.value))}
            className="h-1 w-20 accent-sky-200"
            aria-label="Volumen"
          />
        </div>
      </div>
    </div>
  );
}
