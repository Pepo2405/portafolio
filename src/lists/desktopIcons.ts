// Registro de íconos del escritorio. `id` es la clave de layout/persistencia.
// Para ventanas, `title` debe coincidir con la clave de WINDOW_META (src/lists/windows.ts).
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
  label: string;
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
    icon: "/static/icons/chrome.svg",
    label: "Curriculum",
    kind: { type: "open-url", href: "/static/Cv Ignacio Iglesias.pdf" },
    defaultCell: { col: 0, row: 0 },
  },
  {
    id: "Proyectos",
    icon: "/static/folderIcon.png",
    label: "Proyectos",
    kind: { type: "open-window", title: "Proyectos" },
    defaultCell: { col: 0, row: 1 },
  },
  {
    id: "Sociales",
    icon: "/static/icons/redes.webp",
    label: "Redes sociales",
    kind: { type: "open-window", title: "Sociales" },
    defaultCell: { col: 0, row: 2 },
  },
  {
    id: "Tecnologías",
    icon: "/static/folderIcon.png",
    label: "Tecnologías",
    kind: { type: "open-window", title: "Tecnologías" },
    defaultCell: { col: 0, row: 3 },
  },
  {
    id: "Reproductor",
    icon: "/static/icons/wmp.svg",
    label: "Reproductor multimedia",
    kind: { type: "open-window", title: "Reproductor" },
    defaultCell: { col: 0, row: 4 },
  },
  {
    id: "amongus",
    icon: "/static/icons/amogus.webp",
    label: "",
    kind: { type: "easter-egg" },
    defaultCell: { col: 0, row: 5 },
  },
];
