# SEO — Diseño

Fecha: 2026-09-22
Estado: aprobado en diseño, pendiente de plan de implementación

## Contexto

Auditoría sobre `https://www.pepo.ar/` (host canónico: `pepo.ar` responde 308 → `www.pepo.ar`).
Lighthouse del sitio actual: performance 92, a11y 100, best-practices 96, seo 100. El SEO 100 de
Lighthouse es una prueba de humo: no cubre ninguno de los problemas reales.

Problemas encontrados, por impacto:

1. **Contenido no indexable.** El HTML del servidor es `<div id="root"></div>` + `<noscript>`.
   El DOM inicial solo contiene el `h1`, los íconos del escritorio y la ventana "Sobre mí"
   (arranca abierta en `src/context/WindowsContext.tsx`). El texto de los 16 proyectos
   (`src/lists/proyects.json`, ~7.8 KB) solo existe tras abrir la ventana "Proyectos" y cada ficha.
2. **Una sola URL para todo.** No hay landing por proyecto ni internal linking.
3. **Sin `robots.txt` ni `sitemap.xml`** (ambos 404 en producción).
4. **Sin `canonical` ni `og:url`.**
5. **Sin JSON-LD** (`Person`, `WebSite`, `CreativeWork`) → no hay rich result para "Ignacio Iglesias".
6. **`h1` con el nombre al revés** (`src/App.tsx`, `Iglesias Ignacio`).
7. **`og:image` y `twitter:image` relativos** (`/static/background.webp`) → los scrapers de
   WhatsApp/LinkedIn/X no los resuelven y el link se comparte sin imagen. La imagen además es el
   fondo genérico del escritorio, no una tarjeta del sitio.
8. **Performance:** FCP 2.2 s, LCP 2.7 s, Speed Index 4.5 s (Lighthouse mobile). El fondo es el
   elemento LCP y llega sin preload. `windowsXpLogo.webp` (496 B) se renderiza escalado y borroso.
   TBT 0 y CLS 0: no hay nada que arreglar del lado del main thread.

## Objetivos

1. Que el contenido de bio y proyectos sea indexable y rankeable, con URL propia por proyecto.
2. Versión en inglés completa (UI del XP incluida) con hreflang es/en.
3. Previews correctas al compartir el link y rich results de `Person`.
4. Verificación automática en build para que el SEO no se degrade solo.

Fuera de alcance: blog/artículos, analytics, Search Console, backlinks, versión en otros idiomas,
imagen OG por proyecto.

## Decisiones tomadas

- **Escritorio visualmente idéntico.** El contenido indexable se agrega en capas no visuales
  (ver "Contenido indexable"); no se agrega texto visible al layout.
- **Excepción acordada:** en las rutas `/proyectos/<slug>` el escritorio arranca con la ventana
  "Proyectos" y la ficha del proyecto abiertas (como un doble clic). Es la primera pantalla de esas
  URLs; la home queda igual que hoy.
- **Prerender estático por ruta en el build** (opción A). Descartadas: SPA + metadata en cliente
  (misma metadata para todas las URLs en crawlers sin render) y dynamic rendering por UA (frágil,
  riesgo de cloaking).
- **Español + inglés completo.** `/en/` con el escritorio XP traducido (es más fiel al XP real),
  no solo el contenido.
- **Landing por proyecto solo para los proyectos con `details`** (los destacados). Los 12 proyectos
  sin `details` quedan indexados en la lista de la ventana "Proyectos": una landing de 2 líneas es
  contenido fino. Si un proyecto gana `details`, gana automáticamente su ruta.
- **Sin router ni i18n library.** Dos patrones de ruta y strings estáticas no justifican
  `react-router` ni `react-i18next`.
- **Sin switcher de idioma visible.** El link al inglés vive en la ventana "Sobre mí"
  ("English version" → `/en/`) más los `hreflang`. El locale se determina por el prefijo `/en/`.

## Rutas

Derivadas de `src/lists/proyects.json`. El slug se calcula del título: minúsculas, sin acentos,
separado por `-`, descartando todo lo que no sea letra o número (`Huésped+` → `huesped-plus`,
`Gym App Móvil` → `gym-app-movil`). Una sola fuente de verdad.

| Ruta | Página | Título |
|---|---|---|
| `/` | Escritorio (Sobre mí abierto) | Ignacio Iglesias — Desarrollador Full Stack |
| `/proyectos/huesped-plus/` | Escritorio + ficha de Huésped+ | Huésped+ — Ignacio Iglesias |
| `/proyectos/gym-admin/` | Escritorio + ficha de Gym Admin | Gym Admin — Ignacio Iglesias |
| `/proyectos/gym-app-movil/` | Escritorio + ficha de Gym App Móvil | Gym App Móvil — Ignacio Iglesias |
| `/proyectos/lector-de-huellas/` | Escritorio + ficha de Lector de Huellas | Lector de Huellas — Ignacio Iglesias |
| `/en/` | Home en inglés | Ignacio Iglesias — Senior Full-Stack Engineer |
| `/en/proyectos/<slug>/` | Fichas en inglés | `<Title> — Ignacio Iglesias` |

Total: 10 URLs (5 es + 5 en). Todas con barra final → se escriben como `dist/<ruta>/index.html`
(sin rewrites de Vercel).

## Build y prerender

`bun run build` = `tsc && vite build && bun run prerender`:

1. `vite build` genera el bundle y `dist/index.html` como template, con placeholders para
   `<title>`, metas, canonical, hreflang, JSON-LD y `lang`.
2. `scripts/prerender.tsx` recorre la lista de rutas, renderiza el árbol de React con
   `renderToString` (misma App, con estado inicial por ruta), inyecta la metadata de esa ruta en el
   template y escribe `dist/<ruta>/index.html`.
3. El mismo script genera `dist/sitemap.xml` con las 10 URLs y sus `hreflang` como `xhtml:link`.

El prerender falla el build (exit ≠ 0) si: falta alguna ruta, hay URLs relativas en metas, los
hreflang no son recíprocos o el JSON-LD no parsea.

## Hidratación y estado por URL

- `src/routes.ts`: parsea `location.pathname` → `{ locale: "es" | "en", proyectoAbierto?: string }`.
  Sin History API: el cambio de URL es una navegación normal (back/forward funcionan).
- `WindowsContext` siembra `visibleItems` con ese estado (home: "Sobre mí"; ruta de proyecto:
  "Proyectos" + la ficha).
- Cliente: `hydrateRoot` sobre el HTML prerenderado. Dos lecturas de browser que hoy se ejecutan
  durante el render y romperían la hidratación se mueven a `useEffect`:
  `readHintSeen()` en `src/App.tsx` y las posiciones de íconos en `src/hooks/useDesktopIcons.ts`.
- **Plan B documentado:** si aparece un mismatch de hidratación terco, se cambia a `createRoot`
  reemplazando el contenedor. Resultado SEO idéntico; solo puede haber un flash visual mínimo.

## Idioma

- `src/i18n/es.ts` y `src/i18n/en.ts` + `I18nProvider` / hook `useT()`. `en` se tipa como
  `typeof es`: si falta una traducción, `tsc` falla el build.
- Van al catálogo todas las strings de UI: títulos de ventana, menú Inicio, terminal (comandos y
  salidas), reproductor, hint, menú contextual, botones.
- El contenido de datos (`proyects.json`, `profile.json`, `technologies.json`) pasa a campos
  bilingües en el mismo archivo: `"description": { "es": "...", "en": "..." }`. Una sola fuente, sin
  drift entre archivos por idioma, y el tipado obliga a traducir cada campo.
- `<html lang>` correcto en cada página prerenderizada (`es` o `en`).
- `hreflang` en todas las páginas: `es` ↔ `en` recíprocos + `x-default` → `es`.

## Contenido indexable

Tres capas con el mismo texto (nombre, rol, bio, y la lista completa de proyectos con título,
descripción y stack):

1. **`<SeoContent>`** (nuevo, siempre montado): bloque al final del `<main>` con el patrón
   `sr-only` estándar (clip / 1px, **no** `display:none`). Los lectores de pantalla lo leen — la
   a11y actual se beneficia — y Google lo indexa. El texto es el mismo que el de las ventanas, así
   que no hay contenido engañoso.
2. **`<noscript>` ampliado:** hoy tiene solo dos links. Queda con bio + proyectos + links, para
   crawlers y visitantes sin JS.
3. **JSON-LD** por ruta:
   - Todas: `Person` (name, jobTitle, url, image, `sameAs` GitHub/LinkedIn) y `WebSite`.
   - Rutas de proyecto: `CreativeWork` (name, description, author, url, inLanguage).

## Metadatos por ruta

- Title y description propios (de `proyects.json` en las fichas, de `profile.json` en las homes).
- `canonical` y `og:url` absolutos (`https://www.pepo.ar/<ruta>/`), `og:site_name`, `og:locale`
  (`es_AR` / `en_US`), `twitter:card` `summary_large_image`.
- Description de la home suma keywords que ya están en `profile.json`: "senior", "Rust/Tauri",
  "Buenos Aires".
- **OG image:** `public/static/og-cover.png`, tarjeta 1200×630 (nombre + rol, estética XP),
  referenciada como `https://www.pepo.ar/static/og-cover.png`. Generada una vez desde
  `scripts/og-cover.ts` (SVG → PNG) y commiteada; no se regenera en cada build. Una sola imagen
  para todo el sitio.
- Favicon: se suma `favicon.ico`/PNG + `apple-touch-icon`. Kirby se mantiene donde tenga soporte
  razonable (no se lo saca).

## robots y sitemap

- `public/robots.txt`: `Allow: /` + `Sitemap: https://www.pepo.ar/sitemap.xml`.
- `sitemap.xml`: generado por el prerender de la lista de rutas (10 URLs) con `hreflang` como
  `xhtml:link`. Mismo origen de datos que las páginas → no puede desincronizarse.

## Performance y redondeo

- `h1`: `Iglesias Ignacio` → `Ignacio Iglesias` (`src/App.tsx`).
- Fondo (elemento LCP): `<link rel="preload" as="image">` + `fetchpriority="high"`.
- `windowsXpLogo.webp` (496 B, escalado y borroso): asset de resolución correcta o SVG.
- Objetivo: no bajar de performance 92. No se promete subirla.

## Manejo de errores

- Prerender: valida lo enumerado en "Build y prerender" y corta el build con error descriptivo.
- Runtime: si JS falla o está deshabilitado, el `<noscript>` (y el HTML prerenderizado) siguen
  dando contenido y links.
- Locale desconocido en la URL: se resuelve a `es` (mismo comportamiento que hoy).

## Verificación

- **En build (automático):** las validaciones del prerender + `tsc` (que cubre traducciones
  faltantes por el tipado de catálogos).
- **Manual post-deploy:**
  - Rich Results Test de Google sobre `/` y una ficha.
  - Validador de OG de LinkedIn y de X sobre `/`.
  - Lighthouse sobre `/proyectos/gym-admin/` (esperado ≈ performance 92, a11y 100, seo 100).
  - `site:www.pepo.ar` a los días para ver qué indexó.
