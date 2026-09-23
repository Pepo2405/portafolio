import { describe, expect, test } from "bun:test";
import {
  headHtml,
  inject,
  jsonLd,
  noscriptHtml,
  pageMeta,
  sitemapXml,
  validatePages,
} from "src/seo/build";
import { BASE_URL, ROUTES } from "src/routes";

const home = ROUTES[0];
const ficha = ROUTES.find((r) => r.path === "/proyectos/gym-admin/")!;
const homeEn = ROUTES.find((r) => r.path === "/en/")!;

describe("pageMeta", () => {
  test("home en español", () => {
    expect(pageMeta(home)).toEqual({
      title: "Ignacio Iglesias — Desarrollador Full Stack",
      description:
        "Portafolio de Ignacio Iglesias, desarrollador full stack senior en Buenos Aires. Productos web, mobile y de escritorio con TypeScript, React, Next.js, Rust y Tauri.",
    });
  });

  test("ficha usa el título del proyecto", () => {
    expect(pageMeta(ficha).title).toBe("Gym Admin — Ignacio Iglesias");
  });

  test("en inglés usa titleEn", () => {
    const fichaEn = ROUTES.find((r) => r.path === "/en/proyectos/gym-app-movil/")!;
    expect(pageMeta(fichaEn).title).toBe("Gym Mobile App — Ignacio Iglesias");
  });
});

describe("headHtml", () => {
  test("canonical y og:url absolutos, og:image absoluta", () => {
    const head = headHtml(ficha);
    expect(head).toContain(`<link rel="canonical" href="${BASE_URL}/proyectos/gym-admin/" />`);
    expect(head).toContain(`<meta property="og:url" content="${BASE_URL}/proyectos/gym-admin/" />`);
    expect(head).toContain(`<meta property="og:image" content="${BASE_URL}/static/og-cover.png" />`);
  });

  test("hreflang recíproco y x-default", () => {
    const head = headHtml(ficha);
    expect(head).toContain(`hreflang="es" href="${BASE_URL}/proyectos/gym-admin/"`);
    expect(head).toContain(`hreflang="en" href="${BASE_URL}/en/proyectos/gym-admin/"`);
    expect(head).toContain(`hreflang="x-default" href="${BASE_URL}/proyectos/gym-admin/"`);
    expect(headHtml(homeEn)).toContain(`hreflang="es" href="${BASE_URL}/"`);
  });
});

describe("jsonLd", () => {
  test("Person + WebSite en home; suma CreativeWork en fichas", () => {
    expect(jsonLd(home).map((o) => o["@type"])).toEqual(["Person", "WebSite"]);
    expect(jsonLd(ficha).map((o) => o["@type"])).toEqual([
      "Person",
      "WebSite",
      "CreativeWork",
    ]);
  });

  test("Person apunta a GitHub y LinkedIn", () => {
    const person = jsonLd(home).find((o) => o["@type"] === "Person") as {
      sameAs: string[];
    };
    expect(person.sameAs).toEqual([
      "https://github.com/pepo2405",
      "https://www.linkedin.com/in/ignacioniglesias2405/",
    ]);
  });
});

describe("noscriptHtml", () => {
  test("incluye bio y proyectos sin JS", () => {
    const html = noscriptHtml("es");
    expect(html).toContain("<noscript>");
    expect(html).toContain("Ingeniero full-stack senior");
    expect(html).toContain("Gym Admin");
    expect(html).toContain("github.com/pepo2405");
  });

  test("traduce el rol al español", () => {
    expect(noscriptHtml("es")).toContain("Desarrollador Full Stack");
  });

  test("escapa los hrefs y texto de URLs", () => {
    const html = noscriptHtml("es");
    expect(html).toContain("&amp;fs=1");
    expect(html).not.toContain("view=cm&fs");
  });
});

describe("sitemapXml", () => {
  test("20 URLs con alternates es/en", () => {
    const xml = sitemapXml();
    expect((xml.match(/<loc>/g) ?? []).length).toBe(20);
    expect(xml).toContain(`<loc>${BASE_URL}/proyectos/goblin/</loc>`);
    expect(xml).toContain(`<loc>${BASE_URL}/en/proyectos/goblin/</loc>`);
    expect((xml.match(/hreflang="x-default"/g) ?? []).length).toBe(20);
  });
});

describe("inject + validatePages", () => {
  const template = `<!doctype html><html lang="{{SEO_LANG}}"><head><!--SEO_HEAD--></head><body><div id="root"><!--SEO_APP--></div><!--SEO_NOSCRIPT--></body></html>`;

  test("inyecta todas las partes", () => {
    const html = inject(template, {
      lang: "en",
      head: headHtml(homeEn),
      app: "<p>app</p>",
      noscript: noscriptHtml("en"),
    });
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<p>app</p>");
    expect(html).not.toContain("SEO_");
  });

  test("una página válida no tiene errores", () => {
    const html = inject(template, {
      lang: "es",
      head: headHtml(home),
      app: "<p>app</p>",
      noscript: noscriptHtml("es"),
    });
    expect(validatePages([{ route: home, html }])).toEqual([]);
  });

  test("detecta metadata rota", () => {
    const broken = inject(template, {
      lang: "es",
      head: `<meta property="og:image" content="/static/og-cover.png" />`,
      app: "<p>app</p>",
      noscript: "",
    });
    const errors = validatePages([{ route: home, html: broken }]);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.join("\n")).toContain(home.path);
  });

  test("detecta JSON-LD inválido", () => {
    const bad = inject(template, {
      lang: "es",
      head: headHtml(home).replace(
        /<script type="application\/ld\+json">.*?<\/script>/,
        '<script type="application/ld+json">{oops}</script>'
      ),
      app: "<p>app</p>",
      noscript: "",
    });
    const errors = validatePages([{ route: home, html: bad }]);
    expect(errors.join("\n")).toContain("JSON-LD");
  });

  test("detecta hreflang roto", () => {
    const html = inject(template, {
      lang: "es",
      head: headHtml(ficha).replace(
        `hreflang="en" href="${BASE_URL}/en/proyectos/gym-admin/"`,
        `hreflang="en" href="${BASE_URL}/en/proyectos/otro/"`
      ),
      app: "<p>app</p>",
      noscript: "",
    });
    const errors = validatePages([{ route: ficha, html }]);
    expect(errors.join("\n")).toContain("hreflang en");
  });
});
