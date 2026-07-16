import Visualizer, { Accent } from "../Visualizer";
import { AudioPlayer } from "../useAudioPlayer";

interface Props {
  player: AudioPlayer;
  accent: Accent;
}

export default function NowPlaying({ player, accent }: Props) {
  const { track } = player;
  return (
    <div className="relative h-full w-full">
      <Visualizer accent={accent} />
      <div className="pointer-events-none absolute left-4 top-3 text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">
        <div className="text-xs text-white/70">{track.artist ?? ""}</div>
        <div className="text-lg font-semibold">{track.title}</div>
      </div>
    </div>
  );
}
