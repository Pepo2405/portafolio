import { Howler } from "howler";
import { useEffect, useRef } from "react";

export type Accent = "blue" | "red" | "green";

export const ACCENT_COLORS: Record<Accent, string> = {
  blue: "#4a9bff",
  red: "#ff5a5a",
  green: "#4ade80",
};

interface Props {
  accent: Accent;
}

export default function Visualizer({ accent }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const accentRef = useRef(accent);
  accentRef.current = accent;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    // Size the canvas to its container.
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = () => {
      // Lazily create the analyser once the Web Audio context exists.
      if (!analyserRef.current) {
        const audioCtx = Howler.ctx as AudioContext | undefined;
        const master = (Howler as unknown as { masterGain?: GainNode }).masterGain;
        if (audioCtx && master) {
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          master.connect(analyser); // tap only; master stays connected to destination
          analyserRef.current = analyser;
          masterRef.current = master;
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx2d.clearRect(0, 0, w, h);
      ctx2d.fillStyle = "rgba(0,0,0,0.25)";
      ctx2d.fillRect(0, 0, w, h);

      const color = ACCENT_COLORS[accentRef.current];
      const analyser = analyserRef.current;

      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const cx = w / 2;
        const cy = h / 2;
        const bins = data.length;

        // Radial starburst.
        ctx2d.strokeStyle = color;
        ctx2d.lineWidth = 2;
        for (let i = 0; i < bins; i++) {
          const amp = data[i] / 255;
          const angle = (i / bins) * Math.PI * 2;
          const r0 = 20;
          const r1 = r0 + amp * Math.min(w, h) * 0.42;
          ctx2d.globalAlpha = 0.35 + amp * 0.65;
          ctx2d.beginPath();
          ctx2d.moveTo(cx + Math.cos(angle) * r0, cy + Math.sin(angle) * r0);
          ctx2d.lineTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
          ctx2d.stroke();
        }
        ctx2d.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (analyserRef.current) {
        masterRef.current?.disconnect(analyserRef.current);
        analyserRef.current.disconnect();
        analyserRef.current = null;
        masterRef.current = null;
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}
