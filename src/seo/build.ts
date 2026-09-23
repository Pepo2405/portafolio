import proyectsData from "src/lists/proyects.json";
import profile from "src/lists/profile.json";
import { fmt, pick } from "src/i18n/text";
import { BASE_URL, ROUTES, alternatePath } from "src/routes";
import type { Route } from "src/routes";

const PROJECTS = proyectsData.proyects as Project[];
const OG_IMAGE = `${BASE_URL}/static/og-cover.png`;
const GITHUB = "https://github.com/pepo2405";
const LINKEDIN = "https://www.linkedin.com/in/ignacioniglesias2405/";

export type PageParts = {
  lang: string;
  head: string;
  app: string;
  noscript: string;
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Para insertar JSON dentro de <script>: evita cerrar el tag. */
function jsonForScript(value: object): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function findProject(route: Route): Project | undefined {
  if (!route.projectTitle) return undefined;
  return PROJECTS.find((p) => p.title === route.projectTitle);
}

function displayTitle(project: Project, locale: Locale): string {
  return locale === "en" ? project.titleEn ?? project.title : project.title;
}

export function pageMeta(route: Route): { title: string; description: string } {
  const project = findProject(route);
  if (!project) {
    return {
      title: pick("seo.home.title", route.locale),
      description: pick("seo.home.description", route.locale),
    };
  }
  return {
    title: fmt(pick("seo.project.titleTemplate", route.locale), {
      title: displayTitle(project, route.locale),
    }),
    description: project.description
      ? pick(project.description, route.locale)
      : pick("seo.home.description", route.locale),
  };
}

export function jsonLd(route: Route): Record<string, unknown>[] {
  const locale = route.locale;
  const blocks: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: profile.name,
      url: `${BASE_URL}/`,
      jobTitle: pick("seo.person.role", locale),
      image: OG_IMAGE,
      sameAs: [GITHUB, LINKEDIN],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: pick("seo.siteName", locale),
      url: `${BASE_URL}/`,
      inLanguage: locale,
    },
  ];

  const project = findProject(route);
  if (project) {
    const { title, description } = pageMeta(route);
    blocks.push({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: title.split(" — ")[0],
      description,
      url: `${BASE_URL}${route.path}`,
      inLanguage: locale,
      author: { "@type": "Person", name: profile.name },
      ...(project.url ? { sameAs: project.url } : {}),
    });
  }
  return blocks;
}

export function headHtml(route: Route): string {
  const { title, description } = pageMeta(route);
  const canonical = `${BASE_URL}${route.path}`;
  const alt = alternatePath(route);
  const ogLocale = route.locale === "es" ? "es_AR" : "en_US";
  const jsonLdTags = jsonLd(route)
    .map((o) => `<script type="application/ld+json">${jsonForScript(o)}</script>`)
    .join("\n");

  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(pick("seo.siteName", route.locale))}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:locale" content="${ogLocale}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    `<link rel="alternate" hreflang="${route.locale}" href="${canonical}" />`,
    `<link rel="alternate" hreflang="${route.locale === "es" ? "en" : "es"}" href="${BASE_URL}${alt}" />`,
    `<link rel="alternate" hreflang="x-default" href="${BASE_URL}${route.locale === "es" ? route.path : alt}" />`,
    jsonLdTags,
  ].join("\n");
}

export function noscriptHtml(locale: Locale): string {
  const displayName = (p: Project) => displayTitle(p, locale);
  const items = PROJECTS.map((p) => {
    const desc = p.description ? ` — ${pick(p.description, locale)}` : "";
    const link = p.url ? ` (<a href="${esc(p.url)}">${esc(p.url)}</a>)` : "";
    return `<li><strong>${esc(displayName(p))}</strong>${esc(desc)}${link}</li>`;
  }).join("");

  const links = profile.links
    .map(
      (l) =>
        `<a href="${esc(l.href)}">${esc(pick(l.title, locale))}</a>`
    )
    .join(" · ");

  return [
    "<noscript>",
    `<p>${esc(pick("seo.noscript.intro", locale))}</p>`,
    `<p><strong>${esc(profile.name)}</strong> — ${esc(pick("seo.person.role", locale))} · ${esc(profile.location)}</p>`,
    profile.bio.map((p) => `<p>${esc(pick(p, locale))}</p>`).join(""),
    `<h2>${esc(pick("seo.content.projects", locale))}</h2>`,
    `<ul>${items}</ul>`,
    `<h2>${esc(pick("seo.noscript.contact", locale))}</h2>`,
    `<p>${links}</p>`,
    "</noscript>",
  ].join("\n");
}

export function sitemapXml(): string {
  const urls = ROUTES.map((route) => {
    const alt = alternatePath(route);
    const self = `${BASE_URL}${route.path}`;
    const other = `${BASE_URL}${alt}`;
    const esHref = route.locale === "es" ? self : other;
    const enHref = route.locale === "es" ? other : self;
    return [
      "<url>",
      `<loc>${self}</loc>`,
      `<xhtml:link rel="alternate" hreflang="es" href="${esHref}" />`,
      `<xhtml:link rel="alternate" hreflang="en" href="${enHref}" />`,
      `<xhtml:link rel="alternate" hreflang="x-default" href="${esHref}" />`,
      "</url>",
    ].join("");
  }).join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    "</urlset>",
  ].join("\n");
}

export function inject(template: string, parts: PageParts): string {
  // Replacer como función: si el contenido trae "$&" o similares, String.replace
  // no lo interpreta.
  return template
    .replace("{{SEO_LANG}}", () => parts.lang)
    .replace("<!--SEO_HEAD-->", () => parts.head)
    .replace("<!--SEO_APP-->", () => parts.app)
    .replace("<!--SEO_NOSCRIPT-->", () => parts.noscript);
}

/**
 * Corta el build si el SEO quedó roto: canonical faltante, metas absolutas
 * (og:url/og:image/twitter:image), placeholders sin reemplazar, JSON-LD
 * inválido y los hreflang de cada página (deben existir es, en y x-default;
 * el del propio locale apunta al canonical, el del otro idioma a
 * `BASE_URL + alternatePath(route)` y x-default a la URL en español).
 */
export function validatePages(
  pages: { route: Route; html: string }[]
): string[] {
  const errors: string[] = [];
  for (const { route, html } of pages) {
    const label = route.path;
    if (!html.includes(`<link rel="canonical" href="${BASE_URL}${route.path}" />`)) {
      errors.push(`${label}: falta canonical`);
    }
    for (const attr of ["og:url", "og:image", "twitter:image"]) {
      const m = html.match(new RegExp(`${attr}" content="([^"]*)"`));
      if (!m) {
        errors.push(`${label}: falta ${attr}`);
      } else if (!m[1].startsWith("https://")) {
        errors.push(`${label}: ${attr} no es absoluta (${m[1]})`);
      }
    }
    if (html.includes("SEO_")) errors.push(`${label}: placeholder sin reemplazar`);
    for (const block of html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    )) {
      try {
        JSON.parse(block[1]);
      } catch {
        errors.push(`${label}: JSON-LD inválido`);
      }
    }
    const alt = alternatePath(route);
    const esHref = `${BASE_URL}${route.locale === "es" ? route.path : alt}`;
    const expected: Record<string, string> = {
      es: esHref,
      en: `${BASE_URL}${route.locale === "es" ? alt : route.path}`,
      "x-default": esHref,
    };
    const found = new Map<string, string>();
    for (const m of html.matchAll(
      /<link rel="alternate" hreflang="([^"]+)" href="([^"]*)"\s*\/>/g
    )) {
      found.set(m[1], m[2]);
    }
    for (const [code, href] of Object.entries(expected)) {
      if (!found.has(code)) {
        errors.push(`${label}: falta hreflang ${code}`);
      } else if (found.get(code) !== href) {
        errors.push(`${label}: hreflang ${code} no apunta a ${href}`);
      }
    }
  }
  return errors;
}
