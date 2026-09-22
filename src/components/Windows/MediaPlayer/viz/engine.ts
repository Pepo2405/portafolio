// Visualizadores retro del reproductor, porteados desde el diseño de Open Design
// ("Reproductor XP · Visualizadores retro"). Cada drawer pinta un frame en el
// canvas con datos reales del analyser cuando hay audio, o animación idle si no.

export type VizId = "winamp" | "crt" | "vhs" | "stars" | "plasma" | "lcd";

export interface VizMeta {
  id: VizId;
  name: string;
  hint: string;
  desc: string;
}

export const VIZ_LIST: VizMeta[] = [
  { id: "winamp", name: "Barras Winamp", hint: "Espectro · FFT", desc: "Espectro clásico con picos" },
  { id: "crt", name: "Osciloscopio CRT", hint: "Onda · fósforo", desc: "Onda verde sobre cuadrícula" },
  { id: "vhs", name: "Tira VHS", hint: "Tracking · RGB", desc: "Barras con deriva de cinta" },
  { id: "stars", name: "Estrellas XP", hint: "Warp · bombo", desc: "Salvapantallas a warp" },
  { id: "plasma", name: "Plasma demoscene", hint: "Seno · ritmo", desc: "Interferencia en color" },
  { id: "lcd", name: "LCD segmentado", hint: "EQ · bloques", desc: "Estilo Discman/Walkman" },
];

export function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ":" + (s < 10 ? "0" : "") + s;
}

export interface Levels {
  bass: number;
  mid: number;
  high: number;
}

/** Niveles reales desde el espectro (misma ponderación que el diseño original). */
export function realLevels(freq: Uint8Array): Levels {
  const n = freq.length;
  const b1 = Math.floor(n * 0.04);
  const b2 = Math.floor(n * 0.12);
  const b3 = Math.floor(n * 0.45);
  let bass = 0;
  let mid = 0;
  let high = 0;
  for (let i = 2; i < b1; i++) bass += freq[i];
  for (let i = b1; i < b2; i++) mid += freq[i];
  for (let i = b2; i < b3; i++) high += freq[i];
  return {
    bass: bass / Math.max(1, (b1 - 2) * 255),
    mid: mid / Math.max(1, (b2 - b1) * 255),
    high: high / Math.max(1, (b3 - b2) * 255),
  };
}

/** Respiración idle cuando no hay audio (respeta reduced-motion con estática). */
export function synthLevels(reduced: boolean, t: number): Levels {
  if (reduced) return { bass: 0.13, mid: 0.11, high: 0.09 };
  return {
    bass: 0.12 + 0.06 * Math.sin(t * 1.7),
    mid: 0.1 + 0.05 * Math.sin(t * 2.3 + 1),
    high: 0.08 + 0.04 * Math.sin(t * 3.1 + 2),
  };
}

/** Rellena los buffers con onda/espectro sintéticos para animar el idle. */
export function fillSynth(
  freq: Uint8Array,
  time: Uint8Array,
  reduced: boolean,
  t: number
): void {
  if (reduced) {
    for (let k = 0; k < time.length; k++) time[k] = 128;
    for (let f = 0; f < freq.length; f++) {
      freq[f] = Math.max(0, Math.round(40 * Math.exp(-f / 40)));
    }
    return;
  }
  for (let k = 0; k < time.length; k++) {
    time[k] = 128 + Math.round(Math.sin(k * 0.05 + t) * 18);
  }
  for (let f = 0; f < freq.length; f++) {
    freq[f] = Math.max(
      0,
      Math.round(40 * Math.exp(-f / 40) + 10 * Math.sin(f * 0.2 + t))
    );
  }
}

/** Agrupa el espectro en `count` barras con escala logarítmica. */
export function spectrum(freq: Uint8Array, count: number): Float32Array {
  const out = new Float32Array(count);
  if (freq.length === 0) return out;
  const n = freq.length;
  const usable = Math.floor(n * 0.55);
  for (let i = 0; i < count; i++) {
    const i0 = Math.floor(Math.pow(i / count, 1.35) * usable);
    const i1 = Math.max(
      i0 + 1,
      Math.floor(Math.pow((i + 1) / count, 1.35) * usable)
    );
    let sum = 0;
    for (let j = i0; j < i1 && j < n; j++) sum += freq[j];
    out[i] = sum / (Math.max(1, i1 - i0) * 255);
  }
  return out;
}

/** Estado con memoria entre frames (picos, warp, holds del LCD). */
export interface VizState {
  peaks: Float32Array;
  lcdHold: Float32Array;
  starZ: Float32Array;
}

export function createVizState(): VizState {
  const starZ = new Float32Array(220);
  for (let i = 0; i < starZ.length; i++) starZ[i] = Math.random();
  return {
    peaks: new Float32Array(64),
    lcdHold: new Float32Array(14),
    starZ,
  };
}

export interface Frame {
  g: CanvasRenderingContext2D;
  W: number;
  H: number;
  lv: Levels;
  freq: Uint8Array;
  time: Uint8Array;
  t: number;
  reduced: boolean;
  volumePct: number;
  posText: string;
  durText: string;
  state: VizState;
}

function drawWinamp(f: Frame): void {
  const { g, W, H, lv, state } = f;
  g.fillStyle = "#0b0e14";
  g.fillRect(0, 0, W, H);

  const cols = Math.min(56, Math.max(24, Math.floor(W / 18)));
  const gap = 3;
  const barW = (W - 24 - gap * (cols - 1)) / cols;
  const baseY = H - 28;
  const maxH = H - 64;
  const bars = spectrum(f.freq, cols);

  for (let i = 0; i < cols; i++) {
    const v = bars[i];
    if (v > state.peaks[i]) state.peaks[i] = v;
    else state.peaks[i] = Math.max(0, state.peaks[i] - 0.012);
    const x = 12 + i * (barW + gap);
    const h = Math.max(3, v * maxH);
    const segH = 6;
    const segGap = 2;
    const full = Math.floor(h / (segH + segGap));
    for (let s = 0; s < 18; s++) {
      if (s > full) break;
      const y = baseY - s * (segH + segGap) - segH;
      const ratio = s / 17;
      if (ratio > 0.78) g.fillStyle = "#ff3a2a";
      else if (ratio > 0.5) g.fillStyle = "#ffe12a";
      else g.fillStyle = "#3dff6a";
      g.fillRect(x, y, barW, segH);
    }
    const py = baseY - Math.floor(state.peaks[i] * maxH) - segH - 2;
    if (state.peaks[i] > 0.04) {
      g.fillStyle = "#e8ff9a";
      g.fillRect(x, Math.max(16, py), barW, 3);
    }
  }

  g.fillStyle = "rgba(255,255,255,0.06)";
  g.fillRect(0, baseY + 4, W, 1);
  g.font = "11px 'Lucida Console', monospace";
  g.fillStyle = "rgba(120,255,160,0.55)";
  g.fillText(
    "K " +
      Math.round(lv.bass * 99) +
      "  M " +
      Math.round(lv.mid * 99) +
      "  T " +
      Math.round(lv.high * 99),
    14,
    H - 10
  );
}

function drawCRT(f: Frame): void {
  const { g, W, H, lv, time, t, reduced } = f;
  g.fillStyle = "#041204";
  g.fillRect(0, 0, W, H);

  g.strokeStyle = "rgba(40,120,50,0.35)";
  g.lineWidth = 1;
  const grid = 28;
  for (let x = 0; x <= W; x += grid) {
    g.beginPath();
    g.moveTo(x + 0.5, 0);
    g.lineTo(x + 0.5, H);
    g.stroke();
  }
  for (let y = 0; y <= H; y += grid) {
    g.beginPath();
    g.moveTo(0, y + 0.5);
    g.lineTo(W, y + 0.5);
    g.stroke();
  }

  const midY = H / 2;
  const amp = H * 0.32 * (0.35 + lv.mid * 0.9);
  g.save();
  g.shadowColor = "#3cff6a";
  g.shadowBlur = 12;
  g.strokeStyle = "#7dff9a";
  g.lineWidth = 2;
  g.beginPath();
  const n = time.length;
  const stepPx = Math.max(1, Math.floor(n / Math.max(1, W)));
  for (let i = 0; i < n; i += stepPx) {
    const px = (i / Math.max(1, n - 1)) * W;
    const v = (time[i] - 128) / 128;
    const py = midY + v * amp;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.stroke();
  g.restore();

  if (!reduced) {
    const scanY = ((t * 40) % (H + 40)) - 20;
    const grad = g.createLinearGradient(0, scanY - 18, 0, scanY + 18);
    grad.addColorStop(0, "rgba(80,255,120,0)");
    grad.addColorStop(0.5, "rgba(80,255,120,0.07)");
    grad.addColorStop(1, "rgba(80,255,120,0)");
    g.fillStyle = grad;
    g.fillRect(0, scanY - 18, W, 36);
  }

  g.fillStyle = "rgba(0,0,0,0.18)";
  for (let sy = 0; sy < H; sy += 3) g.fillRect(0, sy, W, 1);

  g.font = "11px 'Lucida Console', monospace";
  g.fillStyle = "rgba(120,255,150,0.7)";
  g.fillText("CH3  1ms/div  x" + (1 + Math.round(lv.bass * 3)), 14, H - 12);
}

function drawVHS(f: Frame): void {
  const { g, W, H, lv, t, reduced } = f;
  g.fillStyle = "#120814";
  g.fillRect(0, 0, W, H);

  const bands = 10;
  const bh = H / bands;
  for (let i = 0; i < bands; i++) {
    const wave = Math.sin(t * 2 + i * 0.7 + lv.bass * 4) * (6 + lv.mid * 18);
    const hue = 210 + i * 12 + lv.high * 40;
    const y = i * bh + wave * 0.15;
    g.fillStyle =
      "hsla(" + hue + ", 70%, " + (35 + (i % 3) * 8) + "%, 0.55)";
    g.fillRect(0, y, W, bh * 0.72);

    g.globalCompositeOperation = "screen";
    g.fillStyle = "rgba(255,40,40,0.25)";
    g.fillRect(wave, y + 2, W, bh * 0.35);
    g.fillStyle = "rgba(40,80,255,0.25)";
    g.fillRect(-wave, y + 4, W, bh * 0.35);
    g.globalCompositeOperation = "source-over";
  }

  const trk = 18 + lv.bass * 10;
  g.fillStyle = "rgba(255,255,255,0.75)";
  for (let s = 0; s < 30; s++) {
    const sx = (s * 37 + t * 80) % W;
    g.fillRect(sx, H - trk, 14, 2);
  }
  g.fillStyle = "rgba(255,255,255,0.15)";
  g.fillRect(0, H - trk - 4, W, trk + 4);

  if (!reduced) {
    const ty = ((t * 55) % (H + 30)) - 15;
    g.fillStyle = "rgba(255,255,255,0.12)";
    g.fillRect(0, ty, W, 6);
  }

  g.fillStyle = "rgba(0,0,0,0.45)";
  g.fillRect(0, 0, 96, 26);
  g.font = "700 13px 'Lucida Console', monospace";
  g.fillStyle = "#ff5a5a";
  g.fillText("REC", 14, 18);
  if (Math.floor(t * 2) % 2 === 0) {
    g.beginPath();
    g.arc(78, 13, 5, 0, Math.PI * 2);
    g.fill();
  }

  g.font = "11px 'Lucida Console', monospace";
  g.fillStyle = "rgba(255,255,255,0.65)";
  const sec = Math.floor(t) % 60;
  g.fillText("SP  00:" + (sec < 10 ? "0" : "") + sec, W - 90, 18);
}

function drawStars(f: Frame): void {
  const { g, W, H, lv, t, reduced, state } = f;
  void t;
  g.fillStyle = "#02040a";
  g.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;
  const speed = reduced ? 0 : 0.004 + lv.bass * 0.03;
  const starZ = state.starZ;

  for (let i = 0; i < starZ.length; i++) {
    starZ[i] -= speed;
    if (starZ[i] <= 0.01) {
      starZ[i] = 0.99 + Math.random() * 0.01;
    }
    const z = starZ[i];
    const seedX = ((i * 9301 + 49297) % 233280) / 233280;
    const seedY = ((i * 4931 + 7919) % 233280) / 233280;
    const x = cx + (seedX - 0.5) * W * (1.6 / z);
    const y = cy + (seedY - 0.5) * H * (1.6 / z);
    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
    const size = Math.max(0.5, (1 - z) * 3.2);
    const bright = Math.min(1, (1 - z) * 1.4);
    const prevZ = z + speed * 4;
    const px = cx + (seedX - 0.5) * W * (1.6 / prevZ);
    const py = cy + (seedY - 0.5) * H * (1.6 / prevZ);

    g.strokeStyle = "rgba(255,255,255," + (0.25 + bright * 0.75) + ")";
    g.lineWidth = size;
    g.beginPath();
    g.moveTo(px, py);
    g.lineTo(x, y);
    g.stroke();

    if (lv.bass > 0.55 && i % 7 === 0) {
      g.fillStyle = "rgba(126,182,255," + bright + ")";
      g.fillRect(x - size, y - size, size * 2, size * 2);
    }
  }

  const grad = g.createRadialGradient(cx, cy, 0, cx, cy, 80 + lv.bass * 40);
  grad.addColorStop(0, "rgba(60,120,255,0.25)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
}

function drawPlasma(f: Frame): void {
  const { g, W, H, lv, t, reduced } = f;
  // Bloque más grande en ventanas grandes para no saturar el frame.
  const block = W * H > 500000 ? 7 : 5;
  const w = Math.ceil(W / block);
  const h = Math.ceil(H / block);
  const phase = reduced ? 0.9 : t * (1.2 + lv.mid * 2.5);
  const hueBase = reduced ? 210 : (t * 18 + lv.bass * 80) % 360;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v =
        Math.sin(x * 0.22 + phase) +
        Math.sin(y * 0.18 - phase * 0.7) +
        Math.sin((x + y) * 0.12 + phase * 0.5) +
        Math.sin(Math.sqrt(x * x + y * y) * 0.15 - phase);
      const nrm = (v + 4) / 8;
      const hue = (hueBase + nrm * 120 + lv.high * 40) % 360;
      const lig = 22 + nrm * 38 + lv.bass * 12;
      g.fillStyle = "hsl(" + hue + ",85%," + lig + "%)";
      g.fillRect(x * block, y * block, block, block);
    }
  }

  g.fillStyle = "rgba(0,0,0,0.35)";
  g.fillRect(0, H - 28, W, 28);
  g.font = "11px 'Lucida Console', monospace";
  g.fillStyle = "#ffe12a";
  g.fillText("ELECTRA_V2  PHASE " + phase.toFixed(2), 14, H - 10);
}

function drawLCD(f: Frame): void {
  const { g, W, H, lv, volumePct, posText, durText, state } = f;
  g.fillStyle = "#9aab3c";
  g.fillRect(0, 0, W, H);

  g.fillStyle = "rgba(40,55,10,0.08)";
  for (let gy = 0; gy < H; gy += 4) g.fillRect(0, gy, W, 1);

  const cols = 14;
  const pad = 24;
  const gap = 8;
  const colW = (W - pad * 2 - gap * (cols - 1)) / cols;
  const segs = 12;
  const segH = Math.min(14, (H - 120) / segs);
  const left = pad;
  const top = 56;

  const bars = spectrum(f.freq, cols);
  for (let i = 0; i < cols; i++) {
    const target = Math.max(1, Math.round(bars[i] * segs));
    if (bars[i] * segs > state.lcdHold[i]) state.lcdHold[i] = bars[i] * segs;
    else state.lcdHold[i] = Math.max(target, state.lcdHold[i] - 0.15);
    const lit = Math.round(state.lcdHold[i]);
    for (let s = 0; s < segs; s++) {
      const on = s < lit;
      const x = left + i * (colW + gap);
      const y = top + (segs - 1 - s) * (segH + 4);
      if (on) {
        g.fillStyle = "#1a2208";
        g.fillRect(x, y, colW, segH);
        g.fillStyle = "rgba(255,255,255,0.08)";
        g.fillRect(x + 1, y + 1, colW - 2, 2);
      } else {
        g.fillStyle = "rgba(30,40,8,0.14)";
        g.fillRect(x, y, colW, segH);
      }
    }
  }

  g.strokeStyle = "rgba(30,40,8,0.55)";
  g.lineWidth = 3;
  g.strokeRect(10, 10, W - 20, H - 20);

  g.font = "700 14px 'Lucida Console', monospace";
  g.fillStyle = "#1a2208";
  g.fillText("EQ 14-BAND", pad, 36);
  g.font = "12px 'Lucida Console', monospace";
  const mode = lv.bass > 0.5 ? "ROCK" : lv.mid > 0.4 ? "JAZZ" : "FLAT";
  g.fillText(mode + "   VOL " + volumePct, pad, H - 28);

  g.font = "12px 'Lucida Console', monospace";
  const stamp = posText + " / " + durText;
  g.fillText(stamp, W - pad - g.measureText(stamp).width, 36);
}

const DRAWERS: Record<VizId, (f: Frame) => void> = {
  winamp: drawWinamp,
  crt: drawCRT,
  vhs: drawVHS,
  stars: drawStars,
  plasma: drawPlasma,
  lcd: drawLCD,
};

export function drawViz(frame: Frame, id: VizId): void {
  DRAWERS[id](frame);
}

/** Miniatura estática de 34x34 para el selector (no depende del audio). */
export function paintThumb(g: CanvasRenderingContext2D, id: VizId): void {
  const w = 34;
  const h = 34;
  g.clearRect(0, 0, w, h);
  g.fillStyle = "#0b0e14";
  g.fillRect(0, 0, w, h);
  if (id === "winamp") {
    const cols = ["#39ff6a", "#e8ff3a", "#ff5a2a"];
    for (let b = 0; b < 7; b++) {
      const bh = 6 + ((b * 7) % 20);
      g.fillStyle = cols[b % 3];
      g.fillRect(3 + b * 4, h - 3 - bh, 3, bh);
    }
  } else if (id === "crt") {
    g.strokeStyle = "#1a3a1a";
    g.lineWidth = 1;
    for (let x = 0; x <= w; x += 8) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let y = 0; y <= h; y += 8) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    g.strokeStyle = "#3cff6a";
    g.lineWidth = 1.5;
    g.beginPath();
    for (let px = 0; px <= w; px++) {
      const py = h / 2 + Math.sin(px * 0.35) * 8;
      if (px === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.stroke();
  } else if (id === "vhs") {
    for (let r = 0; r < 8; r++) {
      g.fillStyle = r % 2 ? "rgba(80,120,255,0.35)" : "rgba(255,60,60,0.3)";
      g.fillRect(0, r * 4, w, 2);
    }
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.fillRect(2, 14, w - 4, 2);
  } else if (id === "stars") {
    g.fillStyle = "#fff";
    for (let s = 0; s < 14; s++) {
      const sx = (s * 13) % w;
      const sy = (s * 17) % h;
      g.fillRect(sx, sy, s % 3 === 0 ? 2 : 1, 1);
    }
    g.fillStyle = "#7eb6ff";
    g.fillRect(15, 15, 4, 4);
  } else if (id === "plasma") {
    for (let py = 0; py < h; py += 2) {
      for (let px = 0; px < w; px += 2) {
        const v = Math.sin(px * 0.3) + Math.cos(py * 0.25);
        g.fillStyle =
          "hsl(" + (200 + v * 60) + ",80%," + (40 + v * 15) + "%)";
        g.fillRect(px, py, 2, 2);
      }
    }
  } else {
    for (let bi = 0; bi < 7; bi++) {
      const segs = 2 + (bi % 5);
      for (let si = 0; si < 6; si++) {
        g.fillStyle = si < segs ? "#9dff3a" : "#1c2a12";
        g.fillRect(3 + bi * 4, 28 - si * 4, 3, 3);
      }
    }
  }
}
