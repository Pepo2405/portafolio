# Migración de Next.js 13 a React + Vite

**Fecha:** 2026-07-13
**Estado:** Aprobado (diseño)

## Objetivo

Migrar el portfolio de **Next.js 13 (Pages Router)** a **React + Vite** como SPA estática,
manteniendo el comportamiento y la UI **idénticos**. No es un rediseño: es un cambio de tooling.

## Contexto actual

- App Next.js 13.3 con Pages Router. UI estilo Windows XP.
- Huella de Next pequeña y contenida:
  - `src/pages/_app.tsx` — wrapper trivial + import de `globals.css`
  - `src/pages/_document.tsx` — `<Html lang>`, `<Head>`, favicon
  - `src/pages/index.tsx` — envuelve `<App/>` en `<WindowsProvider>`
  - `src/pages/app.tsx` — contenido principal + `next/head` (título/favicon)
  - `src/pages/api/hello.ts` — boilerplate sin usar
  - `src/components/TaskBar.tsx` — único uso de `next/image`
- Todos los assets se referencian por ruta absoluta `/static/...` → funcionan igual en `public/` de Vite. **Cero cambios de assets.**
- No hay `useRouter`, `next/link`, `next/font`, `getStaticProps`, `getServerSideProps`, ni `process.env`.
- Tailwind + PostCSS ya configurados de forma estándar.

## Decisiones

- **Deploy:** Vercel como sitio estático (preset Vite, output `dist/`). Se mantiene la URL.
- **Package manager:** bun (`bun.lock`).
- **Alcance:** migración pura, sin cambios visuales ni de comportamiento.

## Cambios

### 1. Estructura SPA de Vite

- **`index.html`** (raíz): punto de entrada. Contiene `lang="en"`, `<title>Peportfolio</title>`,
  favicon `/kirby.webp`, y `<script type="module" src="/src/main.tsx">`.
  Reemplaza a `_document.tsx` + el `<Head>` de `app.tsx`.
- **`src/main.tsx`**: `createRoot(...).render(<WindowsProvider><App/></WindowsProvider>)` +
  `import 'src/styles/globals.css'`. Fusiona `index.tsx` + `_app.tsx`.
- **`src/App.tsx`**: contenido actual de `pages/app.tsx`, sin el `<Head>` ni el fragment wrapper.
- **Eliminar:** toda la carpeta `src/pages/` (incluye `api/hello.ts`).

### 2. Componentes

- **`TaskBar.tsx`**: `next/image` → `<img>` normal, conservando props `src`, `alt`, `className`,
  y `width`/`height` como atributos. Tres usos.
- Ningún otro componente usa APIs de Next.

### 3. Configuración

- **`vite.config.ts`**: `@vitejs/plugin-react` + alias `src` → `/src` (preserva todos los imports
  `src/...` sin tocarlos). Usa `vite-tsconfig-paths` o `resolve.alias`.
- **`tsconfig.json`**: `jsx: "react-jsx"`, `moduleResolution: "bundler"`, quitar referencia a
  `next-env.d.ts`. Agregar **`tsconfig.node.json`** para el config de Vite.
- **`tailwind.config.js` / `postcss.config.js`**: sin cambios.
- **`.eslintrc.json`**: reemplazar `eslint-config-next` por config mínima React/TS +
  `eslint-plugin-react-hooks`.
- **Borrar:** `next.config.js`, `next-env.d.ts`, `.next/`, `pnpm-lock.yaml`, `package-lock.json`.

### 4. package.json

- **Quitar deps:** `next`, `eslint-config-next`.
- **Agregar deps:** `vite`, `@vitejs/plugin-react`, `vite-tsconfig-paths`,
  `@typescript-eslint/*`, `eslint-plugin-react-hooks` (según config de eslint).
- **Scripts:**
  - `dev: "vite"`
  - `build: "tsc && vite build"`
  - `preview: "vite preview"`
  - `lint: "eslint . --ext ts,tsx"`
- Mantener `engines.node: "22.x"`.
- Lockfile con bun (`bun install`).

### 5. Deploy Vercel

- Preset Vite (auto-detecta `vite build` → `dist/`).
- App de una sola página sin router → **no** requiere rewrite SPA.
- Se mantiene `engines.node: 22.x`.

## Criterio de éxito (verificación)

1. `bun run build` compila sin errores de TypeScript y genera `dist/`.
2. `bun run dev` levanta y la app se ve **idéntica**:
   - Fondo XP, íconos de escritorio (Curriculum, Amongus, Proyectos, Redes, Tecnologías)
   - Ventanas draggable/resizable
   - Taskbar con reloj y menú Inicio
   - Sonido de Amongus al interactuar
   - Abrir / minimizar / maximizar ventanas
3. No quedan imports de `next/*` en el código.

## Fuera de alcance

- Rediseño visual o de UX.
- Router del lado del cliente (no lo necesita).
- Cambios en la lógica de componentes, context o hooks.
