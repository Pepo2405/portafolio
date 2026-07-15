# Fidelidad XP "Luna" — Tier 2 (Piezas icónicas) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sumar las 3 piezas icónicas del tema XP "Luna" sobre el chrome ya hecho en Tier 1: (2.1) menú Inicio de 2 columnas con header de avatar + nombre y footer azul; (2.2) resaltado de selección azul XP consistente en menús, ítems de folder y listas dentro de ventanas; (2.3) selección de íconos del escritorio (recuadro azul translúcido + label con fondo azul).

**Architecture:** Cambio visual + estado de UI mínimo, sin tocar la lógica de ventanas (drag/resize/focus/z-order/minimizar — `WindowsContext`). El hex/gradiente Luna vive en `tailwind.config.js` (tokens `luna.*`) y en `src/styles/globals.css` (clases `@layer components` `.xp-*`), NUNCA inline en el JSX. El menú Inicio abre las ventanas reales vía el `handleOpen` que ya expone el contexto (`setVisible+setMinimized+focus`). La selección de íconos del escritorio se resuelve con un único estado local en `App.tsx` (`selectedIcon`) + click-afuera para deseleccionar; los íconos del escritorio se unifican en un componente `DesktopIcon` para no duplicar el markup (hoy repetido en `App.tsx`, `Folder.tsx`, `Socials.tsx`, `Techs.tsx`).

**Tech Stack:** React 18.2, Vite 5, TypeScript 5, TailwindCSS 3.3, react-icons. Gestor: **bun** (`bun.lock`).

## Global Constraints

- **No hay framework de tests en el repo.** Verificación de cada task = `bunx tsc --noEmit` + `bun run lint` sin **errores** nuevos (los `warning` de `no-unused-vars` preexistentes en otros archivos son aceptables) + `bun run build` OK + chequeo visual con `bun run dev` (herramienta browser).
- **Gestor: bun.** Usar `bun`/`bunx`. No commitear otros lockfiles.
- **Trabajamos en `master`** (convención del repo). Cada commit acotado SOLO a los archivos de su task (no `git add -A`). **No hacer push** salvo pedido explícito del usuario.
- **El hex/gradiente vive en `tailwind.config.js` (tokens `luna.*`) o `globals.css` (clases `.xp-*`), NUNCA inline en el JSX.** Los componentes aplican clases + layout Tailwind.
- **Solo utilidades Tailwind ya presentes + los tokens/clases nuevos de este plan.** No agregar plugins de Tailwind.
- **NO cambiar la lógica de ventanas** (`WindowsContext`, drag/resize/minimize/focus/z-order) ni el comportamiento de la taskbar (toggle/estado activo ya implementados) — solo apariencia + el estado de selección de íconos nuevo.
- **Ventanas reales = exactamente `Proyectos`, `Sociales`, `Tecnologías`** (títulos EXACTOS, con tilde; son las claves de `WINDOW_META` y las que dispatchan los íconos y renderiza `WindowsContainer`). Ojo: el label visible del ícono de Sociales en el escritorio es **"Redes sociales"** pero el title que dispatcha es **"Sociales"** — mantener esa distinción (label ≠ title).
- **Abrir ventanas desde el menú Inicio:** usar `handleOpen({ target: { title } })` del contexto (ya existe: setea visible+minimized+focus). NO reinventar el dispatch.
- **A11y:** conservar `aria-haspopup`/`aria-expanded`/toggle del start; el menú cierra con `Escape` y click-afuera (ya implementado en `TaskBar`). Agregar el manejo de foco pedido (foco al primer ítem al abrir, devolver al botón al cerrar con `Escape`). Sentence case en español para textos nuevos.
- **Avatar:** usar `public/kirby.webp` ya existente (bare src `/kirby.webp`). No inventar assets nuevos.
- Rutas exactas siempre. Código completo en cada step — sin placeholders.

---

## File Structure

- `tailwind.config.js` — tokens `colors.luna.selection` / `luna.menuHeader` / `luna.menuRight` (MODIFY — Task 1).
- `src/styles/globals.css` — clases `.xp-select` (resaltado), `.xp-startmenu*` (header/footer/paneles del menú Inicio), `.xp-icon-selected` (selección de escritorio) (MODIFY — Tasks 1, 2, 3, 4).
- `src/lists/windows.ts` — extender `WindowMeta` con `label` (título visible) para alimentar el menú Inicio y unificar íconos (MODIFY — Task 2).
- `src/components/TaskBar.tsx` — rediseño del popup del menú Inicio a 2 columnas + foco (MODIFY — Task 2).
- `src/components/Windows/WindowsContainer.tsx` — hovers de `ProjectItem`/`FeaturedCard` → resaltado XP (MODIFY — Task 3).
- `src/components/DesktopIcon.tsx` — componente unificado de ícono de escritorio con selección (CREATE — Task 4).
- `src/App.tsx` — estado `selectedIcon` + click-afuera; usar `DesktopIcon` para Curriculum/Proyectos/Sociales/Tecnologías (MODIFY — Task 4).
- `src/components/Folder.tsx`, `src/components/Socials.tsx`, `src/components/Techs.tsx` — reemplazados por `DesktopIcon` en `App.tsx`; **eliminar** los que queden sin uso (Task 4).

Orden de dependencias: **Task 1** primero (tokens + clase base `.xp-select`). **Task 2** (menú Inicio) y **Task 3** (hovers de contenido) dependen solo de Task 1 y son independientes entre sí. **Task 4** (selección de escritorio) depende de Task 1. Ejecutar secuencial porque Tasks 1–4 tocan `globals.css`.

---

### Task 1: Tokens Luna de selección/menú + clase `.xp-select`

Agrega los tokens de color de Tier 2 y la clase reutilizable de resaltado azul XP que consumen las Tasks 2–4.

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/styles/globals.css`

**Interfaces:**
- Produces: colores `luna.selection` (`#316ac5`), `luna.menuHeader` (`#0a5ad4`), `luna.menuRight` (`#d3e5fa`) usables como `bg-luna-*`/`text-*`/`border-*`; clase `.xp-select` (hover azul + texto blanco). Consumidos por Tasks 2–4.

- [ ] **Step 1: Agregar tokens en `tailwind.config.js`**

En `theme.extend.colors.luna` (hoy solo `{ frame: '#0831d9' }`), agregar las claves nuevas dejando `frame` intacto:

```js
        luna: {
          frame: '#0831d9',
          selection: '#316ac5',
          menuHeader: '#0a5ad4',
          menuRight: '#d3e5fa',
        },
```

- [ ] **Step 2: Agregar `.xp-select` en `globals.css`**

Dentro del `@layer components` existente (después de `.xp-start:hover { ... }`, antes del `}` de cierre del layer), agregar:

```css
  .xp-select:hover,
  .xp-select.is-active {
    background-color: theme(colors.luna.selection);
    color: #fff;
  }
```

**Verification:** `bunx tsc --noEmit` OK; `bun run build` OK (Tailwind resuelve `theme(colors.luna.selection)` sin error). `bun run dev`: sin cambios visuales todavía (nadie usa la clase aún).

- [ ] **Step 3: Commit** — `tailwind.config.js`, `src/styles/globals.css`.

---

### Task 2: Menú Inicio de 2 columnas

Rediseña el popup del start (hoy panel blanco `w-72 h-80`, header "Hablemos", lista de `taskList.json` con `hover:bg-gray-400/50`) al layout canónico XP adaptado al portfolio: header avatar+nombre, columna izquierda (programas → ventanas reales + Curriculum), columna derecha celeste (contacto), footer azul.

**Files:**
- Modify: `src/lists/windows.ts`
- Modify: `src/styles/globals.css`
- Modify: `src/components/TaskBar.tsx`

**Interfaces:**
- `WINDOW_META[title]` gana `label: string` (título visible del ítem del menú); `icon` ya existe. Consumido por la columna izquierda del menú.

- [ ] **Step 1: Extender `WINDOW_META` con `label` en `src/lists/windows.ts`**

Reemplazar el archivo por:

```ts
export type WindowMeta = { icon: string; label: string };

// Ventanas reales del escritorio. La clave = title EXACTO que despachan
// Folder/Socials/Techs y que renderiza WindowsContainer. Íconos bare para <img src>.
export const WINDOW_META: Record<string, WindowMeta> = {
  Proyectos: { icon: "/static/folderIcon.png", label: "Proyectos" },
  Sociales: { icon: "/static/icons/redes.webp", label: "Redes sociales" },
  Tecnologías: { icon: "/static/folderIcon.png", label: "Tecnologías" },
};
```

(La taskbar en `TaskBar.tsx` ya lee `WINDOW_META[title].icon`; agregar `label` no la rompe.)

- [ ] **Step 2: Clases del menú en `globals.css`**

Dentro del `@layer components`, agregar:

```css
  .xp-startmenu {
    border: 1px solid #0831d9;
    border-radius: 8px 8px 2px 2px;
  }
  .xp-startmenu-header {
    background: linear-gradient(to bottom, #1f6fe0 0%, #0a5ad4 60%, #08409e 100%);
    border-bottom: 2px solid #f0b400;
    border-radius: 7px 7px 0 0;
  }
  .xp-startmenu-footer {
    background: linear-gradient(to bottom, #2f7ce8 0%, #1257c6 100%);
    border-top: 1px solid #f0b400;
  }
```

- [ ] **Step 3: Reescribir el popup en `TaskBar.tsx`**

El componente ya tiene: `startOpen`/`setStartOpen`, `startRef`, cierre con Escape/click-afuera, `Tasks` = `list.items` (Github/Linkedin/Correo de `taskList.json`), `handleMaximize`/`handleMinimize` de `useWindow`. Cambios:

1. Importar `handleOpen` del hook y `WINDOW_META`:
```tsx
  const {
    visibleItems,
    minimizedItems,
    focused,
    handleOpen,
    handleMaximize,
    handleMinimize,
  } = useWindow();
```
2. Agregar un ref para el primer ítem + volver el foco al botón al cerrar. Agregar debajo de `startRef`:
```tsx
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const startBtnRef = useRef<HTMLButtonElement>(null);
```
Enfocar el primer ítem al abrir (nuevo `useEffect`, después del effect de cierre existente):
```tsx
  useEffect(() => {
    if (startOpen) firstItemRef.current?.focus();
  }, [startOpen]);
```
En el handler de `Escape` existente, además de `setStartOpen(false)`, devolver el foco: `startBtnRef.current?.focus();`.
3. Pasar `ref={startBtnRef}` al `<button ...className="xp-start ...">` existente.
4. Reemplazar TODO el bloque `{startOpen && ( ... )}` (hoy `role="menu"`, `h-80 w-72`, header "Hablemos" + lista) por:

```tsx
          {startOpen && (
            <div
              role="dialog"
              aria-label="Menú Inicio"
              className="xp-startmenu absolute bottom-full left-0 w-[380px] overflow-hidden bg-white shadow-2xl"
            >
              <header className="xp-startmenu-header flex items-center gap-3 px-4 py-2 text-white">
                <img
                  src="/kirby.webp"
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-md border border-white/60 bg-white/20"
                />
                <span className="text-base font-bold [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
                  Ignacio Iglesias
                </span>
              </header>

              <div className="flex">
                <div className="flex w-1/2 flex-col bg-white py-2">
                  {Object.entries(WINDOW_META).map(([title, meta], i) => (
                    <button
                      key={title}
                      type="button"
                      ref={i === 0 ? firstItemRef : undefined}
                      onClick={() => {
                        handleOpen({ target: { title } });
                        setStartOpen(false);
                      }}
                      className="xp-select flex items-center gap-3 px-3 py-2 text-left text-black"
                    >
                      <img src={meta.icon} alt="" width={24} height={24} />
                      <span className="text-sm font-bold">{meta.label}</span>
                    </button>
                  ))}
                  <a
                    href="/static/Cv Ignacio Iglesias.pdf"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setStartOpen(false)}
                    className="xp-select flex items-center gap-3 px-3 py-2 text-left text-black"
                  >
                    <img src="/static/icons/chrome.svg" alt="" width={24} height={24} />
                    <span className="text-sm font-bold">Curriculum</span>
                  </a>
                </div>

                <div className="flex w-1/2 flex-col bg-luna-menuRight py-2">
                  {Tasks.map(({ title, href, icon }) => (
                    <a
                      key={title}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setStartOpen(false)}
                      className="xp-select flex items-center gap-3 px-3 py-2 text-left text-black"
                    >
                      <img src={icon} alt="" width={22} height={22} />
                      <span className="text-sm">{title}</span>
                    </a>
                  ))}
                </div>
              </div>

              <footer className="xp-startmenu-footer flex items-center justify-end gap-4 px-4 py-2 text-white">
                <button
                  type="button"
                  onClick={() => setStartOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold hover:brightness-110"
                >
                  <span aria-hidden>🔑</span> Cerrar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setStartOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold hover:brightness-110"
                >
                  <span aria-hidden>⏻</span> Apagar
                </button>
              </footer>
            </div>
          )}
```

Nota: se cambia `role="menu"` → `role="dialog"` + `aria-label` porque el layout de 2 columnas no encaja en la semántica lineal de `menu` (decisión del design 2.1). Los ítems dejan de ser `role="menuitem"`; son `<button>`/`<a>` normales, accesibles por Tab. "Cerrar sesión"/"Apagar" son decorativos (solo cierran el menú) — sin easter-egg (fuera de alcance).

**Verification:** `bunx tsc --noEmit` + `bun run lint` sin errores nuevos; `bun run build` OK. `bun run dev`:
- Click en Inicio abre un panel de ~380px con header azul (avatar Kirby + "Ignacio Iglesias", línea dorada abajo).
- Columna izquierda blanca: Proyectos / Redes sociales / Tecnologías / Curriculum. Click en Proyectos/Redes sociales/Tecnologías **abre la ventana correspondiente** (y aparece en la taskbar); Curriculum abre el PDF en pestaña nueva. El menú se cierra tras el click.
- Columna derecha celeste: Github / Linkedin / Correo → abren en pestaña nueva.
- Hover sobre cualquier ítem → fondo azul XP + texto blanco (`.xp-select`).
- Footer azul con "Cerrar sesión" y "Apagar".
- `Escape` cierra y devuelve el foco al botón Inicio; click-afuera cierra; al abrir, el foco cae en el primer ítem. En mobile (~390px) el panel no desborda horizontalmente (cabe en 380px; si el viewport es <380 se puede afinar a `w-[92vw]` en QA).

- [ ] **Step 4: Commit** — `src/lists/windows.ts`, `src/styles/globals.css`, `src/components/TaskBar.tsx`.

---

### Task 3: Resaltado de selección azul XP en listas de ventanas

Reemplaza los hovers `hover:bg-cyan-200/90` (`ProjectItem`) y `hover:bg-cyan-200/60` (`FeaturedCard`) en `WindowsContainer.tsx` por el resaltado XP `.xp-select`, para consistencia con el menú Inicio.

**Files:**
- Modify: `src/components/Windows/WindowsContainer.tsx`

- [ ] **Step 1: `ProjectItem` → `.xp-select`**

En el `<a>` de `ProjectItem`, reemplazar `hover:bg-cyan-200/90` por `xp-select` (mantener el resto de las clases: `flex h-16 w-fit flex-col items-center justify-between rounded-sm p-1 text-center md:h-28 md:w-28`).

- [ ] **Step 2: `FeaturedCard` → `.xp-select`**

En el `<a>` de `FeaturedCard`, reemplazar `hover:bg-cyan-200/60` por `xp-select` (mantener `flex gap-3 rounded-md border border-slate-300 bg-slate-50 p-2 transition-colors`).

Nota: `.xp-select` pone `color:#fff` en hover; el texto interno de las cards usa `text-black`/`text-slate-600` explícitos, así que en hover conviene que el título/desc herede blanco. `ProjectItem` usa `text-black` en el `<span>` → en hover se ve negro sobre azul (bajo contraste). Ajuste: en `ProjectItem` cambiar el `<span>` a `text-inherit` y en el `<a>` dejar `text-black` (así el hover azul lo pinta blanco). Para `FeaturedCard`, el resaltado sobre una card con thumbnail es menos idiomático; si en QA visual queda mal, revertir SOLO `FeaturedCard` a un hover suave (`hover:bg-luna-menuRight`) y dejar `.xp-select` únicamente en `ProjectItem`. Decisión final en el chequeo visual.

**Verification:** `bunx tsc --noEmit` + `bun run lint` OK; `bun run build` OK. `bun run dev`: abrir Tecnologías/Sociales/Proyectos → al pasar el mouse sobre un ítem del grid, fondo azul XP (`#316ac5`) + texto blanco legible. Nada desborda; el layout del grid no cambia.

- [ ] **Step 2: Commit** — `src/components/Windows/WindowsContainer.tsx`.

---

### Task 4: Selección de íconos del escritorio

Unifica los íconos del escritorio en un componente `DesktopIcon` y agrega el estado de "ícono seleccionado" en `App.tsx`: al clickear un ícono se muestra el recuadro azul translúcido XP + label con fondo azul; click en el fondo deselecciona. Hoy el markup del ícono está duplicado 4 veces (Curriculum en `App.tsx`, y `Folder`/`Socials`/`Techs`).

**Files:**
- Create: `src/components/DesktopIcon.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/globals.css`
- Delete: `src/components/Folder.tsx`, `src/components/Socials.tsx`, `src/components/Techs.tsx` (quedan sin uso)

**Interfaces:**
- `DesktopIcon` props: `{ icon: string; label: string; selected: boolean; onSelect: () => void; onOpen: () => void }`. `onSelect` = click simple (selecciona); `onOpen` = abrir la ventana / navegar. `icon` es una URL bare (`/static/...`).

- [ ] **Step 1: Clase `.xp-icon-selected` en `globals.css`**

Dentro del `@layer components`:

```css
  .xp-icon-selected .xp-icon-thumb {
    background-color: rgba(49, 106, 197, 0.4);
    outline: 1px dotted rgba(255, 255, 255, 0.7);
    outline-offset: -2px;
  }
  .xp-icon-selected .xp-icon-label {
    background-color: theme(colors.luna.selection);
    color: #fff;
  }
```

- [ ] **Step 2: Crear `src/components/DesktopIcon.tsx`**

```tsx
type DesktopIconProps = {
  icon: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
};

const DesktopIcon = ({ icon, label, selected, onSelect, onOpen }: DesktopIconProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onOpen}
      aria-pressed={selected}
      className={`flex w-24 flex-col items-center gap-1 rounded-sm p-2 text-center ${
        selected ? "xp-icon-selected" : ""
      }`}
    >
      <div
        className="xp-icon-thumb h-12 w-12 rounded-sm"
        style={{
          backgroundImage: `url(${icon})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <span className="xp-icon-label shadowText rounded-sm px-1 text-sm font-bold text-white">
        {label}
      </span>
    </button>
  );
};

export default DesktopIcon;
```

Comportamiento XP: 1 click selecciona (recuadro azul), doble click abre. Mantiene `shadowText` (ya existe) en el label.

- [ ] **Step 3: Cablear estado + reemplazar íconos en `App.tsx`**

- Convertir `App` a componente con estado:
```tsx
import { useState } from "react";
import DesktopIcon from "src/components/DesktopIcon";
import useWindow from "src/hooks/useWindow";
import FullScreenButton from "src/components/FullScreenButton";
import Amongus from "src/components/Amongus";
import WindowsContainer from "src/components/Windows/WindowsContainer";
import { BG } from "src/images";
```
- Dentro de `App`: `const [selected, setSelected] = useState<string | null>(null); const { handleOpen } = useWindow();`
- En el `<div>` raíz, deseleccionar al clickear el fondo: `onClick={() => setSelected(null)}`. (El click en un `DesktopIcon` llama `onSelect` que setea `selected`; como el evento burbujea al fondo, en `DesktopIcon` el `onClick`/`onDoubleClick` deben frenar la propagación con `e.stopPropagation()` — agregar el param `e` en `onSelect`/`onOpen` handlers del padre, o envolver: la forma simple es en `App` pasar `onSelect={() => setSelected(id)}` y en `DesktopIcon` hacer `onClick={(e) => { e.stopPropagation(); onSelect(); }}` y `onDoubleClick={(e) => { e.stopPropagation(); onOpen(); }}`.) Ajustar `DesktopIcon` para el `stopPropagation`.
- Reemplazar la `<section className="folderIcons">` (Curriculum `<a>`, `<Proyects>`, `<Socials>`, `<Techs>`) por 4 `DesktopIcon`. `Amongus` queda como está (posición absoluta propia, easter-egg — no se toca):
```tsx
      <section className="folderIcons !overflow-hidden" onClick={() => setSelected(null)}>
        <DesktopIcon
          icon="/static/icons/chrome.svg"
          label="Curriculum"
          selected={selected === "cv"}
          onSelect={() => setSelected("cv")}
          onOpen={() => window.open("/static/Cv Ignacio Iglesias.pdf", "_blank")}
        />
        <DesktopIcon
          icon="/static/folderIcon.png"
          label="Proyectos"
          selected={selected === "Proyectos"}
          onSelect={() => setSelected("Proyectos")}
          onOpen={() => handleOpen({ target: { title: "Proyectos" } })}
        />
        <DesktopIcon
          icon="/static/icons/redes.webp"
          label="Redes sociales"
          selected={selected === "Sociales"}
          onSelect={() => setSelected("Sociales")}
          onOpen={() => handleOpen({ target: { title: "Sociales" } })}
        />
        <DesktopIcon
          icon="/static/folderIcon.png"
          label="Tecnologías"
          selected={selected === "Tecnologías"}
          onSelect={() => setSelected("Tecnologías")}
          onOpen={() => handleOpen({ target: { title: "Tecnologías" } })}
        />
      </section>
```
Mantener el `onClick={() => setSelected(null)}` en el `<div>` raíz **y** en la `<section>` (el fondo con los íconos) para que un click en el vacío deseleccione. `Amongus`, `<main>` (título + FullScreenButton + WindowsContainer) y `<TaskBar>` quedan igual. Nota: `Amongus` se importaba antes; conservar su import y su `<Amongus />`.

- [ ] **Step 4: Ajustar `stopPropagation` en `DesktopIcon.tsx`**

Cambiar los handlers del Step 2 a:
```tsx
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onOpen(); }}
```

- [ ] **Step 5: Borrar componentes sin uso**

`Folder.tsx`, `Socials.tsx`, `Techs.tsx` ya no se importan en ningún lado (verificar con `grep`: `lsp references` sobre sus default exports o `grep "components/Folder\|components/Socials\|components/Techs"`). Eliminarlos. **Antes de borrar, confirmar** que `WindowsContainer.tsx` NO importa ninguno (importa `data`/`socials`/`techsJson` de `src/lists/*`, no los componentes — OK) y que `Amongus`/`DraggableLink`/`Mochify` no dependen de ellos.

**Verification:** `bunx tsc --noEmit` + `bun run lint` sin errores nuevos; `bun run build` OK. `bun run dev`:
- 1 click en un ícono del escritorio → recuadro azul translúcido sobre el thumbnail + label con fondo azul y texto blanco. Solo un ícono seleccionado a la vez.
- Doble click abre la ventana correcta (Proyectos/Sociales/Tecnologías) o el PDF (Curriculum).
- Click en el fondo del escritorio → deselecciona.
- Sin warnings de React en consola; el grid `folderIcons` mantiene su layout; en mobile no desborda.

- [ ] **Step 6: Commit** — `src/components/DesktopIcon.tsx`, `src/App.tsx`, `src/styles/globals.css`, y la eliminación de `Folder.tsx`/`Socials.tsx`/`Techs.tsx`.

---

## Out of scope (Tier 3)

Menú contextual del escritorio (click derecho), sonidos XP, pantalla de boot/login, cursores XP, globos de notificación. Ver `docs/superpowers/specs/2026-07-13-xp-fidelity-design.md` §Tier 3.
