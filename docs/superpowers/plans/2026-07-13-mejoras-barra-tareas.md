# Mejoras Barra de Tareas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernizar la barra de tareas (`TaskBar.tsx`) del portfolio estilo Windows XP: eliminar bugs de correctitud, hacer que refleje el estado real de las ventanas con toggle minimizar/restaurar y resaltado de la ventana activa, y volverla accesible (teclado + touch + ARIA).

**Architecture:** Cambio acotado al front, sin tocar el mecanismo de ventanas (`WindowsContext`). La taskbar deja de leer una lista estática de proyectos (mayormente links externos que nunca son ventanas) y pasa a derivar los botones de un registry de las 3 ventanas reales del escritorio (`Proyectos`, `Sociales`, `Tecnologías`), cruzado con el estado del contexto (`visibleItems` / `minimizedItems` / `focused`). El menú Inicio pasa de hover-only (CSS) a click-toggle controlado por estado, con cierre por click-afuera y `Escape`. El reloj suma la fecha completa como tooltip.

**Tech Stack:** React 18.2, TypeScript 5, Vite 5, TailwindCSS 3.3, react-icons. Gestor de paquetes: **bun** (`bun.lock`). Sin librería de estado extra.

## Global Constraints

- **No hay framework de tests en el repo.** No agregar Jest/Vitest/RTL (fuera de alcance). La verificación de cada task es: `bunx tsc --noEmit` (typecheck) + `bun run lint` sin **errores** nuevos (los `warning` de `no-unused-vars` no rompen el build) + chequeo visual con `bun run dev` usando la herramienta browser.
- **Gestor de paquetes: bun.** El repo tiene `bun.lock`. Usar `bun` / `bunx` (comandos abajo lo asumen). No commitear otros lockfiles.
- **Ventanas reales = exactamente 3:** `Proyectos`, `Sociales`, `Tecnologías`. Son las únicas abiertas por los íconos del escritorio (`Folder.tsx`, `Socials.tsx`, `Techs.tsx`) y renderizadas como `DraggableWin` en `WindowsContainer.tsx`. Los strings de `title` deben coincidir EXACTO (con tilde: `Tecnologías`). NO agregar los proyectos de `proyects.json` (son `type: "link"`, abren en pestaña nueva, nunca son ventanas).
- **Íconos (rutas bare para `<img src>`):** `Proyectos` → `/static/folderIcon.png`, `Sociales` → `/static/icons/redes.webp`, `Tecnologías` → `/static/folderIcon.png`. (Los exports de `src/images.ts` vienen envueltos en `url(...)` y NO sirven para `<img src>`; usar las rutas string directas.)
- **Estilos:** solo utilidades Tailwind ya presentes en el repo y la paleta/clases XP existentes (`shadowText`, `#52911e`, gradiente `TaskBartGradient`). No agregar plugins ni config de Tailwind.
- **Links externos:** siempre `target="_blank"` + `rel="noreferrer"`.
- **No tocar `src/context/WindowsContext.tsx`.** El estado inicial legacy (`Mochify`, `Mochi Draw`) queda como está; el registry de la taskbar lo ignora naturalmente. Mencionar como nota, no arreglar.
- **Commits:** crear branch `feat/taskbar-mejoras` antes del primer commit. No hacer push salvo que el usuario lo pida. El repo commitea en `master`.
- **Rutas exactas** siempre. El código de cada step está completo — sin placeholders.

---

## File Structure

- `src/components/TaskBar.tsx` — reescritura del componente: registry de ventanas, lista derivada del contexto, toggle minimizar/restaurar, resaltado activo, botones accesibles, menú Inicio click-toggle. (MODIFY — Task 1 y Task 2)
- `src/components/dateTime.tsx` — sumar tooltip con fecha completa. (MODIFY — Task 3)

Orden de dependencias: **Task 1 → Task 2** (ambas editan `TaskBar.tsx`, Task 2 construye sobre Task 1). **Task 3** es independiente (otro archivo) y puede hacerse en cualquier momento.

**Contexto de contrato (de `src/context/WindowsContext.tsx`, NO modificar) — firmas que consume la taskbar:**

```ts
interface WindowsContextValue {
  visibleItems: Record<string, boolean>;   // true = la ventana está a la vista
  minimizedItems: Record<string, boolean>; // true mientras la ventana esté abierta (a la vista o minimizada); false al cerrar
  focused: string | null;                   // title de la ventana enfocada
  handleMaximize: (e: { target: { title: string } }) => void; // visible=true + enfoca
  handleMinimize: (e: { target: { title: string } }) => void; // visible=false, minimized=true, desenfoca
  // ...otros no usados por la taskbar
}
```

Semántica clave (verificada en el código del contexto): al abrir una ventana `visible=true` y `minimized=true`; al minimizar `visible=false` y `minimized=true`; al cerrar ambos `false`. Por eso `minimizedItems[title]` funciona como "está abierta" y `visibleItems[title]` distingue "a la vista" vs "minimizada".

---

### Task 1: Lista de ventanas real + toggle + estado activo + accesibilidad

Reemplaza el origen de datos de la taskbar (array estático con links externos y **sin `Tecnologías`**) por un registry de las 3 ventanas reales cruzado con el estado del contexto. Agrega toggle minimizar/restaurar, resaltado de la ventana enfocada, y convierte los `<div onClick>` en `<button>` accesibles con key estable y un único handler tipado. **No toca la sección del menú Inicio** (queda igual hasta Task 2).

**Files:**
- Modify: `src/components/TaskBar.tsx`

**Interfaces:**
- Consumes: del contexto `visibleItems`, `minimizedItems`, `focused`, `handleMaximize`, `handleMinimize` (firmas en "Contexto de contrato" arriba).
- Produces: `const WINDOW_META: Record<string, { icon: string }>`, `const openWindows: string[]`, `const onTaskClick: (title: string) => void`. Task 2 no depende de estos (edita otra región), pero comparten el archivo.

- [ ] **Step 1: Reemplazar el bloque de imports y los consts de módulo**

Bloque actual a reemplazar (parte superior del archivo, desde `import React ...` hasta el cierre del const `socials`):

```tsx
import React from "react";
import { SocialsICon, TaskBartGradient, xpLogoIcon } from "src/images";
import list from "src/lists/taskList.json";
import TaskItems from "src/lists/proyects.json";
import DateTime from "./dateTime";
import useWindow from "src/hooks/useWindow";

type Props = {};
const folder = {
  title: "Proyectos",
  url: "https://github.com/pepo2405",
  icon: "/static/folderIcon.png",
  target: "_blank",
};
const socials = {
  title: "Sociales",
  url: "",
  icon: `/static/icons/redes.webp`,
  target: "_blank",
};
```

Nuevo (deja `import React` fuera; mantiene `type Props` y el resto SIN tocar porque el menú Inicio todavía los usa — se limpian en Task 2). Resultado:

```tsx
import React from "react";
import { TaskBartGradient, xpLogoIcon } from "src/images";
import list from "src/lists/taskList.json";
import DateTime from "./dateTime";
import useWindow from "src/hooks/useWindow";

type Props = {};

// Ventanas reales del escritorio: las únicas que pueden abrirse/minimizarse.
// La clave debe coincidir EXACTO con el title que despachan Folder/Socials/Techs.
const WINDOW_META: Record<string, { icon: string }> = {
  Proyectos: { icon: "/static/folderIcon.png" },
  Sociales: { icon: "/static/icons/redes.webp" },
  Tecnologías: { icon: "/static/folderIcon.png" },
};
```

Cambios: se eliminan los imports `SocialsICon` (ya estaba sin usar) y `TaskItems` (proyects.json) y los consts `folder`/`socials`; se agrega `WINDOW_META`.

- [ ] **Step 2: Actualizar la firma del componente y el destructuring del contexto**

Bloque actual a reemplazar:

```tsx
const TaskBar = (props: Props) => {
  const { items: Tasks } = list;
  const windows = [socials, folder, ...TaskItems.proyects];
  const { minimizedItems, handleMaximize } = useWindow();

  function uniqueID() {
    return String(Math.floor(Math.random() * Date.now()));
  }
```

Nuevo (agrega `visibleItems`, `focused`, `handleMinimize`; elimina el array `windows`; deriva `openWindows` y define `onTaskClick`; **mantiene `uniqueID` porque el menú Inicio aún lo usa hasta Task 2**):

```tsx
const TaskBar = (props: Props) => {
  const { items: Tasks } = list;
  const {
    visibleItems,
    minimizedItems,
    focused,
    handleMaximize,
    handleMinimize,
  } = useWindow();

  function uniqueID() {
    return String(Math.floor(Math.random() * Date.now()));
  }

  // Una ventana aparece en la taskbar mientras siga abierta (a la vista o minimizada).
  const openWindows = Object.keys(WINDOW_META).filter(
    (title) => minimizedItems[title]
  );

  const onTaskClick = (title: string) => {
    // Enfocada y a la vista → minimizar; en cualquier otro caso restaurar + enfocar.
    if (visibleItems[title] && focused === title) {
      handleMinimize({ target: { title } });
    } else {
      handleMaximize({ target: { title } });
    }
  };
```

- [ ] **Step 3: Corregir el `<nav>` (ancho responsive) y reemplazar la lista de ventanas**

En el `<nav>`, reemplazar `className="w-screen md:w-full h-8 fixed bottom-0 flex z-30 justify-between pr-8"` por:

```tsx
className="fixed inset-x-0 bottom-0 z-30 flex h-8 w-full justify-between pr-8"
```

(`w-screen` = 100vw genera scroll horizontal por el ancho de la scrollbar; `inset-x-0 w-full` lo evita.)

Luego, reemplazar TODO el bloque `<div>` de la lista de ventanas (el que arranca en `<div className="-ml-4 grow flex ...">` y contiene `{windows.map(...)}`, hasta su `</div>` de cierre) por:

```tsx
        <div className="flex h-full min-w-0 grow items-center gap-1 overflow-x-auto pl-2">
          {openWindows.map((title) => {
            const active = focused === title;
            return (
              <button
                type="button"
                key={title}
                title={title}
                aria-label={title}
                aria-pressed={active}
                onClick={() => onTaskClick(title)}
                className={`shadowText relative z-50 flex h-full w-auto shrink-0 items-center justify-center gap-2 px-3 text-sm text-white transition-colors md:w-40 md:max-w-[40vw] md:justify-start ${
                  active ? "bg-blue-800/70 shadow-inner" : "hover:bg-blue-600/60"
                }`}
              >
                <img
                  alt=""
                  width={18}
                  height={18}
                  src={WINDOW_META[title].icon}
                  className="shrink-0"
                />
                <span className="hidden truncate md:block">{title}</span>
              </button>
            );
          })}
        </div>
```

Cambios respecto del original: key estable (`title`, no `uniqueID()`); un solo `<button>` accesible (antes `<div>`/`<img>`/`<span>` con 3 `onClick` redundantes y `title` duplicado); handler único tipado `onTaskClick(title)` (antes `handleMaximize as any` que dependía del atributo HTML `title` del target del evento); resaltado `aria-pressed`/`bg-blue-800/70` para la ventana enfocada; ancho fijo con truncado en desktop (`md:w-40 md:max-w-[40vw]` + `truncate`) en vez de `grow`; ícono-only en mobile.

- [ ] **Step 4: Typecheck**

Run: `bunx tsc --noEmit`
Expected: PASS (sin errores). Si aparece un error por `Tasks`/`uniqueID` no usados, es imposible: el menú Inicio todavía los usa en esta task.

- [ ] **Step 5: Lint**

Run: `bun run lint`
Expected: exit 0. Puede haber `warning` de `no-unused-vars` (p. ej. `React`, `props`) — son warnings esperados que se limpian en Task 2; NO deben ser errores.

- [ ] **Step 6: QA en browser**

```bash
bun run dev
```

Con la herramienta browser abrir `http://localhost:5173` y verificar:
1. En el escritorio, click en el ícono **Proyectos** → abre la ventana y aparece su botón en la taskbar.
2. Click en el ícono **Tecnologías** → abre y **aparece su botón en la taskbar** (antes no aparecía: bug corregido).
3. Click en el ícono **Sociales** → abre y aparece su botón.
4. El botón de la ventana enfocada se ve resaltado (fondo azul `bg-blue-800/70`, `shadow-inner`); al enfocar otra ventana, el resaltado se mueve.
5. Click en el botón de la ventana **enfocada** → la ventana se **minimiza** (desaparece de la vista, el botón queda en la taskbar sin resaltar).
6. Click en el botón de una ventana **minimizada** → se **restaura** y queda enfocada.
7. Click en el botón de una ventana visible **no enfocada** → pasa al frente (se enfoca).
8. Cerrar una ventana (X del titlebar) → su botón desaparece de la taskbar.
9. Con teclado: `Tab` llega a los botones de la taskbar y `Enter`/`Espacio` los activa (ahora son `<button>`).
10. Sin errores en la consola del navegador.

- [ ] **Step 7: Commit**

```bash
git checkout -b feat/taskbar-mejoras
git add src/components/TaskBar.tsx
git commit -m "feat(taskbar): lista de ventanas real con toggle minimizar/restaurar, estado activo y botones accesibles"
```

---

### Task 2: Menú Inicio accesible + limpieza final

Convierte el menú Inicio de hover-only (`hidden group-hover:flex`, inusable en touch, sin teclado, sin cierre) a un menú controlado por estado: abre/cierra con click, cierra con click-afuera y `Escape`, con atributos ARIA. Corrige el anidado inválido (un `<div>` con `<a>` dentro de un `<button>`) moviendo el popup a hermano del botón. Da key estable a los items del menú y elimina el código muerto restante (`import React`, `type Props`, `props`, `uniqueID`).

**Files:**
- Modify: `src/components/TaskBar.tsx`

**Interfaces:**
- Consumes: `Tasks` (de `list.items`), ya presente. Hooks de React `useState`, `useEffect`, `useRef`.
- Produces: estado local `startOpen` + ref `startRef`; sin API pública nueva.

- [ ] **Step 1: Ajustar imports y quitar `type Props` / `uniqueID`**

Reemplazar la línea `import React from "react";` por:

```tsx
import { useEffect, useRef, useState } from "react";
```

Eliminar la línea `type Props = {};`.

- [ ] **Step 2: Firma del componente, estado del menú y efecto de cierre**

Reemplazar `const TaskBar = (props: Props) => {` por `const TaskBar = () => {`.

Eliminar la función `uniqueID` (ya nadie la usa tras este step).

Justo después del bloque `const { visibleItems, ... } = useWindow();`, insertar el estado y el efecto (antes de `const openWindows = ...`):

```tsx
  const [startOpen, setStartOpen] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú Inicio al clickear afuera o presionar Escape.
  useEffect(() => {
    if (!startOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setStartOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStartOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [startOpen]);
```

- [ ] **Step 3: Reescribir la región del botón Inicio + popup**

Reemplazar TODO el `<button ...>` del Inicio (el que arranca con `<button className="px-2 h-full  z-50 flex items-center bg-[#52911e] ...">`, contiene el popup `hidden group-hover:flex ...` con `{Tasks.map(...)}`, el `<img ... src={xpLogoIcon} />` y el texto `Inicio`, hasta su `</button>` de cierre) por:

```tsx
        <div ref={startRef} className="relative h-full">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={startOpen}
            onClick={() => setStartOpen((v) => !v)}
            className="z-50 flex h-full items-center gap-2 rounded-r-md bg-[#52911e] px-2 pr-4 hover:brightness-110"
          >
            <img
              width={20}
              height={20}
              alt="Inicio"
              src={xpLogoIcon}
              className="min-w-fit shadow-xl"
            />{" "}
            Inicio
          </button>

          {startOpen && (
            <div
              role="menu"
              className="absolute bottom-full left-0 flex h-80 w-72 flex-col items-start justify-between rounded-t-sm bg-white shadow-2xl"
            >
              <header className="flex h-8 w-full items-center rounded-t-sm bg-blue-500 pl-4 text-left font-semibold text-white">
                Hablemos
              </header>
              <div className="flex w-full grow flex-col">
                {Tasks.map(({ title, href, icon }: any) => (
                  <a
                    key={title}
                    role="menuitem"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setStartOpen(false)}
                    className="flex w-full justify-start hover:bg-gray-400/50"
                  >
                    <span className="flex w-full items-center p-4 text-black">
                      <img
                        alt=""
                        width={20}
                        height={20}
                        src={icon}
                        className="mx-2"
                      />
                      {title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
```

Cambios: popup controlado por `startOpen` (no CSS hover) → funciona en touch; posicionado con `bottom-full left-0` (arriba del botón) en vez del hack `-top-[20rem]`; popup como **hermano** del `<button>` (no anidado dentro → HTML válido); `aria-haspopup`/`aria-expanded`; items con `key={title}` estable (no `uniqueID()`), `role="menuitem"`, `rel="noreferrer"`, y cierre del menú al elegir un link; se elimina el `{...props}` muerto.

- [ ] **Step 4: Verificar el archivo final completo**

Tras los steps anteriores, `src/components/TaskBar.tsx` debe quedar EXACTAMENTE así:

```tsx
import { useEffect, useRef, useState } from "react";
import { TaskBartGradient, xpLogoIcon } from "src/images";
import list from "src/lists/taskList.json";
import DateTime from "./dateTime";
import useWindow from "src/hooks/useWindow";

// Ventanas reales del escritorio: las únicas que pueden abrirse/minimizarse.
// La clave debe coincidir EXACTO con el title que despachan Folder/Socials/Techs.
const WINDOW_META: Record<string, { icon: string }> = {
  Proyectos: { icon: "/static/folderIcon.png" },
  Sociales: { icon: "/static/icons/redes.webp" },
  Tecnologías: { icon: "/static/folderIcon.png" },
};

const TaskBar = () => {
  const { items: Tasks } = list;
  const {
    visibleItems,
    minimizedItems,
    focused,
    handleMaximize,
    handleMinimize,
  } = useWindow();
  const [startOpen, setStartOpen] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú Inicio al clickear afuera o presionar Escape.
  useEffect(() => {
    if (!startOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setStartOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStartOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [startOpen]);

  // Una ventana aparece en la taskbar mientras siga abierta (a la vista o minimizada).
  const openWindows = Object.keys(WINDOW_META).filter(
    (title) => minimizedItems[title]
  );

  const onTaskClick = (title: string) => {
    // Enfocada y a la vista → minimizar; en cualquier otro caso restaurar + enfocar.
    if (visibleItems[title] && focused === title) {
      handleMinimize({ target: { title } });
    } else {
      handleMaximize({ target: { title } });
    }
  };

  return (
    <nav
      style={{
        backgroundImage: TaskBartGradient,
        backgroundRepeat: "repeat-x",
      }}
      className="fixed inset-x-0 bottom-0 z-30 flex h-8 w-full justify-between pr-8"
    >
      <section className="flex h-full min-w-0 items-center">
        <div ref={startRef} className="relative h-full">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={startOpen}
            onClick={() => setStartOpen((v) => !v)}
            className="z-50 flex h-full items-center gap-2 rounded-r-md bg-[#52911e] px-2 pr-4 hover:brightness-110"
          >
            <img
              width={20}
              height={20}
              alt="Inicio"
              src={xpLogoIcon}
              className="min-w-fit shadow-xl"
            />{" "}
            Inicio
          </button>

          {startOpen && (
            <div
              role="menu"
              className="absolute bottom-full left-0 flex h-80 w-72 flex-col items-start justify-between rounded-t-sm bg-white shadow-2xl"
            >
              <header className="flex h-8 w-full items-center rounded-t-sm bg-blue-500 pl-4 text-left font-semibold text-white">
                Hablemos
              </header>
              <div className="flex w-full grow flex-col">
                {Tasks.map(({ title, href, icon }: any) => (
                  <a
                    key={title}
                    role="menuitem"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setStartOpen(false)}
                    className="flex w-full justify-start hover:bg-gray-400/50"
                  >
                    <span className="flex w-full items-center p-4 text-black">
                      <img
                        alt=""
                        width={20}
                        height={20}
                        src={icon}
                        className="mx-2"
                      />
                      {title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex h-full min-w-0 grow items-center gap-1 overflow-x-auto pl-2">
          {openWindows.map((title) => {
            const active = focused === title;
            return (
              <button
                type="button"
                key={title}
                title={title}
                aria-label={title}
                aria-pressed={active}
                onClick={() => onTaskClick(title)}
                className={`shadowText relative z-50 flex h-full w-auto shrink-0 items-center justify-center gap-2 px-3 text-sm text-white transition-colors md:w-40 md:max-w-[40vw] md:justify-start ${
                  active ? "bg-blue-800/70 shadow-inner" : "hover:bg-blue-600/60"
                }`}
              >
                <img
                  alt=""
                  width={18}
                  height={18}
                  src={WINDOW_META[title].icon}
                  className="shrink-0"
                />
                <span className="hidden truncate md:block">{title}</span>
              </button>
            );
          })}
        </div>
      </section>

      <span className="flex shrink-0 items-center justify-center text-sm md:px-2">
        <DateTime />
      </span>
    </nav>
  );
};

export default TaskBar;
```

- [ ] **Step 5: Typecheck**

Run: `bunx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Lint**

Run: `bun run lint`
Expected: exit 0 y **sin warnings de `no-unused-vars` en TaskBar.tsx** (ya no quedan `React`/`props`/`uniqueID` sin usar). El hook `react-hooks/exhaustive-deps` no debe quejarse del efecto (`[startOpen]` es la dep correcta; `setStartOpen` y `startRef` son estables).

- [ ] **Step 7: QA en browser**

```bash
bun run dev
```

Con la herramienta browser en `http://localhost:5173` verificar:
1. Click en **Inicio** → abre el menú "Hablemos" con Github/Linkedin/Correo.
2. Segundo click en **Inicio** → cierra el menú.
3. Con el menú abierto, click **fuera** del menú → cierra.
4. Con el menú abierto, tecla **Escape** → cierra.
5. Click en un link del menú → abre en pestaña nueva y el menú se cierra.
6. Teclado: `Tab` enfoca el botón Inicio, `Enter`/`Espacio` lo abre; `Tab` recorre los links.
7. En viewport mobile (p. ej. 390px) el menú Inicio funciona con tap (no depende de hover).
8. Sin errores/warnings en la consola del navegador (en particular, ningún warning de React sobre keys).

- [ ] **Step 8: Commit**

```bash
git add src/components/TaskBar.tsx
git commit -m "feat(taskbar): menú Inicio accesible con click-toggle, cierre por Escape/click-afuera y limpieza de código muerto"
```

---

### Task 3: Reloj con fecha en tooltip

Suma la fecha completa localizada como `title` (tooltip nativo) del reloj, sin cambiar el formato visible `HH:MM`.

**Files:**
- Modify: `src/components/dateTime.tsx`

**Interfaces:**
- Consumes: nada nuevo. Produces: nada público.

- [ ] **Step 1: Reescribir `dateTime.tsx`**

Reemplazar el contenido completo de `src/components/dateTime.tsx` por:

```tsx
import { useState, useEffect } from "react";

function DateTime() {
  const [date, setDate] = useState(new Date());
  const hora = `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  useEffect(() => {
    const intervalID = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(intervalID);
  }, []);
  const formatoHora = `${hora} `;
  const fechaLarga = date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <p
      title={fechaLarga}
      className="cursor-default font-bold whitespace-nowrap"
      style={{ filter: "drop-shadow(0px 0px 1px black)" }}
    >
      {formatoHora}
    </p>
  );
}

export default DateTime;
```

Cambios: se agrega `title={fechaLarga}` (tooltip con "lunes, 13 de julio de 2026") y `cursor-default`; se quita el `import React` innecesario (`jsx: "react-jsx"`). El intervalo y el formato visible quedan igual (fuera de alcance optimizar el re-render por segundo).

- [ ] **Step 2: Typecheck**

Run: `bunx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `bun run lint`
Expected: exit 0, sin warnings nuevos.

- [ ] **Step 4: QA en browser**

```bash
bun run dev
```

En `http://localhost:5173`, pasar el mouse sobre el reloj (abajo a la derecha) → aparece el tooltip con la fecha completa en español. La hora sigue mostrándose como `HH:MM`.

- [ ] **Step 5: Commit**

```bash
git add src/components/dateTime.tsx
git commit -m "feat(taskbar): tooltip con fecha completa en el reloj"
```

---

## Self-Review

**1. Cobertura de la propuesta (bugs + toggle + a11y):**
- Bug key aleatoria (`uniqueID` como `key`) → Task 1 Step 3 (lista ventanas, `key={title}`) + Task 2 Step 3 (menú Inicio, `key={title}`). ✅
- Bug `handleMaximize as any` frágil → Task 1 Step 2/3 (`onTaskClick(title)` tipado, handler único). ✅
- Bug código muerto (`type Props`, `{...props}`, `import React`) → Task 2 Steps 1–3. ✅
- Bug lista muerta / `Tecnologías` ausente → Task 1 Steps 1–3 (`WINDOW_META` con las 3 ventanas). ✅
- Toggle minimizar/restaurar + estado activo → Task 1 Step 2/3 (`onTaskClick`, `aria-pressed`, resaltado). ✅
- Menú Inicio accesible (click/teclado/touch/Esc/click-afuera) → Task 2 Steps 2–3. ✅
- a11y `<button>` + labels → Task 1 Step 3 + Task 2 Step 3. ✅
- Polish ancho/truncado + `w-screen`→`inset-x-0` → Task 1 Step 3. ✅
- Reloj fecha (extra ofrecido) → Task 3. ✅

**2. Placeholders:** ninguno; todos los steps muestran código completo o comandos exactos con expected.

**3. Consistencia de tipos/nombres:** `WINDOW_META` (Task 1) se usa en `openWindows` y en `WINDOW_META[title].icon` (Task 1 Step 3). `onTaskClick(title: string)` definido en Task 1 Step 2 y llamado en Step 3. `handleMinimize`/`handleMaximize` reciben `{ target: { title } }` — coincide con `WindowsContextValue`. El archivo final de Task 2 Step 4 integra ambas tasks sin nombres huérfanos (no quedan `uniqueID`, `Props`, `props`, `React`, `folder`, `socials`, `TaskItems`, `SocialsICon`, `windows`).

**4. Nota (no-goal):** el estado inicial legacy `Mochify`/`Mochi Draw` en `WindowsContext.tsx` queda sin tocar; el registry lo ignora porque itera solo `Object.keys(WINDOW_META)`. Si en el futuro se agregan ventanas reales, sumar su `title`+icono a `WINDOW_META`.
