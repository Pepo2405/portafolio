import proyectsData from "src/lists/proyects.json";

export const BASE_URL = "https://www.pepo.ar";

/** "Huésped+" -> "huesped-plus". Minúsculas, sin acentos, separado por "-". */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type Route = {
  /** Path con barra final, ej: "/proyectos/gym-admin/". */
  path: string;
  locale: Locale;
  kind: "home" | "project";
  /** Clave de ventana (title del proyecto) cuando kind === "project". */
  projectTitle?: string;
};

const PROJECTS = proyectsData.proyects as Project[];

// Solo los proyectos con `details` tienen landing propia: los demás son
// contenido fino de 2 líneas y quedan indexados en la ventana "Proyectos".
export const PROJECT_ROUTES: Route[] = PROJECTS.filter(
  (p) => p.details && p.details.length > 0
).map((p) => ({
  path: `/proyectos/${slugify(p.title)}/`,
  locale: "es",
  kind: "project",
  projectTitle: p.title,
}));

export const ROUTES: Route[] = [
  { path: "/", locale: "es", kind: "home" },
  ...PROJECT_ROUTES,
  { path: "/en/", locale: "en", kind: "home" },
  ...PROJECT_ROUTES.map(
    (r): Route => ({ ...r, path: `/en${r.path}`, locale: "en" })
  ),
];

/** Estado inicial del escritorio para una URL dada. */
export function parseRoute(pathname: string): {
  locale: Locale;
  initialWindows: string[];
} {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const route = ROUTES.find((r) => r.path === path);
  if (!route) return { locale: "es", initialWindows: ["Sobre mí"] };
  if (route.kind === "project" && route.projectTitle) {
    return {
      locale: route.locale,
      initialWindows: ["Proyectos", route.projectTitle],
    };
  }
  return { locale: route.locale, initialWindows: ["Sobre mí"] };
}

/** Path de la misma página en el otro idioma (para hreflang). */
export function alternatePath(route: Route): string {
  return route.locale === "es" ? `/en${route.path}` : route.path.slice(3) || "/";
}

/** Href del link de idioma: la misma página en el otro idioma (home en inglés si la ruta no existe). */
export function alternateHref(pathname: string): string {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const route = ROUTES.find((r) => r.path === path);
  return route ? alternatePath(route) : "/en/";
}
