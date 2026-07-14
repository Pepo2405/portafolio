export type WindowMeta = { icon: string };

// Ventanas reales del escritorio. La clave = title EXACTO que despachan
// Folder/Socials/Techs y que renderiza WindowsContainer. Íconos bare para <img src>.
export const WINDOW_META: Record<string, WindowMeta> = {
  Proyectos: { icon: "/static/folderIcon.png" },
  Sociales: { icon: "/static/icons/redes.webp" },
  Tecnologías: { icon: "/static/folderIcon.png" },
};
