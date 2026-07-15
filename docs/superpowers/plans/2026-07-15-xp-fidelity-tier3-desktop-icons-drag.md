# Tier 3.6 — Arrastrar y reordenar íconos del escritorio (posición libre XP) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Los íconos del escritorio pasan de JSX hardcodeado en un CSS grid por flujo a íconos posicionados libremente en una grilla invisible, arrastrables con mouse y touch, con snap al soltar y posición persistida en localStorage por visitante.

**Architecture:** Los íconos se describen como datos (`src/lists/desktopIcons.ts`). Un hook (`src/hooks/useDesktopIcons.ts`) mantiene el layout `Record<id, {col,row}>`, la selección, la mecánica de arrastre (Pointer Events con umbral de movimiento, igual que `useDragMove`) y la persistencia versionada en localStorage. `App.tsx` mapea la lista y posiciona cada ícono en `position: absolute` dentro de un contenedor `position: relative`. Sin dependencias nuevas.

**Tech Stack:** React 18.2 + TypeScript 5.0 + Vite 5 + TailwindCSS 3.3. Pointer Events nativos (sin librería de drag).

## Global Constraints

- **Sin dependencias nuevas.** dnd-kit/react-dnd descartados; se reutiliza el patrón Pointer Events de `src/hooks/useDragMove.ts`.
- **`react-draggable` NO se usa** para esta feature (es legacy; el código nuevo usa hooks propios con Pointer Events).
- **Hex/gradientes viven en `tailwind.config.js` + `src/styles/globals.css`**, nunca inline en JSX. Los componentes sólo aplican clases + layout Tailwind.
- **Fuente Tahoma-stack** ya aplicada en el contenedor raíz; no tocar.
- **Sentence case en español** para textos nuevos.
- **Accesibilidad:** conservar `aria-pressed`, `onClick`/`onDoubleClick` y foco visible en los íconos; el drag es mejora progresiva.
- **Registry único:** los `title` de `kind: "open-window"` deben coincidir con las claves de `WINDOW_META` (`src/lists/windows.ts`): `Proyectos`, `Sociales`, `Tecnologías`.
- **Gates de verificación** (no hay framework de tests en el repo): `bunx tsc --noEmit` sin errores, `bun run build` OK, y QA visual con `bun run dev`. `no-unused-vars` preexistentes son aceptables.

---

## File Structure

- **Create** `src/lists/desktopIcons.ts` — tipos `DesktopIconKind`, `DesktopIconDef`, `Cell`; constantes `CELL_W`/`CELL_H`; array `DESKTOP_ICONS` (fuente de verdad de los íconos del escritorio y su celda default).
- **Create** `src/hooks/useDesktopIcons.ts` — estado de layout + selección + drag + persistencia; API `DesktopIconsApi`.
- **Modify** `src/components/DesktopIcon.tsx` — acepta `style`, `dragging`, `handlers`; posición absoluta vía clase `.xp-icon`.
- **Modify** `src/components/Amongus.tsx` — acepta `style`, `dragging`, `handlers`, `onSelect`; conserva su easter-egg (dead/sound/clickCount).
- **Modify** `src/App.tsx` — usa `useDesktopIcons` + mapea `DESKTOP_ICONS`; despacha acciones por `kind`.
- **Modify** `src/styles/globals.css` — `.folderIcons` de `grid` a `relative`; agrega `.xp-icon` (absolute) y `.xp-icon-dragging`.

---

## Task 1: Data list + hook (lógica de layout/drag en memoria)

Añade los datos y el hook completos (incluida persistencia). Al final de esta tarea el código compila pero todavía no está conectado a `App.tsx`, así que el sitio se ve igual que hoy.

**Files:**
- Create: `src/lists/desktopIcons.ts`
- Create: `src/hooks/useDesktopIcons.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `src/lists/desktopIcons.ts`:
    - `interface Cell { col: number; row: number }`
    - `type DesktopIconKind = { type: "open-window"; title: string } | { type: "open-url"; href: string } | { type: "easter-egg" }`
    - `interface DesktopIconDef { id: string; icon: string; label: string; kind: DesktopIconKind; defaultCell: Cell }`
    - `const CELL_W = 104`, `const CELL_H = 100`
    - `const DESKTOP_ICONS: DesktopIconDef[]`
  - `src/hooks/useDesktopIcons.ts`:
    - `interface DesktopIconsApi { layout: Record<string, Cell>; selected: string | null; dragId: string | null; select: (id: string) => void; clearSelection: () => void; getPos: (id: string) => { x: number; y: number }; dragHandlers: (id: string) => { onPointerDown: (e: ReactPointerEvent) => void; onPointerMove: (e: ReactPointerEvent) => void; onPointerUp: (e: ReactPointerEvent) => void }; resetLayout: () => void }`
    - `export default function useDesktopIcons(containerRef: RefObject<HTMLElement>): DesktopIconsApi`

- [ ] **Step 1: Crear `src/lists/desktopIcons.ts`**

```ts
// Registro de íconos del escritorio. `id` es la clave de layout/persistencia.
// Para ventanas, `title` debe coincidir con la clave de WINDOW_META (src/lists/windows.ts).
export interface Cell {
  col: number;
  row: number;
}

export type DesktopIconKind =
  | { type: "open-window"; title: string }
  | { type: "open-url"; href: string }
  | { type: "easter-egg" };

export interface DesktopIconDef {
  id: string;
  icon: string; // url para background-image
  label: string;
  kind: DesktopIconKind;
  defaultCell: Cell;
}

// Tamaño de la celda de la grilla invisible (px). El DesktopIcon mide w-24 (96px);
// CELL_W > 96 deja aire entre columnas.
export const CELL_W = 104;
export const CELL_H = 100;

export const DESKTOP_ICONS: DesktopIconDef[] = [
  {
    id: "cv",
    icon: "/static/icons/chrome.svg",
    label: "Curriculum",
    kind: { type: "open-url", href: "/static/Cv Ignacio Iglesias.pdf" },
    defaultCell: { col: 0, row: 0 },
  },
  {
    id: "Proyectos",
    icon: "/static/folderIcon.png",
    label: "Proyectos",
    kind: { type: "open-window", title: "Proyectos" },
    defaultCell: { col: 0, row: 1 },
  },
  {
    id: "Sociales",
    icon: "/static/icons/redes.webp",
    label: "Redes sociales",
    kind: { type: "open-window", title: "Sociales" },
    defaultCell: { col: 0, row: 2 },
  },
  {
    id: "Tecnologías",
    icon: "/static/folderIcon.png",
    label: "Tecnologías",
    kind: { type: "open-window", title: "Tecnologías" },
    defaultCell: { col: 0, row: 3 },
  },
  {
    id: "amongus",
    icon: "/static/icons/amogus.webp",
    label: "",
    kind: { type: "easter-egg" },
    defaultCell: { col: 0, row: 5 },
  },
];
```

- [ ] **Step 2: Crear `src/hooks/useDesktopIcons.ts`**

```ts
import {
  PointerEvent as ReactPointerEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Cell, CELL_H, CELL_W, DESKTOP_ICONS } from "src/lists/desktopIcons";

const STORAGE_KEY = "xp-desktop-icons@1";
const MOVE_THRESHOLD = 3;

type Layout = Record<string, Cell>;

function defaultLayout(): Layout {
  const l: Layout = {};
  for (const def of DESKTOP_ICONS) l[def.id] = { ...def.defaultCell };
  return l;
}

function hydrate(): Layout {
  const base = defaultLayout();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const stored = JSON.parse(raw) as Partial<Layout>;
    // Sólo aplicamos celdas válidas de íconos conocidos; el resto usa el default.
    for (const def of DESKTOP_ICONS) {
      const c = stored[def.id];
      if (
        c &&
        Number.isInteger(c.col) &&
        Number.isInteger(c.row) &&
        c.col >= 0 &&
        c.row >= 0
      ) {
        base[def.id] = { col: c.col, row: c.row };
      }
    }
  } catch {
    // storage corrupto/inaccesible -> layout default
  }
  return base;
}

export interface DesktopIconsApi {
  layout: Layout;
  selected: string | null;
  dragId: string | null;
  select: (id: string) => void;
  clearSelection: () => void;
  getPos: (id: string) => { x: number; y: number };
  dragHandlers: (id: string) => {
    onPointerDown: (e: ReactPointerEvent) => void;
    onPointerMove: (e: ReactPointerEvent) => void;
    onPointerUp: (e: ReactPointerEvent) => void;
  };
  resetLayout: () => void;
}

export default function useDesktopIcons(
  containerRef: RefObject<HTMLElement>
): DesktopIconsApi {
  const [layout, setLayout] = useState<Layout>(hydrate);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [offset, setOffset] = useState<{ dx: number; dy: number }>({
    dx: 0,
    dy: 0,
  });

  const start = useRef<{
    px: number;
    py: number;
    col: number;
    row: number;
  } | null>(null);
  const moved = useRef(false);

  // Persistir en cada cambio de layout.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // ignore
    }
  }, [layout]);

  const getPos = useCallback(
    (id: string) => {
      const c = layout[id] ?? { col: 0, row: 0 };
      const base = { x: c.col * CELL_W, y: c.row * CELL_H };
      if (dragId === id) return { x: base.x + offset.dx, y: base.y + offset.dy };
      return base;
    },
    [layout, dragId, offset]
  );

  const bounds = useCallback((): { maxCol: number; maxRow: number } => {
    const el = containerRef.current;
    const w = el?.clientWidth ?? CELL_W * 8;
    const h = el?.clientHeight ?? CELL_H * 6;
    return {
      maxCol: Math.max(0, Math.floor(w / CELL_W) - 1),
      maxRow: Math.max(0, Math.floor(h / CELL_H) - 1),
    };
  }, [containerRef]);

  const nearestFreeCell = useCallback(
    (target: Cell, excludeId: string): Cell => {
      const { maxCol, maxRow } = bounds();
      const clamp = (c: Cell): Cell => ({
        col: Math.min(Math.max(0, c.col), maxCol),
        row: Math.min(Math.max(0, c.row), maxRow),
      });
      const occupied = new Set(
        Object.entries(layout)
          .filter(([id]) => id !== excludeId)
          .map(([, c]) => `${c.col},${c.row}`)
      );
      const t = clamp(target);
      if (!occupied.has(`${t.col},${t.row}`)) return t;
      // Búsqueda en anillos crecientes alrededor de la celda objetivo.
      for (let r = 1; r <= maxCol + maxRow + 1; r++) {
        for (let dc = -r; dc <= r; dc++) {
          for (let dr = -r; dr <= r; dr++) {
            if (Math.max(Math.abs(dc), Math.abs(dr)) !== r) continue;
            const c = clamp({ col: t.col + dc, row: t.row + dr });
            if (!occupied.has(`${c.col},${c.row}`)) return c;
          }
        }
      }
      return t;
    },
    [layout, bounds]
  );

  const dragHandlers = useCallback(
    (id: string) => ({
      onPointerDown(e: ReactPointerEvent) {
        if (e.button !== 0) return;
        const c = layout[id] ?? { col: 0, row: 0 };
        start.current = {
          px: e.clientX,
          py: e.clientY,
          col: c.col,
          row: c.row,
        };
        moved.current = false;
      },
      onPointerMove(e: ReactPointerEvent) {
        const s = start.current;
        if (!s) return;
        const dx = e.clientX - s.px;
        const dy = e.clientY - s.py;
        if (!moved.current) {
          if (Math.hypot(dx, dy) <= MOVE_THRESHOLD) return;
          moved.current = true;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          setDragId(id);
        }
        setOffset({ dx, dy });
      },
      onPointerUp(e: ReactPointerEvent) {
        const s = start.current;
        start.current = null;
        const wasMoved = moved.current;
        moved.current = false;
        setDragId(null);
        setOffset({ dx: 0, dy: 0 });
        if (!s || !wasMoved) return; // fue un click -> lo maneja onClick/onDoubleClick
        const px = s.col * CELL_W + (e.clientX - s.px);
        const py = s.row * CELL_H + (e.clientY - s.py);
        const target: Cell = {
          col: Math.round(px / CELL_W),
          row: Math.round(py / CELL_H),
        };
        const dest = nearestFreeCell(target, id);
        setLayout((prev) => ({ ...prev, [id]: dest }));
      },
    }),
    [layout, nearestFreeCell]
  );

  const select = useCallback((id: string) => setSelected(id), []);
  const clearSelection = useCallback(() => setSelected(null), []);
  const resetLayout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setLayout(defaultLayout());
  }, []);

  return {
    layout,
    selected,
    dragId,
    select,
    clearSelection,
    getPos,
    dragHandlers,
    resetLayout,
  };
}
```

- [ ] **Step 3: Verificar que compila**

Run: `bunx tsc --noEmit`
Expected: sin errores. (El hook y la lista aún no se importan en ningún lado; TS los acepta como código muerto.)

- [ ] **Step 4: Commit**

```bash
git add src/lists/desktopIcons.ts src/hooks/useDesktopIcons.ts
git commit -m "feat(desktop): add desktop-icons data list + useDesktopIcons hook"
```

---

## Task 2: `DesktopIcon` acepta posición y handlers de drag

**Files:**
- Modify: `src/components/DesktopIcon.tsx` (reemplazo completo)

**Interfaces:**
- Consumes: nada nuevo (recibe props desde `App.tsx` en Task 4).
- Produces: nuevo shape de props de `DesktopIcon`:
  - `{ icon: string; label: string; selected: boolean; dragging: boolean; style: CSSProperties; handlers: { onPointerDown; onPointerMove; onPointerUp }; onSelect: () => void; onOpen: () => void }`

- [ ] **Step 1: Reemplazar `src/components/DesktopIcon.tsx` por completo**

```tsx
import { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

type DragHandlers = {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
};

type DesktopIconProps = {
  icon: string;
  label: string;
  selected: boolean;
  dragging: boolean;
  style: CSSProperties;
  handlers: DragHandlers;
  onSelect: () => void;
  onOpen: () => void;
};

const DesktopIcon = ({
  icon,
  label,
  selected,
  dragging,
  style,
  handlers,
  onSelect,
  onOpen,
}: DesktopIconProps) => {
  return (
    <button
      type="button"
      style={style}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      aria-pressed={selected}
      className={`xp-icon flex w-24 flex-col items-center gap-1 rounded-sm p-2 text-center ${
        selected ? "xp-icon-selected" : ""
      } ${dragging ? "xp-icon-dragging" : ""}`}
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

> Nota: `onClick` (seleccionar) y `onDoubleClick` (abrir) se conservan. Como los handlers de drag hacen `setPointerCapture` sólo cuando hay movimiento real, un arrastre suprime el click sintetizado; un tap sin movimiento dispara `onClick`/`onDoubleClick` normal. Es el mismo principio de `useDragMove`.

- [ ] **Step 2: Verificar que compila**

Run: `bunx tsc --noEmit`
Expected: **falla** en `src/App.tsx` porque todavía renderiza `<DesktopIcon>` con el shape viejo (sin `style`/`dragging`/`handlers`). Esto es esperado; se resuelve en Task 4. No commitear todavía si el árbol queda roto — este task se commitea junto con Task 4. Si preferís commits atómicos, saltá el commit acá y avanzá a Task 3.

---

## Task 3: `Amongus` acepta posición y handlers de drag (conserva easter-egg)

**Files:**
- Modify: `src/components/Amongus.tsx` (reemplazo completo)

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nuevo shape de props de `Amongus`:
  - `{ style: CSSProperties; dragging: boolean; handlers: { onPointerDown; onPointerMove; onPointerUp }; onSelect: () => void }`

- [ ] **Step 1: Reemplazar `src/components/Amongus.tsx` por completo**

```tsx
import { CSSProperties, PointerEvent as ReactPointerEvent, useState } from "react";
import { Howl } from "howler";
import { AmogusIcon, DeadIcon } from "src/images";

type DragHandlers = {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
};

type AmongusProps = {
  style: CSSProperties;
  dragging: boolean;
  handlers: DragHandlers;
  onSelect: () => void;
};

const Amongus = ({ style, dragging, handlers, onSelect }: AmongusProps) => {
  const [dead, setDead] = useState(false);
  const [clickCount, setCount] = useState(0);

  const handleClick = () => {
    onSelect();
    setCount((prev) => prev + 1);
    setDead(true);
    if (clickCount > 9) return alert("Para emocion ya lo hiciste pelota");
    const sound = new Howl({
      src: ["/static/sounds/killSoundEffect.mp3"],
      html5: true,
      volume: 0.1,
    });
    sound.play();
  };

  return (
    <button
      type="button"
      style={style}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      className={`xp-icon flex h-24 w-24 items-center justify-center ${
        dragging ? "xp-icon-dragging" : ""
      }`}
    >
      <div
        className="h-20 w-20"
        style={{
          backgroundImage: `${dead ? DeadIcon : AmogusIcon}`,
          backgroundSize: "5rem",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </button>
  );
};

export default Amongus;
```

> Nota: `AmogusIcon`/`DeadIcon` ya son strings `url(...)`, por eso `backgroundImage` los usa directo. El easter-egg (dead + sonido) sólo corre en un tap real; un arrastre lo suprime vía pointer capture, igual que en `DesktopIcon`.

- [ ] **Step 2: Verificar que compila**

Run: `bunx tsc --noEmit`
Expected: sigue **fallando** en `src/App.tsx` (renderiza `<Amongus/>` sin las nuevas props). Esperado; se resuelve en Task 4.

---

## Task 4: Cutover en `App.tsx` + `globals.css` (posición absoluta + drag conectado)

Esta es la tarea de integración: conecta el hook, mapea los datos y flipa el CSS del contenedor. `App.tsx` y `globals.css` **deben landear juntos** (el contenedor pasa a `relative` y los íconos a `absolute` a la vez), si no el escritorio queda roto a mitad de camino.

**Files:**
- Modify: `src/App.tsx` (reemplazo completo)
- Modify: `src/styles/globals.css` (bloque `.folderIcons` líneas 33-47; y agregar clases dentro de `@layer components`)

**Interfaces:**
- Consumes:
  - `useDesktopIcons(containerRef): DesktopIconsApi` (Task 1)
  - `DESKTOP_ICONS: DesktopIconDef[]`, `DesktopIconDef` (Task 1)
  - `DesktopIcon` con props `{ icon, label, selected, dragging, style, handlers, onSelect, onOpen }` (Task 2)
  - `Amongus` con props `{ style, dragging, handlers, onSelect }` (Task 3)
  - `useWindow().handleOpen: (e: { target: { title: string } }) => void`
- Produces: nada (hoja del árbol).

- [ ] **Step 1: Reemplazar `src/App.tsx` por completo**

```tsx
import { useRef } from "react";
import Amongus from "src/components/Amongus";
import DesktopIcon from "src/components/DesktopIcon";
import FullScreenButton from "src/components/FullScreenButton";
import TaskBar from "src/components/TaskBar";
import WindowsContainer from "src/components/Windows/WindowsContainer";
import useDesktopIcons from "src/hooks/useDesktopIcons";
import useWindow from "src/hooks/useWindow";
import { DESKTOP_ICONS, DesktopIconDef } from "src/lists/desktopIcons";
import { BG } from "src/images";

export default function App() {
  const { handleOpen } = useWindow();
  const containerRef = useRef<HTMLElement>(null);
  const desktop = useDesktopIcons(containerRef);

  const activate = (def: DesktopIconDef) => {
    switch (def.kind.type) {
      case "open-window":
        handleOpen({ target: { title: def.kind.title } });
        break;
      case "open-url":
        window.open(def.kind.href, "_blank");
        break;
      case "easter-egg":
        break; // el easter-egg se maneja dentro de <Amongus/>
    }
  };

  return (
    <div
      style={{ background: BG, backgroundSize: "cover" }}
      className="font-xp relative flex h-screen w-screen flex-col overflow-hidden"
      onClick={desktop.clearSelection}
    >
      <section
        ref={containerRef}
        className="folderIcons !overflow-hidden"
        onClick={desktop.clearSelection}
      >
        {DESKTOP_ICONS.map((def) => {
          const pos = desktop.getPos(def.id);
          const style = { left: pos.x, top: pos.y };
          const handlers = desktop.dragHandlers(def.id);
          const dragging = desktop.dragId === def.id;
          if (def.kind.type === "easter-egg") {
            return (
              <Amongus
                key={def.id}
                style={style}
                dragging={dragging}
                handlers={handlers}
                onSelect={() => desktop.select(def.id)}
              />
            );
          }
          return (
            <DesktopIcon
              key={def.id}
              icon={def.icon}
              label={def.label}
              selected={desktop.selected === def.id}
              dragging={dragging}
              style={style}
              handlers={handlers}
              onSelect={() => desktop.select(def.id)}
              onOpen={() => activate(def)}
            />
          );
        })}
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

- [ ] **Step 2: Editar `src/styles/globals.css` — reemplazar el bloque `.folderIcons` (líneas 33-47)**

Reemplazar:

```css
.folderIcons {
  display: grid;

  /* grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); */
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 76px), 1fr));
  text-align: center;
  align-items: start;
  grid-template-rows: repeat(auto-fill, minmax(min(100px, 50%), 1fr));
  justify-items: center;
  column-gap: min(2rem, 10%);
  padding: 1rem;
  row-gap: 1rem;
  height: 90%;
  overflow-y: auto;
}
```

Por:

```css
.folderIcons {
  position: relative;
  height: 90%;
  padding: 1rem;
  overflow: hidden;
}
```

- [ ] **Step 3: Editar `src/styles/globals.css` — agregar clases `.xp-icon` dentro de `@layer components`**

Justo después del bloque `.xp-icon-label { ... }` (que hoy termina en la línea 157, antes de la llave de cierre del `@layer` en la línea 158), agregar:

```css
  .xp-icon {
    position: absolute;
    touch-action: none;
    user-select: none;
  }
  .xp-icon-dragging {
    z-index: 50;
    opacity: 0.7;
  }
```

- [ ] **Step 4: Verificar que compila y buildea**

Run: `bunx tsc --noEmit && bun run build`
Expected: ambos OK, 0 errores. (Ahora `App.tsx` provee todas las props nuevas a `DesktopIcon`/`Amongus`.)

- [ ] **Step 5: QA visual en browser**

Run: `bun run dev` y abrir el escritorio. Verificar:
- Los 5 íconos (Curriculum, Proyectos, Redes sociales, Tecnologías, Amongus) aparecen apilados en la columna izquierda (layout default).
- **Arrastrar** cada ícono con el mouse: sigue el cursor con opacidad reducida (`.xp-icon-dragging`), y al soltar hace **snap** a una celda de grilla. Al soltar sobre una celda ocupada, cae en la celda libre más cercana (no se solapan).
- **Un click** selecciona (recuadro azul de `.xp-icon-selected`); click en el wallpaper deselecciona.
- **Doble-click** en Proyectos/Sociales/Tecnologías abre la ventana; en Curriculum abre el PDF en nueva pestaña.
- **Amongus**: un click (sin arrastrar) lo "mata" (cambia a dead + suena); arrastrarlo NO dispara el kill.
- Consola: 0 errores.

- [ ] **Step 6: Commit**

```bash
git add src/components/DesktopIcon.tsx src/components/Amongus.tsx src/App.tsx src/styles/globals.css
git commit -m "feat(desktop): free-position draggable desktop icons with snap-to-grid"
```

> Si en Task 2/3 no commiteaste (árbol roto), este commit incluye esos cambios también: `git add` ya los cubre.

---

## Task 5: Verificar persistencia y reset (localStorage)

La persistencia ya está implementada en el hook (Task 1). Este task la verifica de punta a punta y confirma el fallback a default y `resetLayout`.

**Files:**
- (Ninguno nuevo; verificación sobre `src/hooks/useDesktopIcons.ts` ya escrito.)

**Interfaces:**
- Consumes: `useDesktopIcons` + clave `localStorage["xp-desktop-icons@1"]`.
- Produces: nada.

- [ ] **Step 1: QA de persistencia**

Con `bun run dev` corriendo:
- Mover 2-3 íconos a posiciones distintas.
- **Recargar la página** (F5). Los íconos deben reaparecer en las posiciones donde quedaron (no en el default).
- En DevTools → Application → Local Storage, confirmar la clave `xp-desktop-icons@1` con un JSON tipo `{"cv":{"col":2,"row":1}, ...}`.

- [ ] **Step 2: QA de fallback a default**

- En la consola de DevTools: `localStorage.removeItem("xp-desktop-icons@1")` y recargar.
- Los íconos deben volver al **layout default** (columna izquierda). Esto también valida `resetLayout()` (misma lógica: borra la clave + `setLayout(defaultLayout())`).

- [ ] **Step 3: QA de robustez de schema**

- En consola: `localStorage.setItem("xp-desktop-icons@1", '{"basura":true,"cv":{"col":-5}}')` y recargar.
- No debe romper: `cv` (celda inválida) y la clave `basura` (id desconocido) se ignoran → todo cae a default. Consola 0 errores.

- [ ] **Step 4: Commit (si hiciste algún ajuste durante QA)**

Si la QA no requirió cambios, no hay commit nuevo; el hook ya se commiteó en Task 1. Si hubo un fix:

```bash
git add src/hooks/useDesktopIcons.ts
git commit -m "fix(desktop): harden desktop-icons localStorage hydration"
```

---

## Notas de integración con 3.1 (menú contextual)

`resetLayout()` está expuesto en `DesktopIconsApi` para que el ítem **3.1 "Organizar íconos"** lo invoque cuando se implemente. No forma parte de este plan (3.1 y 3.6 son independientes). Mientras 3.1 no exista, `resetLayout` se valida vía la QA del Task 5 (borrar la clave + recargar produce el mismo resultado).

## Fuera de alcance (confirmado en el spec §3.6)

- Drag por teclado.
- Multi-selección por marquee.
- Toggles persistidos "Auto organizar" / "Alinear a la grilla" (sólo el reset).
- Arrastrar íconos a la papelera/taskbar.
