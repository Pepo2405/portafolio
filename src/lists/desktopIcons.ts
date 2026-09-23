// Registro de íconos del escritorio. `id` es la clave de layout/persistencia.
// Para ventanas, `title` debe coincidir con la clave de WINDOW_META (src/lists/windows.ts).
import { WINDOW_META } from "src/lists/windows";

export interface Cell {
  col: number;
  row: number;
}

export type DesktopIconKind =
  | { type: "open-window"; title: string }
  | { type: "open-url"; href: string }
  | { type: "easter-egg" };

export interface DesktopIconDef {
  id: string;
  icon: string; // url para background-image
  label: Bi;
  kind: DesktopIconKind;
  defaultCell: Cell;
}

// Tamaño de la celda de la grilla invisible (px). El DesktopIcon mide w-24 (96px);
// CELL_W > 96 deja aire entre columnas.
export const CELL_W = 104;
export const CELL_H = 100;

export const DESKTOP_ICONS: DesktopIconDef[] = [
  {
    id: "cv",
    icon: "/static/icons/cv.svg",
    label: WINDOW_META["Curriculum"].label,
    kind: { type: "open-window", title: "Curriculum" },
    defaultCell: { col: 0, row: 0 },
  },
  {
    id: "Sobre mí",
    icon: "/kirby.webp",
    label: WINDOW_META["Sobre mí"].label,
    kind: { type: "open-window", title: "Sobre mí" },
    defaultCell: { col: 0, row: 1 },
  },
  {
    id: "Proyectos",
    icon: "/static/folderIcon.png",
    label: WINDOW_META["Proyectos"].label,
    kind: { type: "open-window", title: "Proyectos" },
    defaultCell: { col: 0, row: 2 },
  },
  {
    id: "Tecnologías",
    icon: "/static/folderIcon.png",
    label: WINDOW_META["Tecnologías"].label,
    kind: { type: "open-window", title: "Tecnologías" },
    defaultCell: { col: 0, row: 3 },
  },
  {
    id: "Sociales",
    icon: "/static/icons/redes.webp",
    label: WINDOW_META["Sociales"].label,
    kind: { type: "open-window", title: "Sociales" },
    defaultCell: { col: 0, row: 4 },
  },
  {
    id: "Terminal",
    icon: "/static/icons/terminal.svg",
    label: WINDOW_META["Terminal"].label,
    kind: { type: "open-window", title: "Terminal" },
    defaultCell: { col: 0, row: 5 },
  },
  {
    id: "Reproductor",
    icon: "/static/icons/wmp.svg",
    label: WINDOW_META["Reproductor"].label,
    kind: { type: "open-window", title: "Reproductor" },
    defaultCell: { col: 0, row: 6 },
  },
  {
    id: "amongus",
    icon: "/static/icons/amogus.webp",
    label: { es: "", en: "" },
    kind: { type: "easter-egg" },
    defaultCell: { col: 0, row: 7 },
  },
];
