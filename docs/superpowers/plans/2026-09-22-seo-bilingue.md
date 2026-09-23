# SEO + sitio bilingüe — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer indexable el contenido del portafolio (bio + proyectos) con URL propia por proyecto y versión en inglés completa, sin cambiar visualmente el escritorio XP.

**Architecture:** Prerender estático por ruta al final del `vite build` (`renderToString` + inyección de metadata por página) y `hydrateRoot` en el cliente. El contenido indexable vive en un bloque `sr-only` siempre montado (`<SeoContent>`) más un `<noscript>` ampliado y JSON-LD por ruta. El inglés se resuelve con catálogos `es.ts`/`en.ts` tipados y campos `{es, en}` en los JSON de datos; el locale sale del prefijo `/en/` de la URL.

**Tech Stack:** React 18 + TypeScript + Vite (sin dependencias nuevas de runtime; devDeps nuevas: `@types/bun`, `sharp`). Tests con `bun test`. SSR con `react-dom/server` en un script de build.

**Spec:** `docs/superpowers/specs/2026-09-22-seo-design.md`

## Global Constraints

- **Sin commits.** El usuario controla cuándo commitear. Cada task termina en un "Checkpoint" que lista los archivos listos; NUNCA ejecutar `git commit` ni `git add`.
- Package manager: **bun** (`bun install`, `bun run ...`, `bun test`). Nunca npm.
- Sin dependencias de runtime nuevas. DevDeps permitidas en este plan: `@types/bun` y `sharp` (solo para generar assets una vez).
- Escritorio **visualmente idéntico**. Única excepción acordada: en rutas `/proyectos/<slug>/` arranca abierta la ventana "Proyectos" + la ficha del proyecto. No se agrega texto visible al layout.
- Todo el contenido indexable va con el patrón `sr-only` de Tailwind (clip/1px). **Prohibido `display:none` o `visibility:hidden`** para contenido indexable.
- URL base: `https://www.pepo.ar`. Todas las rutas con barra final. Todas las URLs en metadatos absolutas.
- `tsc` (`bun run build`) debe pasar en cada task: cubre traducciones faltantes (tipado de catálogos) y tipos de datos bilingües.
- a11y no baja de 100: todo `aria-label`/`title` que hoy está en español se traduce con el mismo mecanismo (nada de strings hardcodeadas en atributos).
- Idioma default: `es`. `en` solo bajo `/en/`. `x-default` → `es`.

## Errata sobre la spec

La spec dice "4 proyectos con `details` / 10 URLs". Es incorrecto: son **9 proyectos con `details`** (Huésped+, Gym Admin, Gym App Móvil, Lector de Huellas, Goblin, Slop Together, Mecánica Torres, Scrappers de precios, Bonitas Ayelen) → **20 URLs** (10 es + 10 en). El plan usa los números correctos.

## Tipos y contratos compartidos

- `Bi = { es: string; en: string }` — tipo ambiental en `types/standard.d.ts` (junto a `Project`).
- `Locale = "es" | "en"` — tipo ambiental en `types/standard.d.ts`.
- `t(v: StringKey | Bi): string` — única forma de acceder a texto traducido. Los strings planos en `t()` no compilan (a propósito): si algo no está traducido, `tsc` falla el build. Nombres propios (marcas, títulos de proyecto, nombres de techs) se renderizan crudos, sin `t()`.
- Clave de ventana (identidad) = título en español del proyecto / nombre actual de WINDOW_META. **Nunca se traduce la clave**; solo se traduce el label visible.

## Estructura de archivos

| Archivo | Qué hace | Task |
|---|---|---|
| `types/standard.d.ts` (mod) | `Bi`, `Locale`, `Project` con campos bilingües | 1, 3 |
| `src/i18n/es.ts` (new) | Catálogo español (`StringKey`, `Catalog`) | 1, 4, 5, 7 |
| `src/i18n/en.ts` (new) | Catálogo inglés, tipado `Record<StringKey, string>` | 1, 4, 5, 7 |
| `src/i18n/text.ts` (new) | `pick()`, `fmt()` (sin React) | 1 |
| `src/i18n/index.tsx` (new) | `I18nProvider`, `useT`, `useLocale` | 1 |
| `src/i18n/index.test.ts` (new) | Test de paridad y formato | 1 |
| `src/routes.ts` (new) | `slugify`, `ROUTES`, `parseRoute`, `BASE_URL` | 2 |
| `src/routes.test.ts` (new) | Test de rutas y slugs | 2 |
| `src/lists/proyects.json` (mod) | Textos `{es, en}`, `titleEn` | 3 |
| `src/lists/profile.json` (mod) | Textos `{es, en}` | 3 |
| `src/lists/taskList.json` (mod) | `title: Bi` | 3 |
| `src/lists/data.test.ts` (new) | Test de completitud bilingüe | 3 |
| `src/lists/windows.ts` (mod) | `label: Bi` | 4 |
| `src/lists/desktopIcons.ts` (mod) | `label: Bi` | 4 |
| Componentes de shell (mod) | Strings → catálogo | 4 |
| Componentes de ventanas (mod) | Strings → catálogo | 5 |
| `src/components/SeoContent.tsx` (new) | Bloque indexable `sr-only` | 6 |
| `src/components/SeoContent.test.tsx` (new) | Test de contenido indexable | 6 |
| `src/App.tsx` (mod) | `h1` correcto + `<SeoContent/>` | 6 |
| `src/seo/build.ts` (new) | `pageMeta`, `headHtml`, `jsonLd`, `noscriptHtml`, `sitemapXml`, `inject`, `validatePages` | 7 |
| `src/seo/build.test.ts` (new) | Test de metadata, JSON-LD, sitemap, validación | 7 |
| `src/main.tsx` (mod) | `hydrateRoot` + providers por ruta | 8 |
| `src/context/WindowsContext.tsx` (mod) | `initialWindows` seed | 8 |
| `src/hooks/useDesktopIcons.ts` (mod) | localStorage fuera del render | 8 |
| `src/components/dateTime.tsx` (mod) | `suppressHydrationWarning` | 8 |
| `index.html` (mod) | Placeholders `{{SEO_*}}` + preload LCP | 9 |
| `scripts/prerender.tsx` (new) | Genera `dist/**/index.html` + `sitemap.xml` | 9 |
| `public/robots.txt` (new) | robots + puntero a sitemap | 9 |
| `package.json` (mod) | `test`, `prerender`, `og-cover`, `build` encadenado | 9, 10 |
| `scripts/og-cover.ts` (new) | Genera `public/static/og-cover.png` (1200×630) | 10 |
| `public/static/icons/xpFlag.svg` (new) | Logo de arranque vectorial | 10 |
| `src/images.ts` (mod) | Apunta al nuevo logo | 10 |
| `public/apple-touch-icon.png` (new) | Ícono iOS desde kirby | 10 |
| `tsconfig.json` (mod) | `include` suma `scripts` | 9 |

---

### Task 1: Infra i18n — catálogos tipados, `pick`/`fmt` y provider

**Files:**
- Create: `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/text.ts`, `src/i18n/index.tsx`, `src/i18n/index.test.ts`
- Modify: `types/standard.d.ts` (agrega `Bi` y `Locale`), `package.json` (script `test`, devDep `@types/bun`)

**Interfaces:**
- Consumes: nada.
- Produces:
  - `type Bi = { es: string; en: string }` y `type Locale = "es" | "en"` (ambientales).
  - `type StringKey = keyof typeof es` y `type Catalog = Record<StringKey, string>` de `src/i18n/es.ts`.
  - `pick(v: StringKey | Bi, locale: Locale): string` y `fmt(template: string, vars: Record<string, string>): string` de `src/i18n/text.ts`.
  - `<I18nProvider locale={...}>`, `useT(): (v: StringKey | Bi) => string`, `useLocale(): Locale` de `src/i18n/index.tsx`.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/i18n/index.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { en } from "src/i18n/en";
import { es } from "src/i18n/es";
import { fmt, pick } from "src/i18n/text";

describe("i18n", () => {
  test("en tiene exactamente las claves de es", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  test("ninguna traducción queda vacía", () => {
    for (const [key, value] of Object.entries({ ...es, ...en })) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  test("pick elige el idioma del par", () => {
    const par: Bi = { es: "hola", en: "hi" };
    expect(pick(par, "es")).toBe("hola");
    expect(pick(par, "en")).toBe("hi");
    expect(pick("algo.clave", "es")).toBe(es["algo.clave"]);
  });

  test("fmt reemplaza las variables", () => {
    expect(fmt("Abriendo {title}", { title: "Goblin" })).toBe("Abriendo Goblin");
  });

  test("fmt deja visible la variable faltante", () => {
    expect(fmt("Hola {name}", {})).toBe("Hola {name}");
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `bun test src/i18n`
Expected: FAIL — no existen `src/i18n/en`, `src/i18n/es`, `src/i18n/text`.

- [ ] **Step 3: Agregar tipos ambientales**

Agregar al final de `types/standard.d.ts`:

```ts
/** Texto bilingüe: toda la copy traducible vive en pares es/en. */
type Bi = { es: string; en: string };

/** Idioma del sitio. Se determina por el prefijo /en/ de la URL. */
type Locale = "es" | "en";
```

- [ ] **Step 4: Escribir la implementación mínima**

Crear `src/i18n/es.ts` (con una sola clave por ahora — las demás se agregan en las tasks 4, 5 y 7):

```ts
/**
 * Catálogo español. `StringKey` es el contrato: cualquier clave usada fuera de
 * este objeto no compila, y `en.ts` debe tener exactamente estas claves.
 */
export const es = {
  "test.key": "valor",
} as const satisfies Record<string, string>;

export type StringKey = keyof typeof es;
export type Catalog = Record<StringKey, string>;
```

Crear `src/i18n/en.ts`:

```ts
import type { Catalog } from "src/i18n/es";

/** Catálogo inglés. `Catalog` exige exactamente las claves de `es` (ni una más, ni una menos). */
export const en: Catalog = {
  "test.key": "value",
};
```

Crear `src/i18n/text.ts` (sin React: lo importan también los scripts de build):

```ts
import type { Catalog, StringKey } from "src/i18n/es";
import { en } from "src/i18n/en";
import { es } from "src/i18n/es";

const CATALOGS: Record<Locale, Catalog> = { es, en };

/** Resuelve una clave del catálogo o un par {es, en} al idioma dado. */
export function pick(v: StringKey | Bi, locale: Locale): string {
  return typeof v === "string" ? CATALOGS[locale][v] : v[locale];
}

/**
 * Formatea un template del catálogo con variables `{nombre}`.
 * La variable faltante queda visible en vez de desaparecer.
 */
export function fmt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => vars[k] ?? `{${k}}`);
}
```

Crear `src/i18n/index.tsx`:

```tsx
import { ReactNode, createContext, useContext, useMemo } from "react";
import type { StringKey } from "src/i18n/es";
import { pick } from "src/i18n/text";

export { fmt, pick } from "src/i18n/text";

type T = (v: StringKey | Bi) => string;

interface I18nCtx {
  locale: Locale;
  t: T;
}

const fallback: I18nCtx = { locale: "es", t: (v) => pick(v, "es") };
const I18nContext = createContext<I18nCtx>(fallback);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo<I18nCtx>(
    () => ({ locale, t: (v) => pick(v, locale) }),
    [locale]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nCtx {
  return useContext(I18nContext);
}

export function useT(): T {
  return useContext(I18nContext).t;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}
```

- [ ] **Step 5: Agregar `@types/bun` y el script de tests**

Run: `bun add -d @types/bun`

En `package.json`, agregar a `"scripts"`:

```json
"test": "bun test",
```

- [ ] **Step 6: Correr los tests y verificar que pasan**

Run: `bun test src/i18n`
Expected: PASS — 5 tests.

Run: `bunx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Checkpoint (sin commit — el usuario commitea)**

Archivos: `types/standard.d.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/text.ts`, `src/i18n/index.tsx`, `src/i18n/index.test.ts`, `package.json`, `bun.lock`.

---

### Task 2: Rutas y slugs

**Files:**
- Create: `src/routes.ts`, `src/routes.test.ts`

**Interfaces:**
- Consumes: `Bi`/`Locale` de la Task 1; `Project` de `types/standard.d.ts`; `src/lists/proyects.json`.
- Produces:
  - `BASE_URL: string` = `"https://www.pepo.ar"`.
  - `slugify(title: string): string`.
  - `type Route = { path: string; locale: Locale; kind: "home" | "project"; projectTitle?: string }`.
  - `PROJECT_ROUTES: Route[]` y `ROUTES: Route[]` (20 rutas: home es, 9 proyectos es, home en, 9 proyectos en).
  - `parseRoute(pathname: string): { locale: Locale; initialWindows: string[] }`.
  - `alternatePath(route: Route): string` — path de la misma página en el otro idioma (para hreflang).

- [ ] **Step 1: Escribir el test que falla**

Crear `src/routes.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import {
  PROJECT_ROUTES,
  ROUTES,
  alternatePath,
  parseRoute,
  slugify,
} from "src/routes";

describe("slugify", () => {
  test("normaliza títulos reales de proyectos", () => {
    expect(slugify("Huésped+")).toBe("huesped-plus");
    expect(slugify("Gym App Móvil")).toBe("gym-app-movil");
    expect(slugify("Lector de Huellas")).toBe("lector-de-huellas");
    expect(slugify("Mecánica Torres")).toBe("mecanica-torres");
    expect(slugify("Slop Together")).toBe("slop-together");
  });
});

describe("ROUTES", () => {
  test("los slugs de proyecto quedan anclados", () => {
    expect(PROJECT_ROUTES.map((r) => r.path)).toEqual([
      "/proyectos/huesped-plus/",
      "/proyectos/gym-admin/",
      "/proyectos/gym-app-movil/",
      "/proyectos/lector-de-huellas/",
      "/proyectos/goblin/",
      "/proyectos/slop-together/",
      "/proyectos/mecanica-torres/",
      "/proyectos/scrappers-de-precios/",
      "/proyectos/bonitas-ayelen/",
    ]);
  });

  test("20 rutas: 2 homes + 9 proyectos, por idioma", () => {
    expect(ROUTES.length).toBe(20);
    expect(ROUTES.filter((r) => r.kind === "home").length).toBe(2);
  });

  test("toda ruta tiene barra final y absoluta", () => {
    for (const r of ROUTES) {
      expect(r.path.startsWith("/"), r.path).toBe(true);
      expect(r.path.endsWith("/"), r.path).toBe(true);
    }
  });
});

describe("parseRoute", () => {
  test("home en español", () => {
    expect(parseRoute("/")).toEqual({ locale: "es", initialWindows: ["Sobre mí"] });
  });

  test("ficha de proyecto abre Proyectos + la ficha", () => {
    expect(parseRoute("/proyectos/gym-admin/")).toEqual({
      locale: "es",
      initialWindows: ["Proyectos", "Gym Admin"],
    });
  });

  test("acepta URL sin barra final", () => {
    expect(parseRoute("/en/proyectos/goblin")).toEqual({
      locale: "en",
      initialWindows: ["Proyectos", "Goblin"],
    });
  });

  test("ruta desconocida cae en la home en español", () => {
    expect(parseRoute("/no-existe/")).toEqual({
      locale: "es",
      initialWindows: ["Sobre mí"],
    });
  });
});

describe("alternatePath", () => {
  test("es -> en y en -> es", () => {
    expect(alternatePath(ROUTES[0])).toBe("/en/");
    const ficha = ROUTES.find((r) => r.path === "/proyectos/goblin/")!;
    expect(alternatePath(ficha)).toBe("/en/proyectos/goblin/");
    const enHome = ROUTES.find((r) => r.path === "/en/")!;
    expect(alternatePath(enHome)).toBe("/");
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `bun test src/routes`
Expected: FAIL — no existe `src/routes`.

- [ ] **Step 3: Implementar `src/routes.ts`**

```ts
import proyectsData from "src/lists/proyects.json";

export const BASE_URL = "https://www.pepo.ar";

/** "Huésped+" -> "huesped-plus". Minúsculas, sin acentos, separado por "-". */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `bun test src/routes`
Expected: PASS — 9 tests.

Run: `bunx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 5: Checkpoint (sin commit)**

Archivos: `src/routes.ts`, `src/routes.test.ts`.

---

### Task 3: Datos bilingües (`proyects.json`, `profile.json`, `taskList.json`) y sus consumidores

**Files:**
- Modify: `types/standard.d.ts` (interface `Project`), `src/lists/proyects.json`, `src/lists/profile.json`, `src/lists/taskList.json`
- Modify: `src/components/Windows/WindowsContainer.tsx`, `src/components/Windows/SobreMi.tsx`, `src/components/Windows/Curriculum.tsx`, `src/components/ShutdownScreen.tsx`, `src/components/Windows/Terminal.tsx`
- Create: `src/lists/data.test.ts`

**Interfaces:**
- Consumes: `Bi`, `t()` de la Task 1.
- Produces: `Project` ampliado — `description?: Bi`, `details?: Bi[]`, `badge?: Bi`, `noDemoNote?: Bi`, `titleEn?: string`. Los consumidores usan `t(campo)`; `tsc` falla si un campo traducible quedó como string plano.

**Nota de diseño:** `technologies.json` y `music.json` NO cambian: sus campos son nombres propios (React, "We Are The People") y no llevan traducción.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lists/data.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import profile from "src/lists/profile.json";
import proyectsData from "src/lists/proyects.json";
import taskList from "src/lists/taskList.json";

function expectComplete(v: Bi, label: string) {
  expect(typeof v, label).toBe("object");
  expect(v.es.trim(), `${label}.es`).not.toBe("");
  expect(v.en.trim(), `${label}.en`).not.toBe("");
}

describe("datos bilingües", () => {
  test("proyectos: textos completos en ambos idiomas", () => {
    for (const p of proyectsData.proyects as Project[]) {
      if (p.description) expectComplete(p.description, `${p.title}.description`);
      if (p.badge) expectComplete(p.badge, `${p.title}.badge`);
      if (p.noDemoNote) expectComplete(p.noDemoNote, `${p.title}.noDemoNote`);
      for (const [i, d] of (p.details ?? []).entries()) {
        expectComplete(d, `${p.title}.details[${i}]`);
      }
    }
  });

  test("los 9 proyectos con details tienen landing", () => {
    const withDetails = (proyectsData.proyects as Project[]).filter(
      (p) => p.details && p.details.length > 0
    );
    expect(withDetails.length).toBe(9);
  });

  test("profile: bio, tagline y current completos", () => {
    expectComplete(profile.tagline, "profile.tagline");
    expectComplete(profile.current, "profile.current");
    for (const [i, p] of profile.bio.entries()) {
      expectComplete(p, `profile.bio[${i}]`);
    }
    for (const link of profile.links) expectComplete(link.title, `link.title`);
  });

  test("taskList: títulos completos", () => {
    for (const item of taskList.items) expectComplete(item.title, item.href);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `bun test src/lists`
Expected: FAIL — los campos son strings, no `Bi` (`typeof v === "object"` falla).

- [ ] **Step 3: Actualizar `types/standard.d.ts`**

Reemplazar la interface `Project` completa por:

```ts
interface Project {
  /** Clave estable de ventana y de slug. Marca/proyecto: no se traduce. */
  title: string;
  /** Título en inglés para <title>/JSON-LD. Si falta, se usa `title`. */
  titleEn?: string;
  url?: string;
  type?: string;
  icon: string;
  featured?: boolean;
  description?: Bi;
  /** Bullets que se muestran en la ficha del proyecto (ventana propia). */
  details?: Bi[];
  /** Etiqueta para los proyectos que no tienen demo pública. */
  badge?: Bi;
  /**
   * Qué decir cuando no hay demo pública. Por defecto es genérico y neutro;
   * los proyectos de un empleador o cliente conviene redactarlos aparte para
   * no ofrecer detalles internos que no son tuyos.
   */
  noDemoNote?: Bi;
  stack?: string[];
}
```

- [ ] **Step 4: Traducir los JSON de datos**

`src/lists/profile.json` — cambiar `tagline`, `bio`, `current` y el título del link "Correo". Valores exactos:

```json
"tagline": { "es": "Web · Mobile · Desktop nativo · IA", "en": "Web · Mobile · Native desktop · AI" },
"bio": [
  {
    "es": "Ingeniero full-stack senior con ownership end-to-end de productos: diseño de sistemas, arquitectura de datos, frontend, app mobile nativa, integración con hardware y deploy en producción.",
    "en": "Senior full-stack engineer with end-to-end product ownership: system design, data architecture, frontend, native mobile apps, hardware integration and production deploys."
  },
  {
    "es": "Construí Huésped+, el primer hotel agéntico con IA de Argentina —la PWA del huésped con check-in digital, pagos in-app y un concierge LLM que responde sobre el hotel y sobre la propia estadía.",
    "en": "I built Huésped+, Argentina's first agentic hotel —the guest PWA with digital check-in, in-app payments and an LLM concierge that answers about the hotel and about each stay."
  },
  {
    "es": "Amplitud poco común —React/Next.js, React Native/Expo, Rust/Tauri, backends en Node/Bun— con fuerte especialización en ingeniería asistida por IA: servidores MCP propios, agentes y LLMs en producción con guardrails.",
    "en": "Unusual breadth —React/Next.js, React Native/Expo, Rust/Tauri, Node/Bun backends— with a strong focus on AI-assisted engineering: custom MCP servers, agents and LLMs in production with guardrails."
  }
],
"current": {
  "es": "Huésped+ en producción con hoteles reales, y GymAdmin —mi SaaS para gimnasios en LATAM— de punta a punta.",
  "en": "Huésped+ in production with real hotels, and GymAdmin —my SaaS for gyms in Latin America— end to end."
},
"links": [
  { "title": { "es": "Github", "en": "Github" }, "href": "https://github.com/pepo2405", "icon": "/static/icons/github.svg" },
  { "title": { "es": "Linkedin", "en": "Linkedin" }, "href": "https://www.linkedin.com/in/ignacioniglesias2405/", "icon": "/static/icons/linkedin.svg" },
  { "title": { "es": "Correo", "en": "Email" }, "href": "https://mail.google.com/mail/?view=cm&fs=1&to=ignacioniglesias@gmail.com&su=Contacto", "icon": "/static/icons/gmail.svg" }
]
```

(`name`, `handle`, `role`, `location` quedan strings: nombres propios y un rol que ya está en inglés.)

`src/lists/taskList.json` — cada `title` pasa a `Bi`: `{ "es": "Github", "en": "Github" }`, `{ "es": "Linkedin", "en": "Linkedin" }`, `{ "es": "Correo", "en": "Email" }`. `href`, `icon` y `target` no cambian.

`src/lists/proyects.json` — cada campo traducible pasa a `Bi` y se agrega `titleEn` donde el título se traduce. Valores exactos por proyecto (el orden y el resto de campos no cambian):

1. **Huésped+** (sin `titleEn`: es marca)
   - `description`: es "El primer hotel agéntico con IA de Argentina: la PWA del huésped, personalizable por hotel." · en "Argentina's first agentic hotel: the guest PWA, customized for each hotel."
   - `badge`: es "En PXSOL" · en "At PXSOL"
   - `details`:
     1. es "Cada hotel la publica con su propio dominio, su marca y su contenido: el mismo producto se ve distinto en cada propiedad, sin un deploy por cliente." · en "Each hotel ships it on its own domain, with its own brand and content: the same product looks different in every property, with no deploy per client."
     2. es "El huésped hace el check-in y el check-out desde el celular, pide room service, paga in-app y deja la encuesta post-estadía, sin instalar nada." · en "Guests check in and out from their phone, order room service, pay in-app and fill in the post-stay survey, without installing anything."
     3. es "El concierge con IA responde 24/7 sobre el hotel —servicios, horarios, políticas, turismo local— y sobre la estadía concreta. Multilingüe, con guardrails anti-alucinación y derivación a recepción cuando no sabe." · en "The AI concierge answers 24/7 about the hotel —services, hours, policies, local tourism— and about each specific stay. Multilingual, with anti-hallucination guardrails and hand-off to the front desk when it doesn't know."
     4. es "En producción en hoteles reales de Argentina." · en "Live in real hotels across Argentina."
   - `noDemoNote`: es "Huésped+ es un producto de PXSOL y no tiene demo pública. Si querés, escribime y te cuento cuál fue mi rol en el equipo." · en "Huésped+ is a PXSOL product with no public demo. Drop me a line and I'll walk you through what I did on the team."
2. **Gym Admin** (sin `titleEn`)
   - `description`: es "SaaS multi-tenant de gestión de gimnasios: clientes, membresías, caja y rutinas." · en "Multi-tenant SaaS for gym management: members, memberships, cash register and workout plans."
   - `details`:
     1. es "Cada gimnasio entra con su propio dominio y ve solo sus datos: un solo deploy, muchos clientes." · en "Each gym gets its own domain and sees only its own data: one deploy, many clients."
     2. es "Cubre el día a día del mostrador: alta de socios, cobros, membresías que vencen, caja y rutinas." · en "Covers the front desk's day to day: member sign-ups, payments, expiring memberships, cash register and workout plans."
     3. es "Es la base sobre la que se apoyan la app móvil y el control de acceso por huella." · en "It's the backbone the mobile app and the fingerprint access control build on."
3. **Gym App Móvil** — `titleEn`: "Gym Mobile App"
   - `description`: es "App white-label del sistema: check-in, ventas y deudas desde el mostrador del gimnasio." · en "The system's white-label app: check-in, sales and debts from the gym's front desk."
   - `badge`: es "Privado" · en "Private"
   - `details`:
     1. es "App white-label: cada gimnasio la publica con su propia marca e ícono." · en "White-label app: each gym ships it with its own brand and icon."
     2. es "Resuelve el check-in por DNI, la venta de pases y el cobro de deudas en el momento, sin PC." · en "Handles DNI check-in, pass sales and debt collection on the spot, no PC needed."
     3. es "Comparte los contratos de la API con el backend, así que un cambio de esquema rompe el build en vez de romper en producción." · en "Shares the API contracts with the backend, so a schema change breaks the build instead of breaking production."
4. **Lector de Huellas** — `titleEn`: "Fingerprint Reader" (sin `description`)
   - `badge`: es "Privado" · en "Private"
   - `details`:
     1. es "Servicio nativo en Rust + Tauri que habla directo con los lectores ZKTeco de la red local." · en "A native Rust + Tauri service that talks directly to the ZKTeco readers on the local network."
     2. es "Empuja cada fichaje a gym-admin por WebSocket, así el mostrador lo ve al instante." · en "It pushes every punch to gym-admin over WebSocket, so the front desk sees it instantly."
     3. es "Si se corta la red, encola los eventos en disco y los reintenta cuando vuelve." · en "If the network drops, it queues events on disk and retries when it's back."
5. **Goblin** (sin `titleEn`)
   - `description`: es "App de streaming nativa con MPV, addons Stremio, torrents y debrid." · en "A native streaming app with MPV, Stremio addons, torrents and debrid services."
   - `badge`: es "Proyecto personal" · en "Personal project"
   - `details`:
     1. es "App de escritorio hecha en Tauri + Rust para ver contenido por streaming." · en "A desktop app built with Tauri + Rust for streaming content."
     2. es "Compatible con addons de Stremio, torrents y servicios debrid." · en "Works with Stremio addons, torrents and debrid services."
     3. es "El playback lo hace MPV embebido: reproduce cualquier códec sin pelear con las limitaciones del navegador." · en "Playback is handled by an embedded MPV: it plays any codec without fighting browser limitations."
   - `noDemoNote`: es "Es un proyecto personal y todavía no tiene demo pública. Si querés, te muestro cómo está hecho por dentro." · en "It's a personal project with no public demo yet. Happy to show you how it's built inside."
6. **Slop Together** (sin `titleEn`)
   - `description`: es "Juego de doblaje colaborativo estilo Jackbox: host + celulares por código, sin instalar nada." · en "A Jackbox-style collaborative dubbing game: one host plus phones via code, nothing to install."
   - `details`:
     1. es "Un host abre la partida en la compu y el resto se suma desde el celular con un código, sin instalar nada." · en "The host starts the game on a computer and everyone joins from their phone with a code, nothing to install."
     2. es "Cada ronda reparte un video y todos le ponen voz; después se vota el mejor doblaje." · en "Each round hands out a video and everyone voices it; then everyone votes for the best dub."
     3. es "Toda la sincronización en vivo va por WebSockets." · en "All live sync runs over WebSockets."
7. **Mecánica Torres** (sin `titleEn`: nombre propio)
   - `description`: es "Landing de cliente real: mecánica a domicilio en Pilar, orientada a WhatsApp." · en "A real client's landing page: mobile mechanics in Pilar, built around WhatsApp."
   - `details`:
     1. es "Sitio de un mecánico a domicilio en Pilar: el objetivo del negocio es que lo escriban por WhatsApp." · en "A site for a mobile mechanic in Pilar: the business goal is to get WhatsApp messages."
     2. es "Cada sección empuja a esa acción —los servicios, la zona de cobertura y la garantía están escritas para responder las dudas antes de que las pregunten." · en "Every section pushes toward that action —services, coverage area and warranty are written to answer questions before they're asked."
     3. es "En producción y generando consultas reales." · en "In production and generating real leads."
8. **Scrappers de precios** — `titleEn`: "Price Scrapers"
   - `description`: es "Seguimiento de precios con scrapers de Día/VTEX y Mercado Libre, sin navegador headless." · en "Price tracking with scrapers for Día/VTEX and Mercado Libre, no headless browser."
   - `badge`: es "Privado" · en "Private"
   - `details`:
     1. es "Los scrapers pegan directo contra las APIs internas de Día/VTEX y Mercado Libre, sin abrir un navegador headless." · en "The scrapers hit the internal Día/VTEX and Mercado Libre APIs directly, no headless browser involved."
     2. es "Guarda el histórico en SQLite para ver cómo evoluciona cada precio en el tiempo." · en "It keeps price history in SQLite to see how each price moves over time."
     3. es "Un front en React muestra los productos que seguís y te avisa cuando se mueven." · en "A React front shows the products you follow and alerts you when they move."
9. **Bonitas Ayelen** (sin `titleEn`: nombre propio)
   - `description`: es "Turnos online para un estudio de belleza en Garín: servicios, profesionales y seña." · en "Online booking for a beauty salon in Garín: services, staff and deposits."
   - `details`:
     1. es "Los turnos se reservan 100% online: la clienta elige el servicio, suma varios al mismo turno, elige profesional, día y horario." · en "Bookings are 100% online: the client picks the service, adds several to the same slot, and chooses staff, day and time."
     2. es "Cobra la seña en el momento de reservar y manda la confirmación al instante." · en "It charges the deposit at booking time and sends the confirmation instantly."
     3. es "También resuelve el alquiler de equipos con requisitos y combos de insumos para profesionales." · en "It also handles equipment rental with requirements and supply combos for professionals."

Los proyectos simples (YT Amogus, Dolar blue, Video to Mp3, Pokedex, Calculadora, Cartas Clima, Lista de tareas, Peliculas React) no tienen campos traducibles: solo `title`/`url`/`icon`, quedan igual.

- [ ] **Step 5: Actualizar los consumidores**

Patrón único: `const t = useT();` (de `src/i18n`) y envolver cada campo `Bi` en `t(...)`.

`src/components/Windows/WindowsContainer.tsx`:
- Agregar imports: `import { useT } from "src/i18n";`.
- `WindowsContainer`: `const t = useT();` al inicio. Los `<SectionLabel>` se traducen en la Task 5 (son catálogo); por ahora lo que cambia es el paso de props: `<FeaturedCard {...el} />` recibe campos `Bi` sin tocar (el componente hijo los resuelve).
- `FeaturedCard`: agregar `const t = useT();` y renderizar `{t(description)}` en vez de `{description}`. `badge` se muestra en la Task 5.
- `ProjectDetail`: `const t = useT();` y:
  - `const sinDemo = t(project.noDemoNote ?? { es: "No hay demo pública de este proyecto. Si querés, escribime y te cuento cuál fue mi parte.", en: "There's no public demo for this project. Drop me a line and I'll tell you what I did." });`
  - `{t(description)}`, `{item.map((d) => ... <span>{t(d)}</span>)}`, `{t(badge)}` (el badge también como `{t(badge)}` donde se renderiza).

`src/components/Windows/SobreMi.tsx`:
- `const t = useT();` + desestructurar igual pero renderizar: `{t(tagline)}`, `{bio.map((paragraph) => <p key={paragraph.en}>{t(paragraph)}</p>)}`, `{t(current)}`, `{t(link.title)}`.

`src/components/Windows/Curriculum.tsx`:
- `const t = useT();` y la constante `CVS` pasa a `Bi`:

```tsx
const CVS: { lang: Bi; note: Bi; href: string }[] = [
  {
    lang: { es: "Español", en: "Spanish" },
    note: { es: "Versión principal", en: "Main version" },
    href: "/static/Cv Ignacio Iglesias.pdf",
  },
  {
    lang: { es: "English", en: "English" },
    note: { es: "English version", en: "English version" },
    href: "/static/Cv Ignacio Iglesias (EN).pdf",
  },
];
```

Renderizar `{t(cv.lang)}` y `{t(cv.note)}`.

`src/components/ShutdownScreen.tsx`:
- `const t = useT();` + `{t(link.title)}`.

`src/components/Windows/Terminal.tsx` (solo los datos; los textos propios van en la Task 5):
- `whoami`: `...profile.bio.map((t) => push("output", pick(t, locale)))` — ver nota abajo.
- `stack`: `push("output", pick({ es: `Ahora mismo: ${profile.current.es}`, en: ... })` — NO: en la Task 5 esto pasa a catálogo con `fmt`. Por ahora, para que compile: usar `t(profile.current)` dentro de un template literal español no sirve. **Decisión:** Terminal recibe `const { t, locale } = useI18n();` y en esta task se reemplazan únicamente los accesos a datos: `profile.bio.map((p) => push("output", t(p)))` y en `stack`: `push("output", t({ es: `Ahora mismo: ${profile.current.es}`, en: `Right now: ${profile.current.en}` }))` — se acepta como paso intermedio; la Task 5 lo reemplaza por `fmt(t("term.stackNow"), { current: t(profile.current) })`. También `contact`: `push("accent", \`  ${t(l.title).padEnd(10)} ${l.href}\`)`.

- [ ] **Step 6: Correr los tests y verificar que pasan**

Run: `bun test`
Expected: PASS — 5 (i18n) + 9 (routes) + 4 (data) tests.

Run: `bunx tsc --noEmit`
Expected: sin errores. Si un campo quedó como string plano donde se llama `t(...)`, falla acá (a propósito).

Run: `bun run lint`
Expected: sin errores.

- [ ] **Step 7: Checkpoint (sin commit)**

Archivos: `types/standard.d.ts`, `src/lists/proyects.json`, `src/lists/profile.json`, `src/lists/taskList.json`, `src/lists/data.test.ts`, `src/components/Windows/WindowsContainer.tsx`, `src/components/Windows/SobreMi.tsx`, `src/components/Windows/Curriculum.tsx`, `src/components/ShutdownScreen.tsx`, `src/components/Windows/Terminal.tsx`.

---

### Task 4: Strings del shell al catálogo (taskbar, hint, menús, ventanas, accesibilidad)

**Files:**
- Create: entradas en `src/i18n/es.ts` y `src/i18n/en.ts`
- Modify: `src/lists/windows.ts`, `src/lists/desktopIcons.ts`, `src/components/TaskBar.tsx`, `src/components/DesktopHint.tsx`, `src/components/DesktopContextMenu.tsx`, `src/components/ShutdownScreen.tsx`, `src/components/FullScreenButton.tsx`, `src/components/DesktopIcon.tsx`, `src/components/Amongus.tsx`, `src/components/Windows/TitleBar.tsx`, `src/components/dateTime.tsx`, `src/App.tsx`
- Create: `src/lists/windows.test.ts`

**Interfaces:**
- Consumes: `t()`, catálogos de la Task 1.
- Produces: `WindowMeta.label: Bi` y `windowLabel(title: string): Bi` (cambio de firma: antes devolvía `string`). `DesktopIconDef.label: Bi`. Todo componente de shell llama `t(...)` para su copy.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lists/windows.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { WINDOW_META, windowLabel } from "src/lists/windows";

describe("labels de ventana", () => {
  test("todos los labels tienen es y en", () => {
    for (const [title, meta] of Object.entries(WINDOW_META)) {
      expect(meta.label.es.trim(), title).not.toBe("");
      expect(meta.label.en.trim(), title).not.toBe("");
    }
  });

  test("windowLabel traduce y cae al título para fichas de proyecto", () => {
    expect(windowLabel("Sobre mí")).toEqual({ es: "Sobre mí", en: "About me" });
    expect(windowLabel("Gym Admin")).toEqual({ es: "Gym Admin", en: "Gym Admin" });
    expect(windowLabel("Gym App Móvil")).toEqual({
      es: "Gym App Móvil",
      en: "Gym Mobile App",
    });
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `bun test src/lists/windows`
Expected: FAIL — `meta.label.es` es `undefined` (`label` es string).

- [ ] **Step 3: Agregar las claves del shell a los catálogos**

Agregar a `src/i18n/es.ts` (al objeto `es`):

```ts
  "taskbar.start": "Inicio",
  "taskbar.startMenu": "Menú Inicio",
  "taskbar.logOff": "Cerrar sesión",
  "taskbar.shutdown": "Apagar",
  "titlebar.minimize": "Minimizar",
  "titlebar.maximize": "Maximizar",
  "titlebar.restore": "Restaurar",
  "titlebar.close": "Cerrar",
  "fullscreen.enter": "Pantalla completa",
  "fullscreen.exit": "Salir de pantalla completa",
  "icon.fallback": "Ícono del escritorio",
  "menu.title": "Menú del escritorio",
  "menu.view": "Ver",
  "menu.organize": "Organizar íconos",
  "menu.refresh": "Actualizar",
  "menu.properties": "Propiedades",
  "hint.title": "¿Cómo se abrir esto?",
  "hint.dblclick": "Doble clic en un ícono para abrirlo. Podés arrastrarlos para acomodarlos.",
  "hint.terminal.a": "Si te gustan las terminales, abrí",
  "hint.terminal.b": "y escribí",
  "hint.dismiss": "Entendido",
  "shutdown.thanks": "Gracias por pasar",
  "shutdown.powerOn": "⏻ Volver a encender",
  "amongus.label": "Amogus (easter egg): clic para lastimarlo",
  "amongus.alert": "Para emocion ya lo hiciste pelota",
  "date.localeTag": "es-AR",
```

Agregar a `src/i18n/en.ts` (mismas claves):

```ts
  "taskbar.start": "Start",
  "taskbar.startMenu": "Start menu",
  "taskbar.logOff": "Log off",
  "taskbar.shutdown": "Shut down",
  "titlebar.minimize": "Minimize",
  "titlebar.maximize": "Maximize",
  "titlebar.restore": "Restore",
  "titlebar.close": "Close",
  "fullscreen.enter": "Full screen",
  "fullscreen.exit": "Exit full screen",
  "icon.fallback": "Desktop icon",
  "menu.title": "Desktop menu",
  "menu.view": "View",
  "menu.organize": "Arrange icons",
  "menu.refresh": "Refresh",
  "menu.properties": "Properties",
  "hint.title": "How do I open this?",
  "hint.dblclick": "Double-click an icon to open it. You can drag them around to rearrange.",
  "hint.terminal.a": "Into terminals? Open",
  "hint.terminal.b": "and type",
  "hint.dismiss": "Got it",
  "shutdown.thanks": "Thanks for stopping by",
  "shutdown.powerOn": "⏻ Turn it back on",
  "amongus.label": "Amogus (easter egg): click to hurt it",
  "amongus.alert": "Easy there, you already wrecked it",
  "date.localeTag": "en-US",
```

- [ ] **Step 4: Pasar labels de ventanas e íconos a `Bi`**

`src/lists/windows.ts`: cambiar el tipo y los valores:

```ts
export type WindowMeta = {
  icon: string;
  label: Bi;
  /** Tamaño inicial de la ventana. Si falta, DraggableWin usa su default (600x430). */
  size?: { width: number; height: number };
};
```

Y en `WINDOW_META` cada `label` pasa a par (la clave del record NO cambia):

```ts
  "Sobre mí": { icon: "/kirby.webp", label: { es: "Sobre mí", en: "About me" }, size: { width: 580, height: 640 } },
  Curriculum: { icon: "/static/icons/cv.svg", label: { es: "Curriculum", en: "Resume" }, size: { width: 470, height: 330 } },
  Proyectos: { icon: "/static/folderIcon.png", label: { es: "Proyectos", en: "Projects" }, size: { width: 820, height: 560 } },
  Sociales: { icon: "/static/icons/redes.webp", label: { es: "Redes sociales", en: "Social links" }, size: { width: 420, height: 250 } },
  "Tecnologías": { icon: "/static/folderIcon.png", label: { es: "Tecnologías", en: "Technologies" }, size: { width: 720, height: 500 } },
  Terminal: { icon: "/static/icons/terminal.svg", label: { es: "Terminal", en: "Terminal" }, size: { width: 620, height: 400 } },
  Reproductor: { icon: "/static/icons/wmp.svg", label: { es: "Reproductor multimedia", en: "Media Player" } },
```

`PROJECT_META` y `windowLabel`:

```ts
const PROJECT_META: Record<string, WindowMeta> = Object.fromEntries(
  (proyectsData.proyects as Project[]).map((p) => [
    p.title,
    { icon: p.icon, label: { es: p.title, en: p.titleEn ?? p.title } },
  ])
);

export function windowLabel(title: string): Bi {
  return windowMeta(title)?.label ?? { es: title, en: title };
}
```

`src/lists/desktopIcons.ts`: `label: Bi` en `DesktopIconDef`. Para los íconos de ventana, reutilizar el label de `WINDOW_META` (DRY) y para el easter egg `{ es: "", en: "" }`:

```ts
import { WINDOW_META } from "src/lists/windows";
// ...
export interface DesktopIconDef {
  id: string;
  icon: string; // url para background-image
  label: Bi;
  kind: DesktopIconKind;
  defaultCell: Cell;
}
```

Cada entrada de `DESKTOP_ICONS` con `kind: { type: "open-window", title }` usa `label: WINDOW_META[title].label`; la entrada `amongus` usa `label: { es: "", en: "" }`. El `id` de la entrada `Sobre mí` queda `"Sobre mí"` (es clave de persistencia: no tocar).

- [ ] **Step 5: Traducir los componentes de shell**

Patrón: `const t = useT();` + `t(...)` sobre cada string de UI (incluidos `aria-label`, `title` y `alt`).

`src/components/TaskBar.tsx`:
- `import { useT } from "src/i18n";` y `const t = useT();`
- `alt="Inicio"` → `alt={t("taskbar.start")}`
- `<span className="font-bold italic">Inicio</span>` → `{t("taskbar.start")}`
- `aria-label="Menú Inicio"` → `aria-label={t("taskbar.startMenu")}`
- `<span ...>Ignacio Iglesias</span>` queda igual (nombre propio)
- `<span className="text-sm font-bold">{meta.label}</span>` → `{t(meta.label)}`
- Botón "Curriculum" suelto del menú: `{t(windowLabel("Curriculum"))}` (importar `windowLabel`)
- `Cerrar sesión` → `{t("taskbar.logOff")}`; `Apagar` → `{t("taskbar.shutdown")}`
- Taskbar de ventanas: `title={title}` y `aria-label={title}` → `title={t(windowLabel(title))}` y `aria-label={t(windowLabel(title))}`; `<span ...>{windowLabel(title)}</span>` → `{t(windowLabel(title))}`

`src/components/DesktopHint.tsx`:
- `¿Cómo se abre esto?` → `{t("hint.title")}`
- El párrafo del doble clic → `{t("hint.dblclick")}`
- El párrafo de la terminal se arma así (respetando el `<span>` y el `<code>`):

```tsx
<p className="mt-1 leading-snug text-slate-600">
  {t("hint.terminal.a")}{" "}
  <span className="font-semibold">Terminal</span>{" "}
  {t("hint.terminal.b")}{" "}
  <code className="rounded bg-black/10 px-1">help</code>.
</p>
```

- `Entendido` → `{t("hint.dismiss")}`

`src/App.tsx`:
- `const t = useT();` (App queda dentro del provider — Task 8 lo monta; mientras tanto el fallback es `es`, funciona igual).
- Ítems del `DesktopContextMenu`: `"Ver"` → `t("menu.view")`, `"Organizar íconos"` → `t("menu.organize")`, `"Actualizar"` → `t("menu.refresh")`, `"Propiedades"` → `t("menu.properties")`.
- `label={def.label}` → `label={t(def.label)}` (prop `label` de `DesktopIcon` sigue siendo `string`).
- `<h1>` se corrige en la Task 6.

`src/components/DesktopContextMenu.tsx`: `aria-label="Menú del escritorio"` → `aria-label={t("menu.title")}`.

`src/components/DesktopIcon.tsx`: `aria-label={label || "Ícono del escritorio"}` → `aria-label={label || t("icon.fallback")}` (recibe `label` ya traducido; agrega `const t = useT();` para el fallback).

`src/components/Amongus.tsx`:
- `aria-label="Amogus (easter egg): clic para lastimarlo"` → `aria-label={t("amongus.label")}`
- `alert("Para emocion ya lo hiciste pelota")` → `alert(t("amongus.alert"))`

`src/components/FullScreenButton.tsx`: los dos `aria-label`/`title` → `t(fullScreen ? "fullscreen.exit" : "fullscreen.enter")`.

`src/components/Windows/TitleBar.tsx`:
- `const t = useT();` y `<span ...>{title}</span>` → `{t(windowLabel(title))}` (importar `windowLabel` de `src/lists/windows`).
- `label="Minimizar"` → `label={t("titlebar.minimize")}`, `label={full ? "Restaurar" : "Maximizar"}` → `label={t(full ? "titlebar.restore" : "titlebar.maximize")}`, `label="Cerrar"` → `label={t("titlebar.close")}`.

`src/components/ShutdownScreen.tsx`:
- `Gracias por pasar` → `{t("shutdown.thanks")}`
- `⏻ Volver a encender` → `{t("shutdown.powerOn")}`

`src/components/dateTime.tsx`:
- `const t = useT();` y `date.toLocaleDateString("es-AR", {...})` → `date.toLocaleDateString(t("date.localeTag"), {...})`.

`src/components/Windows/MediaPlayer/index.tsx` (solo los aria-labels duplicados de titlebar, el resto en Task 5):
- `aria-label="Minimizar"` → `aria-label={t("titlebar.minimize")}`, `aria-label={full ? "Restaurar" : "Maximizar"}` → `aria-label={t(full ? "titlebar.restore" : "titlebar.maximize")}`, `aria-label="Cerrar"` → `aria-label={t("titlebar.close")}`.

- [ ] **Step 6: Correr tests, tsc y lint**

Run: `bun test`
Expected: PASS — incluye los 2 tests nuevos de `windows.test.ts` (16 en total).

Run: `bunx tsc --noEmit && bun run lint`
Expected: sin errores. Ojo con `windowLabel` ahora devolviendo `Bi`: cualquier uso viejo como `{windowLabel(x)}` sin `t()` crashea en runtime con `[object Object]` — `tsc` lo marca si el tipo no cierra; revisar los usos listados arriba.

- [ ] **Step 7: Checkpoint (sin commit)**

Archivos: los listados en **Files** más `src/i18n/es.ts`, `src/i18n/en.ts`.

---

### Task 5: Strings de ventanas al catálogo (Sobre mí, Curriculum, Proyectos, Terminal, Media Player)

**Files:**
- Modify: `src/i18n/es.ts`, `src/i18n/en.ts`, `src/components/Windows/SobreMi.tsx`, `src/components/Windows/Curriculum.tsx`, `src/components/Windows/WindowsContainer.tsx`, `src/components/Windows/Terminal.tsx`, `src/components/Windows/MediaPlayer/NavPanel.tsx`, `src/components/Windows/MediaPlayer/Controls.tsx`, `src/components/Windows/MediaPlayer/XpDialog.tsx`, `src/components/Windows/MediaPlayer/index.tsx`, `src/components/Windows/MediaPlayer/views/Library.tsx`, `src/components/Windows/MediaPlayer/views/MediaGuide.tsx`, `src/components/Windows/MediaPlayer/views/Visualizations.tsx`
- Create: `src/components/strings.test.tsx`

**Interfaces:**
- Consumes: `t()`, `fmt()`, catálogos; datos bilingües de la Task 3.
- Produces: claves `sobre.*`, `cv.*`, `projects.*`, `term.*`, `wmp.*` (lista completa abajo). Terminal reemplaza su paso intermedio de la Task 3 por `fmt(t("term.*"))`.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/components/strings.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import SobreMi from "src/components/Windows/SobreMi";
import MediaGuide from "src/components/Windows/MediaPlayer/views/MediaGuide";
import { I18nProvider } from "src/i18n";

function render(locale: Locale, node: JSX.Element): string {
  return renderToString(<I18nProvider locale={locale}>{node}</I18nProvider>);
}

describe("UI traducida", () => {
  test("Sobre mí en español", () => {
    const html = render("es", <SobreMi />);
    expect(html).toContain("Stack principal");
    expect(html).toContain("Ver proyectos");
    expect(html).toContain("English version");
  });

  test("Sobre mí en inglés", () => {
    const html = render("en", <SobreMi />);
    expect(html).toContain("Main stack");
    expect(html).toContain("See projects");
    expect(html).toContain("Versión en español");
  });

  test("Media Guide traducido", () => {
    expect(render("es", <MediaGuide />)).toContain("Guía multimedia");
    expect(render("en", <MediaGuide />)).toContain("Media guide");
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `bun test src/components/strings`
Expected: FAIL — "Main stack" no aparece (la UI está en español fijo).

- [ ] **Step 3: Agregar las claves de ventanas a los catálogos**

Agregar a `src/i18n/es.ts`:

```ts
  "sobre.now": "Ahora mismo: ",
  "sobre.stack": "Stack principal",
  "sobre.projects": "Ver proyectos",
  "sobre.cv": "Ver CV",
  "sobre.contact": "Contacto",
  "sobre.lang": "English version",
  "cv.intro": "CV en PDF, formato ATS-friendly. Elegí el idioma:",
  "cv.open": "Abrir ↗",
  "cv.note.a": "¿Preferís ver el trabajo antes que el PDF? Abrí",
  "cv.note.b": "en el escritorio.",
  "projects.featured": "★ Destacados",
  "projects.more": "Más proyectos",
  "projects.seeDetails": "Ver ficha",
  "projects.seeDetailsSite": "Ver ficha y sitio ↗",
  "projects.stack": "Stack",
  "projects.openSite": "Abrir sitio ↗",
  "projects.screenshot": "Captura de {title}",
  "term.banner": "portfolio.sh — escribí 'help' para ver los comandos disponibles.",
  "term.help": "COMANDOS\n  whoami              quién soy\n  ls                  lista los proyectos\n  ls destacados       solo los destacados\n  open <nombre>       abre un proyecto (ej: open goblin)\n  stack               tecnologías que uso\n  contact             cómo contactarme\n  cv                  abre el CV (ES / EN)\n  proyectos           abre la ventana de Proyectos\n  clear               limpia la pantalla\n  exit                cierra la terminal",
  "term.neofetch": "        .-.        ignacio@portfolio\n       |   |       -----------------\n       |___|       OS: PepOS XP 1.0\n      /     \\      Rol: Full Stack Dev\n     | () () |     Stack: TS · React · Bun\n      \\  ^  /      Base: Pilar, Argentina\n       |||||       Uptime: desde siempre\n       |||||",
  "term.sudo": "ignacio no está en el archivo de sudoers. Esto va a quedar registrado.",
  "term.useOpen": "Uso: open <nombre>. Probá 'ls' para ver la lista.",
  "term.noMatch": "No encontré ningún proyecto que matchee \"{q}\".",
  "term.openingUrl": "Abriendo {title} → {url}",
  "term.openingDetail": "Abriendo la ficha de {title}…",
  "term.empty": "No hay nada acá.",
  "term.noUrl": "(detalle en el escritorio)",
  "term.openCv": "Abriendo el CV (español / inglés)…",
  "term.openProjects": "Abriendo Proyectos…",
  "term.stackNow": "Ahora mismo: {current}",
  "term.contact": "¿Hablamos?",
  "term.notFound": "command not found: {cmd}",
  "term.helpHint": "Escribí 'help' para ver qué hay.",
  "term.inputAria": "Entrada de comandos de la terminal",
  "wmp.now": "Reproducción en curso",
  "wmp.guide": "Guía multimedia",
  "wmp.library": "Biblioteca multimedia",
  "wmp.copyCd": "Copiar desde CD",
  "wmp.radio": "Radio",
  "wmp.visualizations": "Visualizaciones",
  "wmp.cdMsg": "No se detectó ninguna unidad de CD.",
  "wmp.radioMsg": "Sin conexión a Internet.",
  "wmp.ok": "Aceptar",
  "wmp.progress": "Progreso",
  "wmp.prev": "Anterior",
  "wmp.play": "Reproducir",
  "wmp.pause": "Pausar",
  "wmp.next": "Siguiente",
  "wmp.stop": "Detener",
  "wmp.volume": "Volumen",
  "wmp.loading": "Cargando duración…",
  "wmp.guideText": "Reproductor de música ambientado en Windows XP, parte del portfolio de Ignacio Iglesias. Reproducí las pistas desde la Biblioteca, mirá el visualizador reaccionar al audio y cambiá el color de acento en Visualizaciones.",
  "wmp.chooseViz": "Elegir visualizador",
```

Agregar a `src/i18n/en.ts` (mismas claves):

```ts
  "sobre.now": "Right now: ",
  "sobre.stack": "Main stack",
  "sobre.projects": "See projects",
  "sobre.cv": "See resume",
  "sobre.contact": "Contact",
  "sobre.lang": "Versión en español",
  "cv.intro": "PDF resume, ATS-friendly. Pick a language:",
  "cv.open": "Open ↗",
  "cv.note.a": "Rather see the work than the PDF? Open",
  "cv.note.b": "on the desktop.",
  "projects.featured": "★ Featured",
  "projects.more": "More projects",
  "projects.seeDetails": "See details",
  "projects.seeDetailsSite": "See details & site ↗",
  "projects.stack": "Stack",
  "projects.openSite": "Open site ↗",
  "projects.screenshot": "Screenshot of {title}",
  "term.banner": "portfolio.sh — type 'help' to see the available commands.",
  "term.help": "COMMANDS\n  whoami              who I am\n  ls                  list the projects\n  ls destacados       featured only\n  open <name>         open a project (e.g. open goblin)\n  stack               technologies I use\n  contact             how to reach me\n  cv                  open the resume (ES / EN)\n  proyectos           open the Projects window\n  clear               clear the screen\n  exit                close the terminal",
  "term.neofetch": "        .-.        ignacio@portfolio\n       |   |       -----------------\n       |___|       OS: PepOS XP 1.0\n      /     \\      Role: Full Stack Dev\n     | () () |     Stack: TS · React · Bun\n      \\  ^  /      Location: Pilar, Argentina\n       |||||       Uptime: forever\n       |||||",
  "term.sudo": "ignacio is not in the sudoers file. This incident will be reported.",
  "term.useOpen": "Usage: open <name>. Try 'ls' to see the list.",
  "term.noMatch": "No project matches \"{q}\".",
  "term.openingUrl": "Opening {title} → {url}",
  "term.openingDetail": "Opening the {title} details…",
  "term.empty": "Nothing here.",
  "term.noUrl": "(details on the desktop)",
  "term.openCv": "Opening the resume (Spanish / English)…",
  "term.openProjects": "Opening Projects…",
  "term.stackNow": "Right now: {current}",
  "term.contact": "Let's talk?",
  "term.notFound": "command not found: {cmd}",
  "term.helpHint": "Type 'help' to see what's around.",
  "term.inputAria": "Terminal command input",
  "wmp.now": "Now playing",
  "wmp.guide": "Media guide",
  "wmp.library": "Media library",
  "wmp.copyCd": "Copy from CD",
  "wmp.radio": "Radio",
  "wmp.visualizations": "Visualizations",
  "wmp.cdMsg": "No CD drive was detected.",
  "wmp.radioMsg": "No connection to the Internet.",
  "wmp.ok": "OK",
  "wmp.progress": "Progress",
  "wmp.prev": "Previous",
  "wmp.play": "Play",
  "wmp.pause": "Pause",
  "wmp.next": "Next",
  "wmp.stop": "Stop",
  "wmp.volume": "Volume",
  "wmp.loading": "Loading duration…",
  "wmp.guideText": "A music player styled after Windows XP, part of Ignacio Iglesias's portfolio. Play tracks from the Library, watch the visualizer react to the audio and change the accent color in Visualizations.",
  "wmp.chooseViz": "Choose visualization",
```

(Nota: los comandos de la terminal —`whoami`, `ls`, `open`, `proyectos`…— no se traducen: son comandos. Solo se traduce su documentación y salida.)

- [ ] **Step 4: Traducir las ventanas**

`src/components/Windows/SobreMi.tsx` (ya tiene `t` de la Task 3):
- `{t(profile.current)}` con prefijo: reemplazar `<span className="font-semibold text-slate-800">Ahora mismo: </span>{current}` por `<span className="font-semibold text-slate-800">{t("sobre.now")}</span>{t(current)}`
- `Stack principal` → `{t("sobre.stack")}`
- `Ver proyectos` → `{t("sobre.projects")}`; `Ver CV` → `{t("sobre.cv")}`
- `Contacto` → `{t("sobre.contact")}`
- Agregar el link de idioma al final de la lista de contactos (con `useLocale()`):

```tsx
const { t, locale } = useI18n();
// ...
<li>
  <a
    href={locale === "es" ? "/en/" : "/"}
    className="xp-select flex items-center gap-2 rounded-sm px-1 py-0.5 text-sm"
  >
    🌐 {t("sobre.lang")}
  </a>
</li>
```

`src/components/Windows/Curriculum.tsx`:
- `CV en PDF, formato ATS-friendly. Elegí el idioma:` → `{t("cv.intro")}`
- `Abrir ↗` → `{t("cv.open")}`
- El párrafo final queda:

```tsx
<p className="mt-4 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
  {t("cv.note.a")} <span className="font-semibold">Proyectos</span>{" "}
  {t("cv.note.b")}
</p>
```

`src/components/Windows/WindowsContainer.tsx`:
- `<SectionLabel>★ Destacados</SectionLabel>` → `<SectionLabel>{t("projects.featured")}</SectionLabel>`
- `<SectionLabel>Más proyectos</SectionLabel>` → `{t("projects.more")}`
- En `FeaturedCard`: `Ver ficha{url ? " y sitio ↗" : ""}` → `{url ? t("projects.seeDetailsSite") : t("projects.seeDetails")}`
- En `ProjectDetail`: `<div ...>Stack</div>` → `{t("projects.stack")}`; `Abrir sitio ↗` → `{t("projects.openSite")}`; `aria-label={`Captura de ${title}`}` → `aria-label={fmt(t("projects.screenshot"), { title })}` (importar `fmt` de `src/i18n`); el `badge` → `{t(badge)}` en ambos usos (`FeaturedCard` y `ProjectDetail`).

`src/components/Windows/Terminal.tsx` (reemplaza el paso intermedio de la Task 3):
- `const { t } = useI18n();` (importar `useI18n` y `fmt`).
- `const BANNER = [...]` → se elimina la constante; el estado inicial se arma con `t("term.help")`... no: con `t("term.banner")`:

```tsx
const [lines, setLines] = useState<Line[]>(() => [
  { id: 0, kind: "output" as LineKind, text: t("term.banner") },
]);
```

y `idRef` arranca en `useRef(1)`.
- `HELP` y `NEOFETCH` se eliminan como constantes; se usan como `t("term.help").split("\n")` y `t("term.neofetch").split("\n")` dentro de los handlers `help`/`?` y `neofetch`.
- `whoami`: `...profile.bio.map((p) => push("output", t(p)))` (definitivo, ya no el intermedio).
- `stack`: última línea → `push("output", fmt(t("term.stackNow"), { current: t(profile.current) }))`.
- `contact`: `push("output", t("term.contact"))` y `push("accent", \`  ${t(l.title).padEnd(10)} ${l.href}\`)`.
- `cv`: salida → `t("term.openCv")`; `proyectos`: salida → `t("term.openProjects")`.
- `sudo`: salida → `t("term.sudo")`.
- `runLs`: `push("output", "No hay nada acá.")` → `t("term.empty")`; y el renglón del listado: `` `${p.featured ? "★" : " "} ${p.title.padEnd(22)} ${p.url ?? t("term.noUrl")}` ``.
- `runOpen`: `push("error", t("term.useOpen"))`; `push("error", fmt(t("term.noMatch"), { q: arg }))`; `push("output", fmt(t("term.openingUrl"), { title: project.title, url: project.url }))`; `push("output", fmt(t("term.openingDetail"), { title: project.title }))`.
- handler desconocido: `push("error", fmt(t("term.notFound"), { cmd: command }))` y `push("output", t("term.helpHint"))`.
- `aria-label="Entrada de comandos de la terminal"` → `aria-label={t("term.inputAria")}`.

`src/components/Windows/MediaPlayer/NavPanel.tsx`:
- `ITEMS` pasa a `{ kind, view?, dialog?, label: StringKey }` con claves: `wmp.now`, `wmp.guide`, `wmp.library`, `wmp.copyCd`, `wmp.radio`, `wmp.visualizations`. Renderizar `{t(item.label)}` y usar `item.view + item.dialog` como `key` (el label ya no es único-estable... mejor `key={item.kind === "view" ? item.view : item.dialog}`).

`src/components/Windows/MediaPlayer/index.tsx`:
- `title={dialog === "cd" ? "Copiar desde CD" : "Radio"}` → `title={t(dialog === "cd" ? "wmp.copyCd" : "wmp.radio")}`
- `message={dialog === "cd" ? "No se detectó ninguna unidad de CD." : "Sin conexión a Internet."}` → `message={t(dialog === "cd" ? "wmp.cdMsg" : "wmp.radioMsg")}`

`src/components/Windows/MediaPlayer/XpDialog.tsx`: `Aceptar` → `{t("wmp.ok")}`.

`src/components/Windows/MediaPlayer/Controls.tsx`:
- `aria-label="Progreso"` → `{t("wmp.progress")}`; `title={... "Cargando duración…"}` → `title={duration > 0 ? undefined : t("wmp.loading")}`
- `aria-label="Anterior"` → `{t("wmp.prev")}`; `aria-label={playing ? "Pausar" : "Reproducir"}` → `aria-label={t(playing ? "wmp.pause" : "wmp.play")}`; `aria-label="Siguiente"` → `{t("wmp.next")}`; `aria-label="Detener"` → `{t("wmp.stop")}`; `aria-label="Volumen"` → `{t("wmp.volume")}`.

`src/components/Windows/MediaPlayer/views/Library.tsx`: `Biblioteca multimedia` → `{t("wmp.library")}`.
`src/components/Windows/MediaPlayer/views/MediaGuide.tsx`: `Guía multimedia` → `{t("wmp.guide")}`; el párrafo → `{t("wmp.guideText")}`.
`src/components/Windows/MediaPlayer/views/Visualizations.tsx`: `Visualizaciones` → `{t("wmp.visualizations")}`; `aria-label="Elegir visualizador"` → `aria-label={t("wmp.chooseViz")}`.

(Nombres de visualizadores `v.name`/`v.hint`/`v.desc` de `viz/engine` quedan sin traducir: son nombres propios del efecto. Decisión registrada.)

- [ ] **Step 5: Correr tests, tsc y lint**

Run: `bun test`
Expected: PASS — ahora 19 tests.

Run: `bunx tsc --noEmit && bun run lint`
Expected: sin errores.

- [ ] **Step 6: Smoke manual**

Run: `bun run dev` y abrir `http://localhost:5173`.
Expected: escritorio idéntico al anterior, en español. Abrir Sobre mí, Proyectos, una ficha, Terminal (`help`), Media Player: sin textos rotos ni `[object Object]`.

- [ ] **Step 7: Checkpoint (sin commit)**

Archivos: los listados en **Files**.

---

### Task 6: Contenido indexable — `<SeoContent>`, `noscript` visible para crawlers y `h1` correcto

**Files:**
- Create: `src/components/SeoContent.tsx`, `src/components/SeoContent.test.tsx`
- Modify: `src/App.tsx`, `src/i18n/es.ts`, `src/i18n/en.ts`

**Interfaces:**
- Consumes: `t()`, `useLocale()`, datos bilingües.
- Produces: `<SeoContent />` (sin props) — siempre montado, clase `sr-only`. Claves `seo.content.*`. El `<h1>` de `App.tsx` queda como `Ignacio Iglesias`.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/components/SeoContent.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import SeoContent from "src/components/SeoContent";
import { I18nProvider } from "src/i18n";
import proyectsData from "src/lists/proyects.json";

const PROJECTS = proyectsData.proyects as Project[];

function render(locale: Locale): string {
  return renderToString(
    <I18nProvider locale={locale}>
      <SeoContent />
    </I18nProvider>
  );
}

describe("SeoContent", () => {
  test("incluye todos los proyectos en el HTML", () => {
    const html = render("es");
    for (const p of PROJECTS) expect(html, p.title).toContain(p.title);
  });

  test("incluye la bio completa en español", () => {
    const html = render("es");
    expect(html).toContain("Ingeniero full-stack senior");
    expect(html).toContain("hotel agéntico");
  });

  test("incluye la bio en inglés", () => {
    const html = render("en");
    expect(html).toContain("Senior full-stack engineer");
    expect(html).toContain("agentic hotel");
  });

  test("usa sr-only, nunca display:none", () => {
    const html = render("es");
    expect(html).toContain("sr-only");
    expect(html).not.toContain("display:none");
    expect(html).not.toContain("visibility:hidden");
  });

  test("linkea GitHub y LinkedIn", () => {
    const html = render("es");
    expect(html).toContain("https://github.com/pepo2405");
    expect(html).toContain("https://www.linkedin.com/in/ignacioniglesias2405/");
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `bun test src/components/SeoContent`
Expected: FAIL — no existe `src/components/SeoContent.tsx`.

- [ ] **Step 3: Agregar las claves de contenido a los catálogos**

`src/i18n/es.ts`:

```ts
  "seo.content.heading": "Ignacio Iglesias — perfil y proyectos",
  "seo.content.projects": "Proyectos",
```

`src/i18n/en.ts`:

```ts
  "seo.content.heading": "Ignacio Iglesias — profile and projects",
  "seo.content.projects": "Projects",
```

- [ ] **Step 4: Implementar `src/components/SeoContent.tsx`**

```tsx
import { useI18n } from "src/i18n";
import profile from "src/lists/profile.json";
import proyectsData from "src/lists/proyects.json";

const PROJECTS = proyectsData.proyects as Project[];

/**
 * Bloque indexable siempre montado, con el patrón sr-only de Tailwind
 * (clip/1px): lo leen lectores de pantalla y crawlers, pero no ocupa lugar en
 * el layout — el escritorio queda visualmente idéntico.
 *
 * El texto es exactamente el de las ventanas del escritorio (Sobre mí,
 * Proyectos y las fichas): mismo contenido en dos capas, no contenido oculto
 * engañoso. Por eso NO usar display:none acá.
 */
export default function SeoContent() {
  const { t, locale } = useI18n();
  const displayName = (p: Project) =>
    locale === "en" ? p.titleEn ?? p.title : p.title;

  return (
    <section className="sr-only">
      <h2>{t("seo.content.heading")}</h2>
      <p>
        {profile.name} — {profile.role}
      </p>
      <p>{t(profile.tagline)}</p>
      <p>{profile.location}</p>
      {profile.bio.map((paragraph) => (
        <p key={paragraph.en}>{t(paragraph)}</p>
      ))}
      <p>{t(profile.current)}</p>

      <h3>{t("seo.content.projects")}</h3>
      <ul>
        {PROJECTS.map((p) => (
          <li key={p.title}>
            <strong>{displayName(p)}</strong>
            {p.description && <> — {t(p.description)}</>}
            {p.details && (
              <ul>
                {p.details.map((d) => (
                  <li key={d.en}>{t(d)}</li>
                ))}
              </ul>
            )}
            {p.stack && <p>{p.stack.join(", ")}</p>}
            {p.url && <a href={p.url}>{p.url}</a>}
          </li>
        ))}
      </ul>

      <h3>{t("sobre.contact")}</h3>
      <ul>
        {profile.links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>
              {t(link.title)}: {link.href}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: Montarlo en `App.tsx` y corregir el `h1`**

En `src/App.tsx`, dentro de `<main>` (después de `<WindowsContainer />` y antes del `</main>`), agregar:

```tsx
<SeoContent />
```

con `import SeoContent from "src/components/SeoContent";`.

Y corregir el `h1` (el nombre estaba al revés):

```tsx
        >
          Ignacio Iglesias
        </h1>
```

- [ ] **Step 6: Correr tests, tsc y lint**

Run: `bun test`
Expected: PASS — 24 tests.

Run: `bunx tsc --noEmit && bun run lint`
Expected: sin errores.

- [ ] **Step 7: Checkpoint (sin commit)**

Archivos: `src/components/SeoContent.tsx`, `src/components/SeoContent.test.tsx`, `src/App.tsx`, `src/i18n/es.ts`, `src/i18n/en.ts`.

---

### Task 7: Metadata por ruta, JSON-LD y builders de HTML (`src/seo/build.ts`)

**Files:**
- Create: `src/seo/build.ts`, `src/seo/build.test.ts`
- Modify: `src/i18n/es.ts`, `src/i18n/en.ts`

**Interfaces:**
- Consumes: `pick`, `fmt` de `src/i18n/text`; `ROUTES`, `alternatePath`, `BASE_URL`, `slugify` de `src/routes`; datos bilingües.
- Produces (todo en `src/seo/build.ts`, funciones puras — sin React):
  - `type PageParts = { lang: string; head: string; app: string; noscript: string }`
  - `pageMeta(route: Route): { title: string; description: string }`
  - `headHtml(route: Route): string` — title, description, canonical, OG, Twitter, hreflang, JSON-LD.
  - `jsonLd(route: Route): Record<string, unknown>[]`
  - `noscriptHtml(locale: Locale): string`
  - `sitemapXml(): string`
  - `inject(template: string, parts: PageParts): string`
  - `validatePages(pages: { route: Route; html: string }[]): string[]`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/seo/build.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `bun test src/seo`
Expected: FAIL — no existe `src/seo/build.ts`.

- [ ] **Step 3: Agregar las claves SEO a los catálogos**

`src/i18n/es.ts`:

```ts
  "seo.home.title": "Ignacio Iglesias — Desarrollador Full Stack",
  "seo.home.description": "Portafolio de Ignacio Iglesias, desarrollador full stack senior en Buenos Aires. Productos web, mobile y de escritorio con TypeScript, React, Next.js, Rust y Tauri.",
  "seo.project.titleTemplate": "{title} — Ignacio Iglesias",
  "seo.siteName": "Ignacio Iglesias — Portafolio",
  "seo.person.role": "Desarrollador Full Stack",
  "seo.noscript.intro": "Este portafolio necesita JavaScript. Mientras tanto, un resumen:",
  "seo.noscript.contact": "Contacto",
```

`src/i18n/en.ts`:

```ts
  "seo.home.title": "Ignacio Iglesias — Senior Full-Stack Engineer",
  "seo.home.description": "Portfolio of Ignacio Iglesias, senior full-stack engineer based in Buenos Aires. Web, mobile and desktop products built with TypeScript, React, Next.js, Rust and Tauri.",
  "seo.project.titleTemplate": "{title} — Ignacio Iglesias",
  "seo.siteName": "Ignacio Iglesias — Portfolio",
  "seo.person.role": "Senior Full-Stack Engineer",
  "seo.noscript.intro": "This portfolio needs JavaScript. In the meantime, here's the short version:",
  "seo.noscript.contact": "Contact",
```

- [ ] **Step 4: Implementar `src/seo/build.ts`**

```ts
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
    const link = p.url ? ` (<a href="${p.url}">${p.url}</a>)` : "";
    return `<li><strong>${esc(displayName(p))}</strong>${esc(desc)}${link}</li>`;
  }).join("");

  const links = profile.links
    .map(
      (l) =>
        `<a href="${l.href}">${esc(pick(l.title, locale))}</a>`
    )
    .join(" · ");

  return [
    "<noscript>",
    `<p>${esc(pick("seo.noscript.intro", locale))}</p>`,
    `<p><strong>${esc(profile.name)}</strong> — ${esc(profile.role)} · ${esc(profile.location)}</p>`,
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
 * Corta el build si el SEO quedó roto: URLs relativas en metadatos, canonical
 * faltante, JSON-LD inválido o placeholders sin reemplazar.
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
  }
  return errors;
}
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `bun test src/seo`
Expected: PASS — 12 tests.

Run: `bunx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 6: Checkpoint (sin commit)**

Archivos: `src/seo/build.ts`, `src/seo/build.test.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`.

---

### Task 8: Hidratación, estado por ruta y compatibilidad SSR

**Files:**
- Modify: `src/main.tsx`, `src/context/WindowsContext.tsx`, `src/App.tsx`, `src/hooks/useDesktopIcons.ts`, `src/components/dateTime.tsx`
- Create: `src/context/WindowsContext.test.tsx`

**Interfaces:**
- Consumes: `parseRoute` de la Task 2, `I18nProvider` de la Task 1.
- Produces:
  - `WindowsProvider({ initialWindows?: string[], children })` — siembra `visibleItems`/`minimizedItems` (default `["Sobre mí"]`).
  - `src/main.tsx` decide `hydrateRoot` (prod) o `createRoot` (dev) según `import.meta.env.DEV`.
  - Todo render de SSR es determinístico respecto del primer render del cliente (sin `localStorage` ni `window` durante el render).

- [ ] **Step 1: Escribir el test que falla**

Crear `src/context/WindowsContext.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { WindowsProvider } from "src/context/WindowsContext";
import useWindow from "src/hooks/useWindow";

const Probe = () => {
  const { visibleItems } = useWindow();
  return <span data-open={Object.entries(visibleItems).filter(([, v]) => v).map(([k]) => k).join(",")} />;
};

describe("WindowsProvider", () => {
  test("siembra las ventanas iniciales de la ruta", () => {
    const html = renderToString(
      <WindowsProvider initialWindows={["Proyectos", "Gym Admin"]}>
        <Probe />
      </WindowsProvider>
    );
    expect(html).toContain('data-open="Proyectos,Gym Admin"');
  });

  test("default: Sobre mí abierto", () => {
    const html = renderToString(
      <WindowsProvider>
        <Probe />
      </WindowsProvider>
    );
    expect(html).toContain('data-open="Sobre mí"');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `bun test src/context`
Expected: FAIL — `WindowsProvider` no acepta `initialWindows` y siempre abre "Sobre mí"... (técnicamente el 2do test pasa; el primero falla con `data-open="Sobre mí"`).

- [ ] **Step 3: `WindowsProvider` con seed**

En `src/context/WindowsContext.tsx`, agregar al tipo exportado la prop y reemplazar los dos `useState` fijos:

```tsx
interface Props {
  children: ReactNode;
  /** Ventanas abiertas al arrancar (vienen de la URL). Default: ["Sobre mí"]. */
  initialWindows?: string[];
}

function flagsFor(titles: string[]): Flags {
  const flags: Flags = {};
  for (const title of titles) flags[title] = true;
  return flags;
}

export const WindowsProvider: FC<Props> = ({
  children,
  initialWindows = ["Sobre mí"],
}) => {
  // El seed viene de la URL: /proyectos/<slug>/ arranca con "Proyectos" + la
  // ficha abierta; el resto del comportamiento no cambia.
  const [visibleItems, setVisibleItems] = useState<Flags>(() =>
    flagsFor(initialWindows)
  );
  // Ojo: acá "minimized" significa "está abierta" (vive en la taskbar), no minimizada.
  const [minimizedItems, setMinimizedItems] = useState<Flags>(() =>
    flagsFor(initialWindows)
  );
```

(El comentario viejo sobre "Sobre mí arranca abierto" se reemplaza por el nuevo.)

- [ ] **Step 4: Hacer el render SSR-safe**

Tres lugares leen browser durante el render y romperían la hidratación (o el `renderToString` del prerender):

1. `src/App.tsx` — el hint lee `localStorage` en el inicializador del state. Reemplazar:

```tsx
  // El hint depende de localStorage: se resuelve después del mount para que el
  // primer render del cliente coincida con el HTML prerenderizado.
  const [hintSeen, setHintSeen] = useState(false);
  useEffect(() => {
    if (readHintSeen()) setHintSeen(true);
  }, []);
```

2. `src/hooks/useDesktopIcons.ts` — `useState(hydrate)` lee `localStorage` en el render. Reemplazar el state por el layout default y aplicar el guardado en un effect, sin pisar el storage en el primer ciclo:

```tsx
  const [layout, setLayout] = useState<Layout>(defaultLayout);

  // localStorage se lee después del mount: el primer render debe coincidir con
  // el HTML prerenderizado (hidratación).
  useEffect(() => {
    setLayout(hydrate());
  }, []);

  // Persistir en cada cambio de layout (salvo el primero: antes de aplicar el
  // layout guardado no hay nada nuevo que persistir).
  const persisted = useRef(false);
  useEffect(() => {
    if (!persisted.current) {
      persisted.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // ignore
    }
  }, [layout]);
```

(`useRef` ya está importado en el archivo; se reemplaza el effect de persistencia viejo.)

3. `src/components/dateTime.tsx` — `new Date()` en el render: el HTML prerenderizado muestra la hora del build. En vez de esconder el reloj, se marca el nodo para que React acepte la diferencia:

```tsx
    <p
      title={fechaLarga}
      suppressHydrationWarning
      className="cursor-default font-bold whitespace-nowrap"
      style={{ filter: "drop-shadow(0px 0px 1px black)" }}
    >
```

- [ ] **Step 5: Hidratar desde la URL**

Reemplazar `src/main.tsx` completo:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { I18nProvider } from "src/i18n";
import { WindowsProvider } from "src/context/WindowsContext";
import { parseRoute } from "src/routes";
import App from "src/App";
import "src/styles/globals.css";

const { locale, initialWindows } = parseRoute(window.location.pathname);

const app = (
  <React.StrictMode>
    <I18nProvider locale={locale}>
      <WindowsProvider initialWindows={initialWindows}>
        <App />
      </WindowsProvider>
    </I18nProvider>
  </React.StrictMode>
);

const root = document.getElementById("root")!;
// En dev no hay HTML prerenderizado: render normal. En prod se hidrata el
// markup que generó scripts/prerender.tsx.
if (import.meta.env.DEV) {
  ReactDOM.createRoot(root).render(app);
} else {
  ReactDOM.hydrateRoot(root, app);
}
```

Arriba de todo en `types/standard.d.ts` agregar `/// <reference types="vite/client" />`
(sin eso, `import.meta.env` no tiene tipos y `tsc` falla).

**Plan B documentado (de la spec):** si aparece un warning de hidratación terco
que no se resuelve ajustando el render, se reemplaza el `hydrateRoot` por
`ReactDOM.createRoot(root).render(app)` a secas. El resultado SEO es idéntico
(el HTML prerenderizado sigue siendo lo que crawlean); solo puede haber un flash
visual mínimo al cargar.

- [ ] **Step 6: Correr tests, tsc y lint**

Run: `bun test`
Expected: PASS — 26 tests.

Run: `bunx tsc --noEmit && bun run lint`
Expected: sin errores.

- [ ] **Step 7: Smoke manual (dev)**

Run: `bun run dev` → `http://localhost:5173` y `http://localhost:5173/proyectos/gym-admin/`.
Expected: en la segunda URL el escritorio arranca con "Proyectos" y la ficha de Gym Admin abiertas. Consola sin errores ni warnings.

- [ ] **Step 8: Checkpoint (sin commit)**

Archivos: `src/main.tsx`, `src/context/WindowsContext.tsx`, `src/context/WindowsContext.test.tsx`, `src/App.tsx`, `src/hooks/useDesktopIcons.ts`, `src/components/dateTime.tsx`.

---

### Task 9: Template, prerender por ruta, sitemap y robots

**Files:**
- Modify: `index.html`, `package.json`, `tsconfig.json`
- Create: `scripts/prerender.tsx`, `public/robots.txt`

**Interfaces:**
- Consumes: todo de `src/seo/build.ts` (Task 7), `ROUTES`/`parseRoute` (Task 2), providers (Tasks 1 y 8).
- Produces: `bun run build` deja en `dist/` un `index.html` por ruta (20), `sitemap.xml` y `robots.txt`. `bun run prerender` corre el script solo (sobre un `dist/` ya buildeado).

- [ ] **Step 1: Convertir `index.html` en template**

Reemplazar el `<head>` de `index.html` por (se van los metadatos duros: ahora los genera `headHtml` por ruta):

```html
  <head>
    <meta charset="UTF-8" />
    <link rel="shortcut icon" href="/kirby.webp" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="author" content="Ignacio Iglesias" />
    <meta name="theme-color" content="#235cdc" />
    <link rel="preload" as="image" href="/static/background.webp" fetchpriority="high" />
    <!--SEO_HEAD-->
  </head>
```

Cambiar `<html lang="es">` por `<html lang="{{SEO_LANG}}">`.

Reemplazar el `<noscript>` completo del body por el marcador y envolver el root:

```html
  <body>
    <div id="root"><!--SEO_APP--></div>
    <!--SEO_NOSCRIPT-->
    <script type="module" src="/src/main.tsx"></script>
  </body>
```

- [ ] **Step 2: Escribir `scripts/prerender.tsx`**

```tsx
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import App from "src/App";
import { WindowsProvider } from "src/context/WindowsContext";
import { I18nProvider } from "src/i18n";
import { parseRoute, ROUTES } from "src/routes";
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
  // Mismo árbol que src/main.tsx: el markup debe coincidir para hidratar.
  const app = renderToString(
    <React.StrictMode>
      <I18nProvider locale={locale}>
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
```

- [ ] **Step 3: `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://www.pepo.ar/sitemap.xml
```

- [ ] **Step 4: Encadenar el build**

`package.json` — scripts:

```json
"build": "tsc && vite build && bun run prerender",
"prerender": "bun scripts/prerender.tsx",
"test": "bun test",
```

`tsconfig.json` — `"include": ["src", "types", "scripts"]` (que `tsc` también typecheckee el prerender).

- [ ] **Step 5: Build completo y verificación del output**

Run: `bun run build`
Expected: termina con `prerender: 20 páginas + sitemap.xml` y exit 0.

Run: `find dist -name index.html | sort`
Expected: 20 archivos: `dist/index.html`, `dist/en/index.html`, `dist/proyectos/<slug>/index.html` (9) y `dist/en/proyectos/<slug>/index.html` (9).

Run: `grep -c "<loc>" dist/sitemap.xml && grep -o '<title>[^<]*' dist/proyectos/goblin/index.html`
Expected: `20` y `<title>Goblin — Ignacio Iglesias</title>`.

Run: `grep -o 'property="og:image" content="[^"]*"' dist/en/index.html && grep -o '<html lang="[a-z]*"' dist/en/index.html`
Expected: `content="https://www.pepo.ar/static/og-cover.png"` y `<html lang="en"`.

Run: `grep -c "Ingeniero full-stack senior" dist/index.html`
Expected: `2` o más (una en `<SeoContent>`, otra en `<noscript>`).

- [ ] **Step 6: Correr tests**

Run: `bun test`
Expected: PASS — 26 tests (los de `src/seo/build` ya cubren `inject`/`validatePages`/`sitemapXml`).

- [ ] **Step 7: Checkpoint (sin commit)**

Archivos: `index.html`, `scripts/prerender.tsx`, `public/robots.txt`, `package.json`, `tsconfig.json`.

---

### Task 10: Assets — OG card, apple-touch-icon y logo del Start sin blur

**Files:**
- Create: `scripts/og-cover.ts`, `public/static/og-cover.png` (generado), `public/static/icons/xpFlag.svg`, `public/apple-touch-icon.png` (generado)
- Modify: `package.json` (script `og-cover`, devDep `sharp`), `src/images.ts`, `index.html` (link apple-touch-icon)

**Interfaces:**
- Consumes: `sharp` (devDep).
- Produces: `public/static/og-cover.png` (1200×630, el asset que referencian `headHtml` y el JSON-LD desde la Task 7).

- [ ] **Step 1: Instalar sharp y escribir el generador**

Run: `bun add -d sharp`

Crear `scripts/og-cover.ts`:

```ts
/**
 * Genera la OG card (1200×630) del sitio. Se corre UNA VEZ y el PNG queda
 * commiteado en public/static/og-cover.png — no se regenera en cada build.
 * Regenerar: bun run og-cover
 */
import sharp from "sharp";

const SVG = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1d4bb0"/>
      <stop offset="55%" stop-color="#3b6fd4"/>
      <stop offset="100%" stop-color="#0f2f80"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect x="80" y="120" width="1040" height="390" rx="10" fill="#ece9d8" stroke="#0f2f80" stroke-width="4"/>
  <rect x="80" y="120" width="1040" height="64" rx="10" fill="#235cdc"/>
  <rect x="80" y="160" width="1040" height="24" fill="#235cdc"/>
  <text x="112" y="163" font-family="Tahoma, Verdana, sans-serif" font-size="30" font-weight="bold" fill="#ffffff">Ignacio Iglesias</text>
  <text x="112" y="290" font-family="Tahoma, Verdana, sans-serif" font-size="56" font-weight="bold" fill="#111827">Desarrollador Full Stack</text>
  <text x="112" y="360" font-family="Tahoma, Verdana, sans-serif" font-size="34" fill="#374151">Web · Mobile · Desktop nativo · IA</text>
  <text x="112" y="450" font-family="Tahoma, Verdana, sans-serif" font-size="28" fill="#235cdc">www.pepo.ar</text>
</svg>`;

await sharp(Buffer.from(SVG)).png().toFile("public/static/og-cover.png");
console.log("og-cover: public/static/og-cover.png (1200×630)");
```

En `package.json` agregar: `"og-cover": "bun scripts/og-cover.ts"`.

- [ ] **Step 2: Generar la OG card**

Run: `bun run og-cover && sips -g pixelWidth -g pixelHeight public/static/og-cover.png`
Expected: `pixelWidth: 1200`, `pixelHeight: 630`.

- [ ] **Step 3: Logo del Start nítido (SVG)**

Crear `public/static/icons/xpFlag.svg` (la bandera de XP vectorial; reemplaza al `windowsXpLogo.webp` de 46px que Lighthouse marca como "serves images with low resolution"):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <g transform="skewY(-6)">
    <path d="M2 4h9v8H2z" fill="#f65314"/>
    <path d="M12 3h9v8h-9z" fill="#7cbb00"/>
    <path d="M2 13h9v8H2z" fill="#00a1f1"/>
    <path d="M12 12h9v8h-9z" fill="#ffbb00"/>
  </g>
</svg>
```

En `src/images.ts`, reemplazar la línea del logo:

```ts
export const xpLogoIcon = "/static/icons/xpFlag.svg";
```

- [ ] **Step 4: apple-touch-icon**

Run: `sips -z 180 180 --out public/apple-touch-icon.png public/kirby.webp`
Expected: `public/apple-touch-icon.png` creado (180×180).

En `index.html`, junto al favicon:

```html
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

(Nota: se usa PNG en vez de `.ico` porque todos los navegadores actuales aceptan PNG/SVG; no se agrega un generador de `.ico`. Kirby sigue siendo el favicon.)

- [ ] **Step 5: Verificar**

Run: `bun run build`
Expected: build OK (20 páginas). El prerender no valida assets, así que chequear a mano:

Run: `ls -la dist/static/og-cover.png dist/apple-touch-icon.png dist/static/icons/xpFlag.svg`
Expected: los 3 archivos presentes en `dist/`.

Run: `grep -o 'static/og-cover.png' dist/index.html | head -1`
Expected: `https://www.pepo.ar/static/og-cover.png` (con dominio).

- [ ] **Step 6: Checkpoint (sin commit)**

Archivos: `scripts/og-cover.ts`, `public/static/og-cover.png`, `public/static/icons/xpFlag.svg`, `public/apple-touch-icon.png`, `package.json`, `bun.lock`, `src/images.ts`, `index.html`.

---

### Task 11: Verificación final

**Files:**
- Modify: `README.md` (sección "SEO" breve)

- [ ] **Step 1: Suite completa**

Run: `bun test && bunx tsc --noEmit && bun run lint && bun run build`
Expected: todo verde; el build imprime `prerender: 20 páginas + sitemap.xml`.

- [ ] **Step 2: Preview y smoke de ambas rutas**

Run: `bun run preview` → `http://localhost:4173`

Chequear a mano (con la consola del navegador abierta):
- `/` → escritorio idéntico al actual, "Sobre mí" abierto, sin errores ni `Warning: Text content did not match` en consola.
- `/en/` → mismo escritorio en inglés (Start, About me, Projects…).
- `/proyectos/huesped-plus/` → arranca con Proyectos + la ficha de Huésped+.
- `/en/proyectos/lector-de-huellas/` → idem en inglés ("Fingerprint Reader" en el `<title>` de view-source).
- View-source de `/proyectos/goblin/`: `<title>Goblin — Ignacio Iglesias</title>`, canonical absoluto, `og:image` absoluta, JSON-LD con `CreativeWork`, `<noscript>` con la lista de proyectos.
- Doble clic, arrastre de íconos, terminal y Media Player siguen funcionando.

- [ ] **Step 3: Lighthouse sobre el build prerenderizado**

Run: `bunx lighthouse http://localhost:4173/proyectos/gym-admin/ --only-categories=seo,performance,accessibility --output=json --output-path=/tmp/lh.json --chrome-flags="--headless" --quiet && jq '.categories | with_entries(.value = (.value.score * 100 | round))' /tmp/lh.json`
Expected: seo 100, accessibility 100, performance ≥ 90.

Repetir sobre `/en/`.
Expected: lo mismo.

- [ ] **Step 4: Documentar en el README**

Agregar al final del README:

```markdown
## SEO y bilingüe

- Todo el texto traducible vive en `src/i18n/es.ts` + `src/i18n/en.ts` (y los
  campos `{ es, en }` de los JSON de `src/lists/`). `tsc` falla si falta una
  traducción.
- `bun run build` además prerenderiza las 20 rutas (`scripts/prerender.tsx`),
  genera `sitemap.xml` y valida que la metadata no se haya roto. Si la
  validación falla, el build falla.
- La OG card se regenera con `bun run og-cover` (el PNG queda commiteado).
- Chequeo post-deploy: Rich Results Test de Google y el validador de OG de
  LinkedIn sobre `https://www.pepo.ar/`.
```

- [ ] **Step 5: Checklist post-deploy (manual, después de publicar en Vercel)**

- [ ] `https://www.pepo.ar/robots.txt` responde 200 y linkea el sitemap.
- [ ] `https://www.pepo.ar/sitemap.xml` responde 200 con 20 `<loc>`.
- [ ] Rich Results Test de Google sobre `https://www.pepo.ar/`: `Person` sin errores.
- [ ] Validador de OG de LinkedIn y card validator de X sobre `https://www.pepo.ar/`: preview con imagen.
- [ ] `site:www.pepo.ar` en Google a los días: ver qué indexó.

- [ ] **Step 6: Checkpoint final (sin commit)**

Archivos: `README.md`.


