export type WindowMeta = { icon: string; label: string };

// Ventanas reales del escritorio. La clave = title EXACTO que despachan
// Folder/Socials/Techs y que renderiza WindowsContainer. Íconos bare para <img src>.
export const WINDOW_META: Record<string, WindowMeta> = {
  Proyectos: { icon: "/static/folderIcon.png", label: "Proyectos" },
  Sociales: { icon: "/static/icons/redes.webp", label: "Redes sociales" },
  Tecnologías: { icon: "/static/folderIcon.png", label: "Tecnologías" },
};
