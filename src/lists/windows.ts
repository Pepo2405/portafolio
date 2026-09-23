import proyectsData from "src/lists/proyects.json";

export type WindowMeta = {
  icon: string;
  label: Bi;
  /** Tamaño inicial de la ventana. Si falta, DraggableWin usa su default (600x430). */
  size?: { width: number; height: number };
};

// Ventanas reales del escritorio. La clave = title EXACTO que despachan
// Folder/Socials/Techs y que renderiza WindowsContainer. Íconos bare para <img src>.
// Los tamaños van por contenido: Tecnologías tiene 38 ítems, Sociales solo 3.
export const WINDOW_META: Record<string, WindowMeta> = {
  "Sobre mí": { icon: "/kirby.webp", label: { es: "Sobre mí", en: "About me" }, size: { width: 580, height: 640 } },
  Curriculum: { icon: "/static/icons/cv.svg", label: { es: "Curriculum", en: "Resume" }, size: { width: 470, height: 330 } },
  Proyectos: { icon: "/static/folderIcon.png", label: { es: "Proyectos", en: "Projects" }, size: { width: 820, height: 560 } },
  Sociales: { icon: "/static/icons/redes.webp", label: { es: "Redes sociales", en: "Social links" }, size: { width: 420, height: 250 } },
  "Tecnologías": { icon: "/static/folderIcon.png", label: { es: "Tecnologías", en: "Technologies" }, size: { width: 720, height: 500 } },
  Terminal: { icon: "/static/icons/terminal.svg", label: { es: "Terminal", en: "Terminal" }, size: { width: 620, height: 400 } },
  Reproductor: { icon: "/static/icons/wmp.svg", label: { es: "Reproductor multimedia", en: "Media Player" } },
};

// Las fichas de proyecto son ventanas dinámicas: no están en WINDOW_META pero
// igual necesitan ícono y label para la taskbar y la barra de título.
const PROJECT_META: Record<string, WindowMeta> = Object.fromEntries(
  (proyectsData.proyects as Project[]).map((p) => [
    p.title,
    { icon: p.icon, label: { es: p.title, en: p.titleEn ?? p.title } },
  ])
);

export function windowMeta(title: string): WindowMeta | undefined {
  return WINDOW_META[title] ?? PROJECT_META[title];
}

export function windowIcon(title: string): string | undefined {
  return windowMeta(title)?.icon;
}

export function windowLabel(title: string): Bi {
  return windowMeta(title)?.label ?? { es: title, en: title };
}
