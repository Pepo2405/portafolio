# Migración Next.js 13 → React + Vite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el portfolio de Next.js 13 (Pages Router) a React + Vite como SPA estática, manteniendo UI y comportamiento idénticos.

**Architecture:** Se reemplaza el tooling de Next por Vite + `@vitejs/plugin-react`. El entrypoint pasa de `pages/` a `index.html` + `src/main.tsx` + `src/App.tsx`. Todos los assets (`/static/...`), Tailwind, PostCSS, context, hooks y componentes se mantienen sin cambios de lógica. El alias `src/*` se preserva vía `vite-tsconfig-paths` para no tocar imports.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind 3, bun (package manager). Deploy: Vercel estático.

## Global Constraints

- Package manager: **bun** (`bun install`, `bun run <script>`). Lockfile `bun.lock`.
- `engines.node`: **"22.x"** (se mantiene, requerido por Vercel).
- **No cambiar** `tailwind.config.js` ni `postcss.config.js` (siguen como CommonJS → NO agregar `"type": "module"` a package.json).
- **No** refactorizar lógica de componentes, context ni hooks. Migración pura.
- Preservar el alias de imports `src/*` → `./src/*`.
- Assets se siguen sirviendo desde `public/static/...` en rutas absolutas `/static/...`.

---

## File Structure

- `index.html` (nuevo, raíz) — HTML entrypoint, título + favicon
- `src/main.tsx` (nuevo) — monta React con `WindowsProvider`
- `src/App.tsx` (nuevo) — contenido de `pages/app.tsx` sin `<Head>`
- `vite.config.ts` (nuevo) — config Vite + plugin React + tsconfig-paths
- `tsconfig.node.json` (nuevo) — config TS para `vite.config.ts`
- `tsconfig.json` (modificar) — target moderno, `jsx: react-jsx`, `moduleResolution: bundler`
- `package.json` (modificar) — deps y scripts
- `.eslintrc.json` (modificar) — config React/TS sin `eslint-config-next`
- `src/components/TaskBar.tsx` (modificar) — `next/image` → `<img>`, quitar import muerto de `crypto`
- **Eliminar:** `src/pages/` (todo), `next.config.js`, `next-env.d.ts`, `.next/`, `pnpm-lock.yaml`, `package-lock.json`

---

## Task 1: Tooling Vite y configuración de TypeScript

**Files:**
- Modify: `package.json`
- Create: `vite.config.ts`
- Modify: `tsconfig.json`
- Create: `tsconfig.node.json`

**Interfaces:**
- Produces: alias `src/*` resuelto por Vite; scripts `dev`/`build`/`preview`/`lint`; deps de Vite instaladas para las tareas siguientes.

- [ ] **Step 1: Reemplazar `package.json`**

Contenido completo:

```json
{
  "name": "pepo",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": "22.x"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "dayjs": "^1.11.10",
    "gsap": "^3.12.2",
    "howler": "^2.2.3",
    "re-resizable": "^6.9.9",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-draggable": "^4.4.5",
    "react-frame-component": "^5.2.6",
    "react-icons": "^4.8.0"
  },
  "devDependencies": {
    "@types/howler": "^2.2.7",
    "@types/node": "18.15.11",
    "@types/react": "18.0.37",
    "@types/react-dom": "18.0.11",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "10.4.14",
    "eslint": "8.38.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "postcss": "8.4.22",
    "tailwindcss": "3.3.1",
    "typescript": "5.0.4",
    "vite": "^5.4.10",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
```

Nota: se quitan `next` y `eslint-config-next`. NO se agrega `"type": "module"` (rompería `postcss.config.js`/`tailwind.config.js`, que son CommonJS).

- [ ] **Step 2: Crear `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
})
```

- [ ] **Step 3: Reemplazar `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "allowJs": true,
    "baseUrl": ".",
    "paths": {
      "src/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Crear `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Instalar dependencias con bun**

Run: `bun install`
Expected: instala sin errores y genera `bun.lock`. (Todavía NO corras `build`: `src/pages/*` aún importa `next/*` y fallaría — se resuelve en la Task 2.)

- [ ] **Step 6: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json bun.lock
git commit -m "chore: tooling Vite + configs TS (migración Next→Vite)"
```

---

## Task 2: Entrypoint SPA y migración de componentes

**Files:**
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Modify: `src/components/TaskBar.tsx`
- Delete: `src/pages/` (todo el directorio)

**Interfaces:**
- Consumes: `WindowsProvider` de `src/context/WindowsContext`; alias `src/*` (Task 1).
- Produces: app renderizable con `vite dev`/`vite build`.

- [ ] **Step 1: Crear `index.html` en la raíz**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="shortcut icon" href="/kirby.webp" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Peportfolio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Crear `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WindowsProvider } from 'src/context/WindowsContext'
import App from 'src/App'
import 'src/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WindowsProvider>
      <App />
    </WindowsProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 3: Crear `src/App.tsx`**

Es el contenido actual de `src/pages/app.tsx` **sin** el `import Head`, sin `<Head>...</Head>` y sin el fragment `<>...</>` externo (ahora devuelve el `<div>` directo):

```tsx
import Amongus from "src/components/Amongus";
import Proyects from "src/components/Folder";
import FullScreenButton from "src/components/FullScreenButton";
import Socials from "src/components/Socials";
import TaskBar from "src/components/TaskBar";
import Techs from "src/components/Techs";
import WindowsContainer from "src/components/Windows/WindowsContainer";
import { BG } from "src/images";

export default function App() {
  return (
    <div
      style={{ background: BG, backgroundSize: "cover" }}
      className="h-screen w-screen overflow-hidden flex flex-col relative"
    >
      <section className="folderIcons !overflow-hidden ">
        <a href="/static/Cv Ignacio Iglesias.pdf" target="_blank">
          <div className="bg-white-400/50 w-24 h-24 pt-2 px-8 flex-col text-center flex hover:bg-blue-500/50 items-center  justify-end text-black/80">
            <div
              className="grow w-11"
              style={{
                backgroundImage: "url(/static/icons/chrome.svg)",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
            <span className="font-bold text-sm text-white shadowText">
              Curriculum
            </span>
          </div>
        </a>
        <Amongus />
        <Proyects title="Proyectos" />
        <Socials title="Redes sociales" />
        <Techs title="Tecnologías" />
      </section>
      <main>
        <h2
          unselectable="on"
          className="select-none 
             md:text-4xl shadowText 
             absolute top-1/2 left-1/2
             -translate-x-1/2
             -translate-y-1/2
             whitespace-nowrap opacity-80 
             text-white text-2xl
             "
        >
          Iglesias Ignacio
        </h2>
        <FullScreenButton />
        <WindowsContainer />
      </main>
      <TaskBar />
    </div>
  );
}
```

- [ ] **Step 4: Eliminar el directorio `src/pages/`**

```bash
git rm -r src/pages
```

Expected: se eliminan `_app.tsx`, `_document.tsx`, `index.tsx`, `app.tsx` y `api/hello.ts`.

- [ ] **Step 5: Corregir `src/components/TaskBar.tsx` — imports**

Eliminar estas dos líneas (la 6 y la 8 del archivo original):

```tsx
import Image from "next/image";
```

```tsx
import { randomBytes } from "crypto";
```

(`randomBytes` no se usa: `uniqueID()` usa `Math.random()`. `next/image` se reemplaza abajo.)

- [ ] **Step 6: Corregir `src/components/TaskBar.tsx` — reemplazar `<Image>` por `<img>`**

Hay 3 usos. Reemplazar cada apertura `<Image` por `<img` y cada cierre correspondiente. Los props (`src`, `alt`, `className`, `width`, `height`, `title`, `onClick`) son válidos en `<img>`. Resultado de cada uno:

Uso 1 (dentro del `.map` de `list`):
```tsx
<img
  alt=""
  width={20}
  height={20}
  src={icon}
  className="mx-2"
/>
```

Uso 2 (botón Inicio):
```tsx
<img
  width={20}
  height={20}
  alt="xpIcon"
  src={xpLogoIcon}
  className="shadow-xl min-w-fit"
/>
```

Uso 3 (dentro del `.map` de `windows`):
```tsx
<img
  title={title}
  onClick={handleMaximize as any}
  alt=""
  width={20}
  height={20}
  src={icon}
/>
```

- [ ] **Step 7: Build de verificación (typecheck + bundle)**

Run: `bun run build`
Expected: `tsc` pasa sin errores y `vite build` genera `dist/`. Si `tsc` reporta un error preexistente de tipos, corregí sólo lo mínimo para compilar (sin cambiar comportamiento) y anotalo.

- [ ] **Step 8: Verificación visual en dev**

Run: `bun run dev`
Abrir la URL local. Verificar que la app se ve **idéntica**: fondo XP, íconos de escritorio (Curriculum, Amongus, Proyectos, Redes sociales, Tecnologías), texto "Iglesias Ignacio" centrado, taskbar con reloj y menú Inicio. Abrir una ventana (ej. Proyectos), moverla y redimensionarla. Confirmar que no hay imports de `next/*` fallando en consola.

- [ ] **Step 9: Commit**

```bash
git add index.html src/main.tsx src/App.tsx src/components/TaskBar.tsx
git commit -m "feat: entrypoint SPA Vite y migración de componentes (Next→Vite)"
```

---

## Task 3: Migración de ESLint

**Files:**
- Modify: `.eslintrc.json`

**Interfaces:**
- Consumes: `@typescript-eslint/*` y `eslint-plugin-react-hooks` (Task 1).
- Produces: `bun run lint` con exit 0.

- [ ] **Step 1: Reemplazar `.eslintrc.json`**

```json
{
  "root": true,
  "env": { "browser": true, "es2020": true, "node": true },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": { "jsx": true }
  },
  "plugins": ["@typescript-eslint", "react-hooks"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "ignorePatterns": ["dist", "node_modules", "vite.config.ts", ".eslintrc.json"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-empty": "off"
  }
}
```

Nota: las reglas `off`/`warn` evitan que el código existente (usa `as any`, `type Props = {}`, etc.) rompa el lint. Es migración, no refactor de estilo.

- [ ] **Step 2: Correr lint**

Run: `bun run lint`
Expected: exit 0 (puede haber warnings de `no-unused-vars`, no errores). Si aparece un error, ajustar la regla correspondiente a `warn`/`off` — no modificar el código de la app.

- [ ] **Step 3: Commit**

```bash
git add .eslintrc.json
git commit -m "chore: config ESLint React/TS sin eslint-config-next"
```

---

## Task 4: Limpieza de artefactos Next y deploy

**Files:**
- Delete: `next.config.js`, `next-env.d.ts`
- Delete: `pnpm-lock.yaml`, `package-lock.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: estado funcional de Tasks 1-3.
- Produces: repo limpio, build reproducible, listo para Vercel.

- [ ] **Step 1: Eliminar archivos de Next y lockfiles viejos**

```bash
git rm next.config.js next-env.d.ts pnpm-lock.yaml package-lock.json
rm -rf .next
```

- [ ] **Step 2: Asegurar que `dist` y `.next` están en `.gitignore`**

Verificar `.gitignore` e incluir estas líneas si faltan:

```
dist
.next
```

- [ ] **Step 3: Build final de verificación**

Run: `bun run build`
Expected: pasa sin errores y genera `dist/index.html`. Confirmar que no hay referencias a `next` en el repo:

Run: `grep -rn "from \"next\|from 'next\|next/" src` → sin resultados.

- [ ] **Step 4: Verificar preset de Vercel**

En el dashboard de Vercel, confirmar que el proyecto detecta **Vite** (Framework Preset: Vite; Build Command: `vite build`; Output Directory: `dist`). Vercel usa `bun install` al detectar `bun.lock`. No se requiere `vercel.json` ni rewrites (es una sola página sin router).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: limpieza de artefactos Next y ajuste de .gitignore"
```

---

## Self-Review — cobertura de la spec

- Estructura SPA (index.html, main.tsx, App.tsx) → Task 2 ✓
- Eliminar `src/pages/` incl. `api/hello.ts` → Task 2 Step 4 ✓
- `next/image` → `<img>` → Task 2 Steps 5-6 ✓
- Import muerto de `crypto` → Task 2 Step 5 ✓
- `vite.config.ts` + alias `src` → Task 1 Step 2 ✓
- `tsconfig.json` + `tsconfig.node.json` → Task 1 Steps 3-4 ✓
- Tailwind/PostCSS sin cambios → Global Constraints ✓
- ESLint sin `eslint-config-next` → Task 3 ✓
- Borrar `next.config.js`, `next-env.d.ts`, `.next`, lockfiles → Task 4 ✓
- package.json deps/scripts + bun → Task 1 ✓
- Deploy Vercel estático → Task 4 Step 4 ✓
- Criterio de éxito (build + parity visual + sin imports next) → Task 2 Steps 7-8, Task 4 Step 3 ✓
