import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import App from "src/App";
import { resetWindowSpawn } from "src/components/Windows/draggable";
import { WindowsProvider } from "src/context/WindowsContext";
import { I18nProvider } from "src/i18n";
import { alternatePath, parseRoute, ROUTES } from "src/routes";
import {
  headHtml,
  inject,
  noscriptHtml,
  sitemapXml,
  validatePages,
} from "src/seo/build";

const DIST = join(import.meta.dir, "..", "dist");
const template = readFileSync(join(DIST, "index.html"), "utf8");

const pages = ROUTES.map((route) => {
  const { locale, initialWindows } = parseRoute(route.path);
  // El contador de spawn vive a nivel módulo: sin esto se acumula entre rutas
  // y el markup no coincide con el primer render del cliente.
  resetWindowSpawn();
  // Mismo árbol que src/main.tsx: el markup debe coincidir para hidratar.
  const app = renderToString(
    <React.StrictMode>
      <I18nProvider locale={locale} alternateHref={alternatePath(route)}>
        <WindowsProvider initialWindows={initialWindows}>
          <App />
        </WindowsProvider>
      </I18nProvider>
    </React.StrictMode>
  );
  return {
    route,
    html: inject(template, {
      lang: locale,
      head: headHtml(route),
      app,
      noscript: noscriptHtml(locale),
    }),
  };
});

const errors = validatePages(pages);
if (errors.length > 0) {
  console.error(`prerender: ${errors.length} error(es) de SEO:\n${errors.join("\n")}`);
  process.exit(1);
}

for (const { route, html } of pages) {
  const file =
    route.path === "/"
      ? join(DIST, "index.html")
      : join(DIST, route.path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
writeFileSync(join(DIST, "sitemap.xml"), sitemapXml());
console.log(`prerender: ${pages.length} páginas + sitemap.xml`);
