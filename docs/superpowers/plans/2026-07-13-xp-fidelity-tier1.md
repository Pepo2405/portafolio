# Fidelidad XP "Luna" — Tier 1 (Chrome base) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Acercar el chrome del escritorio al tema Windows XP "Luna" (azul): fuente Tahoma, barra de título con gradiente + botones de caption glossy con ícono de ventana, marco de ventana azul, taskbar con gradiente CSS + área de notificación, y start button "orbe" verde.

**Architecture:** Cambio puramente visual, sin tocar la lógica de ventanas (drag/resize/focus/z-order/minimizar ya funciona). El hex/gradiente Luna vive en `src/styles/globals.css` (clases `@layer components` `.xp-*`) y un único token en `tailwind.config.js` (`luna.frame`, usado por una utilidad Tailwind); los componentes solo aplican clases. Se extrae un módulo compartido `src/lists/windows.ts` con el registry `WINDOW_META` (title→ícono) para que la barra de título y la taskbar consuman el mismo mapa.

**Tech Stack:** React 18.2, Vite 5, TypeScript 5, TailwindCSS 3.3, react-icons. Gestor: **bun** (`bun.lock`).

## Global Constraints

- **No hay framework de tests en el repo.** Verificación de cada task = `bunx tsc --noEmit` + `bun run lint` sin **errores** nuevos (los `warning` de `no-unused-vars` preexistentes en otros archivos son aceptables) + `bun run build` OK + chequeo visual con `bun run dev` (herramienta browser).
- **Gestor: bun.** Usar `bun`/`bunx`. No commitear otros lockfiles.
- **Trabajamos en `master`** (convención del repo; decisión del usuario en esta sesión). Cada commit acotado SOLO a los archivos de su task (no `git add -A`). **No hacer push** salvo pedido explícito del usuario.
- **El hex/gradiente vive en `globals.css` (clases `.xp-*`) o en `tailwind.config.js` (token), NUNCA inline en el JSX.** Los componentes aplican clases + layout Tailwind.
- **Solo utilidades Tailwind ya presentes + las clases `.xp-*` nuevas.** No agregar plugins de Tailwind.
- **NO cambiar la lógica de ventanas** (`WindowsContext`, drag/resize/minimize/focus/z-order) ni el comportamiento de la taskbar (toggle/estado activo/a11y ya implementados) — solo su apariencia.
- **Ventanas reales = exactamente `Proyectos`, `Sociales`, `Tecnologías`** (títulos EXACTOS, con tilde). Íconos bare para `<img src>`: Proyectos/Tecnologías → `/static/folderIcon.png`, Sociales → `/static/icons/redes.webp`.
- **Valores Luna:** los de abajo son fieles y funcionales; se pueden afinar en el QA visual contra `xp.css@0.2.6/dist/XP.css` (selectores `.title-bar`, `.title-bar-controls button`) o capturas reales, pero el código provisto es completo — no dejar placeholders.
- **A11y:** conservar `aria-label`/`title`/`focus-visible` ya presentes en los botones de caption y del start. Sentence case en español para textos nuevos.
- Rutas exactas siempre. Código completo en cada step.

---

## File Structure

- `tailwind.config.js` — token `colors.luna.frame` + `fontFamily.xp` (MODIFY — Task 1).
- `src/App.tsx` — aplicar `font-xp` al contenedor raíz (MODIFY — Task 1).
- `src/lists/windows.ts` — módulo compartido con `WINDOW_META` (CREATE — Task 2).
- `src/styles/globals.css` — clases `.xp-*` (título, caption, taskbar, tray, start) (MODIFY — Tasks 2 y 4).
- `src/components/Windows/TitleBar.tsx` — gradiente de título, botones glossy, ícono de ventana (MODIFY — Task 2).
- `src/components/Windows/draggable.tsx` — pasar ícono al TitleBar (Task 2) + marco de ventana (Task 3) (MODIFY).
- `src/components/TaskBar.tsx` — importar `WINDOW_META` compartido (Task 2) + taskbar/tray/start (Task 4) (MODIFY).

Orden de dependencias: **Task 1** primero (tokens + fuente, base de todo). Luego **Task 2** (crea `windows.ts`, del que depende la taskbar). **Task 3** y **Task 4** dependen solo de Task 1 y pueden ir en cualquier orden tras Task 2. Ejecución secuencial (varias tasks tocan `globals.css` / `draggable.tsx` / `TaskBar.tsx`).

---

### Task 1: Tokens Luna + fuente Tahoma

Agrega el token de color usado por JSX (`luna.frame`) y la familia tipográfica XP, y aplica Tahoma al escritorio entero.

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: utilidad `font-xp` (stack Tahoma) y color `luna.frame` (`#0831d9`) usable como `border-luna-frame`/`text-luna-frame`. Consumido por Tasks 2–4.

- [ ] **Step 1: Agregar token y fontFamily en `tailwind.config.js`**

Reemplazar el objeto `theme.extend` actual:

```js
  theme: {
    extend: {
      colors: {
        window: {
          bar: '#045aa5',
          barMuted: '#5b7488',
          brand: '#045aa5',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
```

por:

```js
  theme: {
    extend: {
      colors: {
        window: {
          bar: '#045aa5',
          barMuted: '#5b7488',
          brand: '#045aa5',
        },
        luna: {
          frame: '#0831d9',
        },
      },
      fontFamily: {
        xp: ['Tahoma', '"Trebuchet MS"', 'Verdana', '"DejaVu Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
```

> Nota: los gradientes multi-stop (título/taskbar/start) viven directo en `globals.css` (Tasks 2 y 4); el único color que el JSX usa como utilidad es `luna.frame` (marco de ventana, Task 3), por eso es el único token acá. YAGNI: no se agregan tokens que ningún componente usa como clase.

- [ ] **Step 2: Aplicar `font-xp` al contenedor raíz en `src/App.tsx`**

El `<div>` raíz actual:

```tsx
    <div
      style={{ background: BG, backgroundSize: "cover" }}
      className="h-screen w-screen overflow-hidden flex flex-col relative"
    >
```

pasa a incluir `font-xp` (Tailwind preflight hace que botones/inputs hereden la familia):

```tsx
    <div
      style={{ background: BG, backgroundSize: "cover" }}
      className="font-xp h-screen w-screen overflow-hidden flex flex-col relative"
    >
```

- [ ] **Step 3: Typecheck**

Run: `bunx tsc --noEmit`
Expected: sin salida, exit 0.

- [ ] **Step 4: Lint**

Run: `bun run lint`
Expected: exit 0 (warnings preexistentes OK, 0 errores).

- [ ] **Step 5: QA visual**

Run: `bun run dev`, abrir `http://localhost:5173`. Verificar que el texto del escritorio (íconos, título centrado, "Inicio", reloj) cambió de tipografía a Tahoma/Verdana/Trebuchet. Comparar con antes: la fuente se ve más condensada y "de sistema Windows". Sin errores en consola.

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.js src/App.tsx
git commit -m "feat(xp): token luna.frame + fuente Tahoma en el escritorio"
```

---

### Task 2: Chrome de ventana — barra de título + botones de caption + ícono

Barra de título con gradiente Luna, botones min/max/cerrar glossy (cerrar rojo, min/max azul) e ícono de la ventana a la izquierda del título. Extrae el registry `WINDOW_META` a un módulo compartido para no duplicar íconos entre taskbar y título.

**Files:**
- Create: `src/lists/windows.ts`
- Modify: `src/styles/globals.css`
- Modify: `src/components/Windows/TitleBar.tsx`
- Modify: `src/components/Windows/draggable.tsx`
- Modify: `src/components/TaskBar.tsx`

**Interfaces:**
- Consumes: `luna`/`font-xp` de Task 1.
- Produces: `export const WINDOW_META: Record<string, { icon: string }>` y `export type WindowMeta` en `src/lists/windows.ts`. `TitleBar` gana prop `icon?: string`. Clases `.xp-titlebar`, `.xp-titlebar--inactive`, `.xp-caption`, `.xp-caption-close`, `.xp-caption-blue` en globals.css.

- [ ] **Step 1: Crear `src/lists/windows.ts`**

```ts
export type WindowMeta = { icon: string };

// Ventanas reales del escritorio. La clave = title EXACTO que despachan
// Folder/Socials/Techs y que renderiza WindowsContainer. Íconos bare para <img src>.
export const WINDOW_META: Record<string, WindowMeta> = {
  Proyectos: { icon: "/static/folderIcon.png" },
  Sociales: { icon: "/static/icons/redes.webp" },
  Tecnologías: { icon: "/static/folderIcon.png" },
};
```

- [ ] **Step 2: `TaskBar.tsx` — usar el `WINDOW_META` compartido**

Eliminar el bloque local (líneas del comentario + `const WINDOW_META`):

```tsx
// Ventanas reales del escritorio: las únicas que pueden abrirse/minimizarse.
// La clave debe coincidir EXACTO con el title que despachan Folder/Socials/Techs.
const WINDOW_META: Record<string, { icon: string }> = {
  Proyectos: { icon: "/static/folderIcon.png" },
  Sociales: { icon: "/static/icons/redes.webp" },
  Tecnologías: { icon: "/static/folderIcon.png" },
};
```

y agregar el import (junto a los demás imports de arriba):

```tsx
import { WINDOW_META } from "src/lists/windows";
```

(El resto de `TaskBar.tsx` no cambia en esta task — sigue usando `WINDOW_META[title].icon` igual.)

- [ ] **Step 3: `globals.css` — clases de título y botones de caption**

Agregar al final de `src/styles/globals.css`:

```css
@layer components {
  .xp-titlebar {
    background: linear-gradient(
      to bottom,
      #0997ff 0%,
      #0053ee 8%,
      #0050ee 40%,
      #0060ff 88%,
      #0054e3 93%,
      #0052e2 96%,
      #061d9b 100%
    );
  }
  .xp-titlebar--inactive {
    background: linear-gradient(to bottom, #7ba0e0 0%, #6a8fd4 55%, #5c86cf 100%);
  }
  .xp-caption {
    border-radius: 3px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
  }
  .xp-caption-close {
    background: linear-gradient(
      to bottom,
      #f7a99f 0%,
      #e6604d 42%,
      #d83b28 55%,
      #cf3423 100%
    );
    border: 1px solid #a33420;
  }
  .xp-caption-blue {
    background: linear-gradient(
      to bottom,
      #5aa0ff 0%,
      #1f6fe0 45%,
      #0f57c8 55%,
      #0a4fbd 100%
    );
    border: 1px solid #0b3e9e;
  }
}
```

- [ ] **Step 4: `TitleBar.tsx` — botones glossy, gradiente, ícono**

(a) Reemplazar el `className` del `<button>` dentro de `WinBtn` (actual):

```tsx
      className={`flex h-7 w-9 items-center justify-center rounded text-white/90 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/80 ${
        danger ? "hover:bg-red-600" : "hover:bg-white/25"
      }`}
```

por:

```tsx
      className={`xp-caption flex h-[21px] w-[21px] items-center justify-center text-white outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/80 ${
        danger ? "xp-caption-close" : "xp-caption-blue"
      }`}
```

(b) Agregar `icon?: string` a la interfaz `Props` (después de `title: string;`):

```tsx
interface Props {
  title: string;
  icon?: string;
  active: boolean;
  dragging: boolean;
  draggable: boolean;
  full: boolean;
  showToggle: boolean;
  handlers: DragHandlers;
  onMinimize: () => void;
  onToggleFull: () => void;
  onClose: () => void;
}
```

(c) Agregar `icon` a la destructuración de parámetros de `TitleBar` (después de `title,`):

```tsx
export default function TitleBar({
  title,
  icon,
  active,
  dragging,
  draggable,
  full,
  showToggle,
  handlers,
  onMinimize,
  onToggleFull,
  onClose,
}: Props) {
```

(d) En el `<div>` de la barra de título, reemplazar la parte del `className` que pinta el fondo:

```tsx
      className={`handle flex h-9 shrink-0 select-none items-center justify-between gap-2 px-2 text-white transition-colors ${
        active ? "bg-window-bar" : "bg-window-barMuted"
      } ${
        !draggable ? "cursor-default" : dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
```

por (solo cambian las clases de fondo):

```tsx
      className={`handle flex h-9 shrink-0 select-none items-center justify-between gap-2 px-2 text-white transition-colors ${
        active ? "xp-titlebar" : "xp-titlebar--inactive"
      } ${
        !draggable ? "cursor-default" : dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
```

(e) Reemplazar el `<span>` del título:

```tsx
      <span className="truncate pl-1 text-sm font-medium">{title}</span>
```

por un contenedor con ícono + título en bold con sombra:

```tsx
      <div className="flex min-w-0 items-center gap-1.5 pl-1">
        {icon && <img src={icon} alt="" width={16} height={16} className="shrink-0" />}
        <span className="truncate text-sm font-bold [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
          {title}
        </span>
      </div>
```

- [ ] **Step 5: `draggable.tsx` — pasar el ícono al TitleBar**

(a) Agregar el import (junto a los demás de arriba del archivo):

```tsx
import { WINDOW_META } from "src/lists/windows";
```

(b) En el JSX, agregar la prop `icon` al `<TitleBar>` (después de `title={t}`):

```tsx
        <TitleBar
          title={t}
          icon={WINDOW_META[t]?.icon}
          active={active}
          dragging={dragging}
          draggable={!isFull}
          full={isFull}
          showToggle={!isMobile}
          handlers={handlers}
          onMinimize={() => handleMinimize({ target: { title: t } })}
          onToggleFull={() => setFull((p) => !p)}
          onClose={requestClose}
        />
```

- [ ] **Step 6: Typecheck**

Run: `bunx tsc --noEmit`
Expected: sin salida, exit 0. (Si falla por `WINDOW_META` no encontrado, revisar el path `src/lists/windows`.)

- [ ] **Step 7: Lint**

Run: `bun run lint`
Expected: exit 0, sin errores. Sin warnings nuevos en TitleBar.tsx / draggable.tsx / TaskBar.tsx.

- [ ] **Step 8: QA visual**

Run: `bun run dev`. Abrir una ventana (ícono Proyectos). Verificar:
- La barra de título tiene **gradiente azul** (no plano); una ventana no enfocada se ve azul apagado (no gris).
- El **ícono de la ventana** (carpeta) aparece a la izquierda del título; el título está en **bold con sombra**.
- Los botones min/max/cerrar son **glossy** (cerrar rojo, min/max azul), con glifo blanco; hover los aclara; el foco por teclado muestra el ring.
- Minimizar/restaurar/cerrar/maximizar siguen funcionando. Consola sin errores.

- [ ] **Step 9: Commit**

```bash
git add src/lists/windows.ts src/styles/globals.css src/components/Windows/TitleBar.tsx src/components/Windows/draggable.tsx src/components/TaskBar.tsx
git commit -m "feat(xp): barra de título con gradiente Luna, botones de caption glossy e ícono de ventana"
```

---

### Task 3: Marco de ventana Luna

Marco azul de 3px alrededor del cuerpo y esquinas superiores redondeadas (base recta), en vez de `rounded-lg` + `ring-black/10`.

**Files:**
- Modify: `src/components/Windows/draggable.tsx`

**Interfaces:**
- Consumes: token `luna.frame` (Task 1) vía utilidad `border-luna-frame`.

- [ ] **Step 1: Redondeo superior en el `<div>` root**

Reemplazar el `className` del `<div ref={rootRef}>` (actual):

```tsx
      className={isFull ? "" : `rounded-lg ${active ? "shadow-2xl" : "shadow-lg"}`}
```

por (solo cambia `rounded-lg` → `rounded-t-[8px]`):

```tsx
      className={isFull ? "" : `rounded-t-[8px] ${active ? "shadow-2xl" : "shadow-lg"}`}
```

- [ ] **Step 2: Marco azul en el `<Resizable>`**

Reemplazar su `className` (actual):

```tsx
        className={`flex h-full w-full flex-col overflow-hidden bg-white ${
          isFull ? "" : "rounded-lg ring-1 ring-black/10"
        }`}
```

por:

```tsx
        className={`flex h-full w-full flex-col overflow-hidden bg-white ${
          isFull ? "" : "rounded-t-[8px] border-x-[3px] border-b-[3px] border-luna-frame"
        }`}
```

- [ ] **Step 3: Typecheck**

Run: `bunx tsc --noEmit`
Expected: sin salida, exit 0.

- [ ] **Step 4: Lint**

Run: `bun run lint`
Expected: exit 0, sin errores nuevos.

- [ ] **Step 5: QA visual**

Run: `bun run dev`. Abrir una ventana. Verificar: la ventana tiene **marco azul (`#0831d9`) de ~3px** a los costados y abajo, **esquinas superiores redondeadas** y base recta; el cuerpo sigue blanco. En modo maximizado/mobile (`isFull`) no hay marco ni redondeo. Drag/resize siguen OK.

- [ ] **Step 6: Commit**

```bash
git add src/components/Windows/draggable.tsx
git commit -m "feat(xp): marco de ventana Luna (borde azul + esquinas superiores redondeadas)"
```

---

### Task 4: Taskbar con gradiente + área de notificación + start button orbe

Reemplaza la imagen de fondo de la taskbar por un gradiente CSS con línea de brillo superior, envuelve el reloj en un área de notificación (systray) recuadrada, y convierte el start button en un orbe verde glossy con "Inicio" bold itálico.

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/components/TaskBar.tsx`

**Interfaces:**
- Consumes: `font-xp` (Task 1). Produces: clases `.xp-taskbar`, `.xp-tray`, `.xp-start`.

- [ ] **Step 1: `globals.css` — clases de taskbar, tray y start**

Agregar dentro del bloque `@layer components { … }` existente (creado en Task 2), junto a las clases `.xp-*` de título:

```css
  .xp-taskbar {
    background: linear-gradient(
      to bottom,
      #2b88e0 0%,
      #2380e0 3%,
      #1f6fd6 6%,
      #1f6fd6 10%,
      #2069d6 12%,
      #2f7ce8 50%,
      #1c5cc9 88%,
      #14459f 100%
    );
    box-shadow: inset 0 1px 0 #59a6ff, inset 0 2px 1px rgba(255, 255, 255, 0.12);
  }
  .xp-tray {
    background: linear-gradient(to bottom, #16b1f3 0%, #1290e8 50%, #0f7fd6 100%);
    box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.35), -1px 0 0 #0b3e9e;
  }
  .xp-start {
    background: linear-gradient(
      to bottom,
      #4ab837 0%,
      #43a52f 6%,
      #3c9a2a 45%,
      #368e26 55%,
      #2f8420 92%,
      #3a9a2a 100%
    );
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
    border-radius: 0 12px 12px 0;
  }
  .xp-start:hover {
    filter: brightness(1.06);
  }
```

- [ ] **Step 2: `TaskBar.tsx` — nav con gradiente CSS**

(a) Quitar el import de `TaskBartGradient` (ya no se usa). La línea actual:

```tsx
import { TaskBartGradient, xpLogoIcon } from "src/images";
```

pasa a:

```tsx
import { xpLogoIcon } from "src/images";
```

(b) Reemplazar la apertura del `<nav>` (actual):

```tsx
    <nav
      style={{
        backgroundImage: TaskBartGradient,
        backgroundRepeat: "repeat-x",
      }}
      className="fixed inset-x-0 bottom-0 z-30 flex h-8 w-full justify-between pr-8"
    >
```

por (sin `style` inline, con clase `.xp-taskbar`, sin `pr-8` para que el tray llegue al borde):

```tsx
    <nav className="xp-taskbar fixed inset-x-0 bottom-0 z-30 flex h-8 w-full justify-between">
```

- [ ] **Step 3: `TaskBar.tsx` — start button orbe**

Reemplazar el `className` del `<button>` del Inicio (actual):

```tsx
            className="z-50 flex h-full items-center gap-2 rounded-r-md bg-[#52911e] px-2 pr-4 hover:brightness-110"
```

por:

```tsx
            className="xp-start z-50 flex h-full items-center gap-2 px-2 pr-4"
```

y reemplazar el texto suelto `Inicio` (justo después del `<img ... />{" "}`):

```tsx
            />{" "}
            Inicio
          </button>
```

por "Inicio" en bold itálico:

```tsx
            />{" "}
            <span className="font-bold italic">Inicio</span>
          </button>
```

- [ ] **Step 4: `TaskBar.tsx` — reloj dentro del área de notificación**

Reemplazar el `<span>` del reloj (actual):

```tsx
      <span className="flex shrink-0 items-center justify-center text-sm md:px-2">
        <DateTime />
      </span>
```

por (panel systray recuadrado):

```tsx
      <span className="xp-tray flex shrink-0 items-center justify-center px-3 text-sm text-white">
        <DateTime />
      </span>
```

- [ ] **Step 5: Typecheck**

Run: `bunx tsc --noEmit`
Expected: sin salida, exit 0.

- [ ] **Step 6: Lint**

Run: `bun run lint`
Expected: exit 0, sin errores. Sin warnings nuevos en TaskBar.tsx (en particular `TaskBartGradient` ya no debe quedar importado sin usar).

- [ ] **Step 7: QA visual**

Run: `bun run dev`. Verificar en la taskbar:
- Fondo con **gradiente azul** y una **línea de brillo** fina arriba (no la imagen anterior).
- El **start button** es un **orbe verde glossy** con esquina derecha redondeada, flag y "Inicio" en **bold itálico**; hover lo aclara; abre/cierra el menú igual que antes.
- El reloj está dentro de un **área de notificación** (azul más clara, con groove/borde a la izquierda) pegada al borde derecho.
- Abrir un par de ventanas: los botones de ventana siguen funcionando (toggle/estado activo). Consola sin errores.

- [ ] **Step 8: Commit**

```bash
git add src/styles/globals.css src/components/TaskBar.tsx
git commit -m "feat(xp): taskbar con gradiente Luna, área de notificación y start button orbe verde"
```

---

## Self-Review

**1. Cobertura del Tier 1 (spec §1.1–1.6):**
- 1.1 Fuente Tahoma → Task 1 (Steps 1–2). ✅
- 1.2 Barra de título gradiente + ícono + título bold → Task 2 (Steps 3–5). ✅
- 1.3 Botones de caption glossy (cerrar rojo, min/max azul) → Task 2 (Steps 3–4a). ✅
- 1.4 Marco de ventana Luna (borde azul + redondeo superior) → Task 3. ✅
- 1.5 Taskbar gradiente CSS + área de notificación → Task 4 (Steps 1, 2, 4). ✅
- 1.6 Start button orbe verde bold itálico → Task 4 (Steps 1, 3). ✅

**2. Placeholders:** ninguno; cada step trae el CSS/JSX completo y comandos con expected.

**3. Consistencia de tipos/nombres:**
- `WINDOW_META` (creado en `src/lists/windows.ts`, Task 2 Step 1) se consume en `TaskBar.tsx` (Task 2 Step 2) y en `draggable.tsx` (Task 2 Step 5) con el mismo shape `Record<string,{icon:string}>`. `WINDOW_META[t]?.icon` es `string | undefined` → coincide con la prop `icon?: string` de `TitleBar` (Task 2 Step 4b). ✅
- Clases `.xp-*`: `.xp-titlebar`/`.xp-titlebar--inactive`/`.xp-caption`/`.xp-caption-close`/`.xp-caption-blue` (Task 2) y `.xp-taskbar`/`.xp-tray`/`.xp-start` (Task 4) se definen en `globals.css` y se usan en TitleBar/TaskBar. Task 4 Step 1 agrega DENTRO del `@layer components` que crea Task 2 Step 3 (si se ejecuta Task 4 antes que Task 2, crear el bloque `@layer components { }`). Orden del plan: Task 2 antes que Task 4. ✅
- `border-luna-frame` (Task 3) depende del token `luna.frame` (Task 1). ✅
- `TaskBartGradient` se importa hoy solo para el `style` del nav; Task 4 Step 2 lo remueve del `style` y del import a la vez → sin import colgante. ✅

**4. Riesgos / notas:**
- La fuente Tahoma depende del SO; si no está, cae a Verdana/Trebuchet (aceptado en el spec). El QA de Task 1 valida el cambio, no la presencia exacta de Tahoma.
- Los valores de gradiente son fieles pero afinables en QA contra `xp.css`/capturas reales; no bloquean.
- Fuera de alcance de este plan (Tier 2+): menú Inicio de 2 columnas, selección azul XP, selección de íconos del escritorio, y las mejoras de foco del menú.
