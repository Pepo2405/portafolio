import { Howler } from "howler";
import { useEffect, useRef } from "react";
import {
  createVizState,
  drawViz,
  fillSynth,
  fmt,
  realLevels,
  synthLevels,
} from "./viz/engine";
import type { Levels, VizId, VizState } from "./viz/engine";

export type { VizId };
export { VIZ_LIST } from "./viz/engine";

interface Props {
  viz: VizId;
  playing: boolean;
  volume: number;
  position: number;
  duration: number;
}

interface Live {
  viz: VizId;
  playing: boolean;
  volume: number;
  position: number;
  duration: number;
}

export default function Visualizer({
  viz,
  playing,
  volume,
  position,
  duration,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const liveRef = useRef<Live>({ viz, playing, volume, position, duration });
  liveRef.current = { viz, playing, volume, position, duration };
  const stateRef = useRef<VizState | null>(null);
  if (!stateRef.current) stateRef.current = createVizState();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const state = stateRef.current as VizState;
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Backing store con DPR capado para nitidez sin costo extra.
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, parent.clientWidth);
      const h = Math.max(1, parent.clientHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Buffers de idle hasta que exista el contexto de audio.
    let freq: Uint8Array = new Uint8Array(512);
    let time: Uint8Array = new Uint8Array(1024);

    const draw = () => {
      // Tap al master de Howler (solo lectura; sigue conectado a destino).
      if (!analyserRef.current) {
        const audioCtx = Howler.ctx as AudioContext | undefined;
        const master = (Howler as unknown as { masterGain?: GainNode })
          .masterGain;
        if (audioCtx && master) {
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 1024;
          analyser.smoothingTimeConstant = 0.78;
          master.connect(analyser);
          analyserRef.current = analyser;
          masterRef.current = master;
          freq = new Uint8Array(analyser.frequencyBinCount);
          time = new Uint8Array(analyser.fftSize);
        }
      }

      const live = liveRef.current;
      const parent = canvas.parentElement;
      const W = parent ? Math.max(1, parent.clientWidth) : canvas.width;
      const H = parent ? Math.max(1, parent.clientHeight) : canvas.height;
      const t = performance.now() / 1000;

      let lv: Levels;
      const analyser = analyserRef.current;
      if (analyser && live.playing) {
        analyser.getByteFrequencyData(freq);
        analyser.getByteTimeDomainData(time);
        lv = realLevels(freq);
      } else {
        lv = synthLevels(reduced, t);
        fillSynth(freq, time, reduced, t);
      }

      drawViz(
        {
          g: ctx2d,
          W,
          H,
          lv,
          freq,
          time,
          t,
          reduced,
          volumePct: Math.round(live.volume * 100),
          posText: fmt(live.position),
          durText: fmt(live.duration),
          state,
        },
        live.viz
      );

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
