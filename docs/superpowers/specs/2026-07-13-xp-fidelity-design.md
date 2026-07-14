# Fidelidad Windows XP "Luna" — Diseño

**Fecha:** 2026-07-13
**Proyecto:** portafolio (React 18 + Vite + TypeScript + TailwindCSS, escritorio estilo Windows XP)
**Commit base:** 4310854

## Objetivo

Hoy el escritorio tiene la *idea* de Windows XP (wallpaper Bliss, ventanas azules, taskbar con "Inicio", reloj) pero el chrome es **genérico moderno**: barra de título plana `#045aa5` sin gradiente, ventanas `rounded-lg` con `ring-black/10`, botones de caption con iconos `react-icons` en cuadraditos, start button verde plano, y **fuente del sistema** (no Tahoma).

Meta: acercar el look al tema **"Luna" (azul)** real de XP mediante 3 tiers incrementales, sin cambiar el mecanismo de ventanas (drag/resize/focus/z-order/minimize ya funciona). Cada tier deja el sitio funcionando y es entregable por separado.

## Alcance

- **Tier 1** (chrome base): fuente Tahoma, gradiente de barra de título + botones de caption glossy, frame de ventana Luna, taskbar con gradiente CSS + área de notificación, start button "orbe" verde.
- **Tier 2** (piezas icónicas): menú Inicio de 2 columnas, resaltado de selección azul XP en menús/listas, selección de íconos del escritorio.
- **Tier 3** (flavor, opcional): menú contextual del escritorio, sonidos XP, pantalla de boot/login, cursores XP, globos de notificación.

### Fuera de alcance

- Mecanismo de ventanas (drag, resize, z-order, minimizar/restaurar, mobile) — ya implementado, no se toca su lógica; solo su apariencia (bordes/título).
- Contenido de las ventanas (Proyectos/Sociales/Tecnologías) y su data.
- La barra de tareas a nivel comportamiento (toggle/estado activo/a11y) — ya implementada; Tier 1 solo cambia su **apariencia**.
- Backend/deploy.

## Decisiones globales

### Dónde viven los estilos

Regla: **el hex/gradiente Luna vive en `tailwind.config.js` (tokens) y en `src/styles/globals.css` (clases `@layer components` `.xp-*`), nunca hardcodeado inline en los componentes.** Los componentes solo aplican clases (`className="xp-titlebar"`, `bg-luna-selection`, etc.) + layout Tailwind. Esto mantiene los componentes limpios y centraliza la paleta.

### Tokens de color (nuevos en `tailwind.config.js` → `theme.extend.colors`)

```js
luna: {
  frame:       '#0831d9', // marco/borde exterior de ventana
  titleFrom:   '#0997ff',
  titleMid:    '#0050ee',
  titleTo:     '#061d9b',
  titleInactiveFrom: '#7ba0e0',
  titleInactiveTo:   '#5c86cf',
  taskbarFrom: '#2b88e0',
  taskbarMid:  '#1f6fd6',
  taskbarTo:   '#14459f',
  taskbarHi:   '#59a6ff', // línea de brillo superior de la taskbar
  tray:        '#0f8ceb', // área de notificación (más clara)
  startFrom:   '#4ab837',
  startMid:    '#3c9a2a',
  startTo:     '#2f8420',
  selection:   '#316ac5', // resaltado de selección/hover (texto blanco)
  menuHeader:  '#0a5ad4', // header del menú Inicio
  menuRight:   '#d3e5fa', // panel derecho (celeste) del menú Inicio
},
```

> **Valores pixel-exactos:** para barra de título y botones de caption, **levantar los gradientes exactos de `xp.css@0.2.6/dist/XP.css`** (selectores `.title-bar` y `.title-bar-controls button`) en implementación. `xp.css` NO incluye taskbar ni start menu (no son parte de la librería) → esos usan los valores de este spec, ajustables visualmente contra capturas reales de XP.

### Fuente

- Stack: `Tahoma, "Trebuchet MS", Verdana, "DejaVu Sans", sans-serif`. Agregar como `theme.extend.fontFamily.xp` y aplicar al contenedor raíz del escritorio (`App.tsx`) para que cascadee a todo.
- **Tradeoff licencia:** Tahoma es propietaria de Microsoft; no se puede autohostear libremente. Se usa la del SO si está (Windows sí, muchos Mac con Office sí); si no, Verdana/Trebuchet (metricamente cercanas) como fallback. Si se quiere fidelidad garantizada cross-OS, autohostear una fuente open metric-compatible es una decisión aparte con su riesgo de licencia — **por defecto: solo el stack, sin autohostear.**
- Barra de título y "Inicio": Tahoma **bold**. El itálico del "start" real se emula con `italic` solo en el label del start button.

---

## Tier 1 — Chrome base (máximo impacto)

Archivos: `tailwind.config.js`, `src/styles/globals.css`, `src/components/Windows/TitleBar.tsx`, `src/components/Windows/draggable.tsx`, `src/components/TaskBar.tsx`, `src/App.tsx`.

### 1.1 Fuente Tahoma
- `fontFamily.xp` en config; aplicar `font-xp` (o via CSS al `:root`/contenedor) en `App.tsx`. Todo el texto del escritorio pasa a Tahoma-stack.

### 1.2 Barra de título con gradiente (`TitleBar.tsx`)
- Reemplazar `bg-window-bar` (activo) / `bg-window-barMuted` (inactivo) por clases `.xp-titlebar` / `.xp-titlebar--inactive` definidas en globals.css.
- **Activa** (`@layer components`):
  ```css
  .xp-titlebar {
    background: linear-gradient(to bottom,
      #0997ff 0%, #0053ee 8%, #0050ee 40%, #0060ff 88%,
      #0054e3 93%, #0052e2 96%, #061d9b 100%);
  }
  ```
- **Inactiva**: gradiente `#7ba0e0 → #5c86cf` (azul apagado; hoy `#5b7488` es demasiado gris).
- Altura ~30px, **esquinas superiores redondeadas** (`rounded-t-[7px]`), esquinas inferiores rectas.
- Título: Tahoma **bold**, blanco, con `text-shadow: 1px 1px 1px rgba(0,0,0,.35)`, **precedido del ícono de la ventana** (16×16). Hoy el título no tiene ícono → agregar prop `icon?: string` a `TitleBar` y pasar el ícono de cada ventana (Proyectos→folderIcon, Sociales→redes, Tecnologías→folderIcon; mismo registry que ya tiene `TaskBar`/`WINDOW_META`).

### 1.3 Botones de caption glossy (`TitleBar.tsx` → `WinBtn`)
- Reemplazar los `<button>` con iconos `Tb*` en hover-square por botones **glossy ~21×21px, `border-radius: 3px`, gap 2px**, con brillo superior interno.
- **Cerrar (rojo):** clase `.xp-btn-close` — `linear-gradient(#f5a3a3, #e14b3b 45%, #c5301f)`, borde `#a1310f`, glifo X blanco. Hover: más brillante.
- **Minimizar / Maximizar-Restaurar (azul):** clase `.xp-btn-blue` — gradiente azul del family del título, borde azul oscuro, glifo blanco.
- Glifos: **SVG inline** (trazo grueso estilo XP) o los `Tb*` recoloreados a blanco — preferir SVG por fidelidad. Mantener `aria-label`/`title` ya presentes (a11y no se pierde).
- Mantener `focus-visible:ring` (a11y).

### 1.4 Frame de ventana Luna (`draggable.tsx`)
- Hoy: `rounded-lg ring-1 ring-black/10` en el root y en el `Resizable`.
- Nuevo: **marco azul de 3px** (`.xp-frame`: `border: 3px solid theme(colors.luna.frame)` con `border-top: none` porque la barra de título cubre el tope), **esquinas superiores redondeadas** (`rounded-t-[8px]`), inferiores rectas. Cuerpo `bg-white`.
- Sombra: mantener `shadow-2xl`/`shadow-lg` según `active` (XP no tiene sombra fuerte, pero la sombra ayuda a la separación en un portfolio; mantener sutil, `shadow-xl` activo).
- En fullscreen/mobile (`isFull`): sin marco ni redondeo (igual que hoy).

### 1.5 Taskbar con gradiente + área de notificación (`TaskBar.tsx`)
- Reemplazar la imagen `TaskBartGradient` (`/static/TaskBargradient.webp`) por clase `.xp-taskbar`:
  ```css
  .xp-taskbar {
    background: linear-gradient(to bottom,
      #2b88e0 0%, #2380e0 3%, #1f6fd6 6%, #1f6fd6 10%,
      #2069d6 12%, #2f7ce8 50%, #1c5cc9 88%, #14459f 100%);
    box-shadow: inset 0 1px 0 #59a6ff, inset 0 2px 1px rgba(255,255,255,.12);
  }
  ```
  (Elimina la dependencia de la imagen; queda como fallback opcional.)
- **Área de notificación (systray):** envolver el reloj en un panel a la derecha con fondo `luna.tray` (más claro) y un **groove** separador a la izquierda (`border-left: 1px solid #0f3f9e; box-shadow: inset 1px 0 0 #4b9bff`). Opcional: 2-3 íconos falsos (volumen, red) como SVG pequeños antes del reloj, para dar el pego.
- Los botones de ventana (ya accesibles) reciben leve gloss/gradiente opcional; el resaltado de la ventana activa se mantiene (hoy `bg-blue-800/70`) pero se puede alinear al azul Luna presionado.

### 1.6 Start button "orbe" verde (`TaskBar.tsx`)
- Hoy: `bg-[#52911e]` plano + `hover:brightness-110`, con flag + "Inicio".
- Nuevo: clase `.xp-start`:
  ```css
  .xp-start {
    background: linear-gradient(to bottom,
      #4ab837 0%, #43a52f 6%, #3c9a2a 45%, #368e26 55%, #2f8420 92%, #3a9a2a 100%);
    border-radius: 0 12px 12px 0;   /* bulto redondeado a la derecha */
    box-shadow: inset 0 1px 0 rgba(255,255,255,.45);
  }
  ```
  con brillo superior (pseudo-elemento o inset), el flag `windowsXpLogo.webp` a la izquierda y **"Inicio" en Tahoma bold itálica**. Mantener `aria-haspopup`/`aria-expanded`/toggle ya implementados.

---

## Tier 2 — Piezas icónicas

Archivos: `src/components/TaskBar.tsx` (menú Inicio), `src/styles/globals.css`, `WindowsContainer.tsx` / `Folder.tsx` / `Socials.tsx` / `Techs.tsx` (hover/selección), `src/App.tsx` (selección de íconos del escritorio).

### 2.1 Menú Inicio de 2 columnas
Rediseñar el popup actual ("Hablemos", panel blanco simple) al layout canónico de XP, **adaptado al contenido del portfolio**:

```
┌─────────────────────────────────────┐
│  [avatar]  Ignacio Iglesias          │  ← header azul (luna.menuHeader), línea dorada abajo
├──────────────────┬──────────────────┤
│ IZQUIERDA (blanco)│ DERECHA (celeste) │
│ Programas/lugares │ Contacto          │
│  • Proyectos      │  • Github         │
│  • Tecnologías    │  • LinkedIn       │
│  • Sociales       │  • Correo         │
│  • Curriculum     │  • (Mi PC deco)   │
├──────────────────┴──────────────────┤
│           [🔑 Cerrar sesión] [⏻ Apagar]│  ← footer azul
└─────────────────────────────────────┘
```

- **Header:** avatar redondeado (usar `public/kirby.webp` existente, o una foto/asset nuevo) + nombre en blanco bold, sobre `bg-luna-menuHeader`, con línea inferior dorada (`border-b-2 border-[#f0b400]`).
- **Columna izquierda (blanco):** ítems "programa" que abren las ventanas reales (dispatch `handleOpen`/`handleMaximize` con el title correcto) + Curriculum (link al PDF). Ícono grande a la izquierda, título bold, subtítulo gris opcional.
- **Columna derecha (celeste `luna.menuRight`):** links de contacto (Github/LinkedIn/Correo, hoy en `taskList.json`) con ícono; opcional 1-2 ítems decorativos tipo "Mi PC"/"Panel de control".
- **Footer:** franja azul con "Cerrar sesión" y "Apagar" (glifos SVG; pueden ser decorativos o "Apagar" hace un easter-egg tipo fade a negro — decisión de implementación, no requerido).
- Mantener el comportamiento ya implementado: abre con click, cierra con `Escape` y click-afuera, `role="menu"`/`aria-*`. **Mejora a11y pendiente del trabajo anterior a resolver acá:** mover el foco al primer ítem al abrir y devolverlo al botón al cerrar con `Escape`; revisar la semántica de `role` (si el layout de 2 columnas complica `role="menu"`, usar `role="dialog"` con `aria-label` o una lista etiquetada).
- Ancho ~380px, esquinas superiores redondeadas, sombra.

### 2.2 Resaltado de selección azul XP
- Reemplazar los hovers actuales (`hover:bg-gray-400/50`, `hover:bg-cyan-200/90`, `hover:bg-blue-500/50`) por el resaltado XP: `hover:bg-luna-selection hover:text-white` (o clase `.xp-select`), consistente en menús, ítems de folder y listas dentro de ventanas.

### 2.3 Selección de íconos del escritorio
- Al clickear un ícono del escritorio, mostrar el **recuadro de selección azul translúcido** de XP (`bg-luna-selection/40` + borde punteado sutil) y el label con fondo azul. Requiere estado de "ícono seleccionado" en `App.tsx` (o un pequeño contexto/hook). Label en Tahoma con `shadowText` (ya existe).

---

## Tier 3 — Flavor (opcional)

Cada uno es independiente y opcional; ninguno bloquea el resto.

- **3.1 Menú contextual del escritorio:** click derecho sobre el fondo → menú XP (Ver, Organizar íconos, Actualizar, Propiedades). Componente nuevo + handler `onContextMenu` en el contenedor de `App.tsx`. Estilo con `.xp-menu` (blanco, borde, resaltado azul).
- **3.2 Sonidos XP:** usar `howler` (ya en deps) para reproducir sonidos al iniciar (startup), abrir/cerrar ventana (ding), o click en Inicio. **Requiere assets `.wav`** — sourcing con licencia/propios (los originales de MS son propietarios; conseguir versiones libres o del autor). Volumen bajo, con toggle mute. Riesgo: molesto si es intrusivo → default suave o off.
- **3.3 Pantalla de boot/login:** overlay inicial con la barra de progreso XP + logo, luego la pantalla de bienvenida (avatar + nombre) que al click entra al escritorio. Componente nuevo montado antes del desktop, con `sessionStorage` para no repetir en cada navegación. Puro visual/animación (GSAP ya está en deps).
- **3.4 Cursores XP:** set de cursores `.cur`/`.ani` (o PNG) aplicados via `cursor: url(...)`. Assets propios/libres. Bajo impacto/fidelidad; opcional.
- **3.5 Globos de notificación:** tooltip amarillo estilo XP (balloon) para hints (ej. "Hacé click en Inicio"). Componente pequeño; puramente decorativo.

---

## Assets

- **Avatar del menú Inicio** (Tier 2): `public/kirby.webp` ya existe (opción), o foto real / asset generado → `/public/static/avatar.webp`.
- **Glifos de caption y systray** (Tier 1): SVG inline en el código (sin archivos) — preferido. Alternativa: `react-icons` recoloreados.
- **Sonidos** (Tier 3.2): `.wav`/`.mp3` en `/public/static/sounds/` — con licencia adecuada. **Si no hay assets libres, no inventar; dejar el toggle apagado o el tier sin implementar y avisar.**
- **Fuente** (Tier 1): por defecto NO se autohostea (licencia Tahoma). Si se decide, iría en `/public/static/fonts/` con su `@font-face`.
- **Cursores** (Tier 3.4): `/public/static/cursors/` — con licencia.
- Ya disponibles y reutilizables: `windowsXpLogo.webp` (flag), `folderIcon.png`, `icons/redes.webp`, `background.webp` (Bliss), `TaskBargradient.webp` (queda como fallback).

## Conflicto con la UI spec global

`~/.claude/ui-spec.md` describe un dashboard SaaS moderno (shadcn/ui, tablas, sheets, `lucide-react` exclusivo, "no hex hardcodeado", tokens). **Choca de frente con un XP fiel** (skeuomórfico, gradientes multi-stop, hex específicos, iconografía propia de época). Por la regla del `CLAUDE.md` del usuario ("el proyecto manda sobre la ui-spec en conflicto"), **acá gobierna la estética XP**. De la ui-spec se mantienen solo los ítems que no contradicen:
- **Accesibilidad mínima** (sección 5): focus visible, `aria-label` en botones de ícono, contraste — se respetan (el trabajo previo de la taskbar ya cumple; Tier 2 mejora el foco del menú).
- **Sentence case en español** para textos nuevos.
- El "no hex en componentes" se honra **parcialmente**: el hex vive en `tailwind.config.js` + `globals.css`, no inline en JSX.

## Verificación

No hay framework de tests en el repo. Gates por tier:

1. `bunx tsc --noEmit` sin errores.
2. `bun run lint` sin errores nuevos (warnings `no-unused-vars` preexistentes son aceptables).
3. `bun run build` termina OK.
4. **QA visual en browser** (`bun run dev`), criterios de aceptación por tier:

**Tier 1:**
- El texto del escritorio usa Tahoma (o fallback Verdana/Trebuchet); se nota el cambio de tipografía.
- Las barras de título muestran **gradiente azul** (no plano), esquinas superiores redondeadas, título bold con sombra e ícono a la izquierda; la ventana no enfocada se ve azul apagado (no gris).
- Los botones min/max/cerrar son **glossy** (cerrar rojo, min/max azul) con glifo blanco; conservan `aria-label` y focus visible.
- Las ventanas tienen **marco azul** con esquinas superiores redondeadas y base recta.
- La taskbar muestra gradiente CSS con línea de brillo superior y **área de notificación** recuadrada alrededor del reloj.
- El start button es un **orbe verde glossy** con "Inicio" bold itálico + flag.
- Sin regresiones: drag/resize/minimizar/restaurar/foco/z-order siguen funcionando; consola 0 errores.

**Tier 2:**
- El menú Inicio abre como panel de **2 columnas** (header con avatar+nombre, izquierda blanca con ventanas/Curriculum, derecha celeste con contacto, footer azul).
- Al abrirlo, el foco entra al primer ítem; `Escape` cierra y devuelve el foco al botón Inicio; click-afuera cierra.
- Los hovers de menús/folders usan el **azul de selección** (`#316ac5`, texto blanco).
- Clickear un ícono del escritorio muestra el **recuadro de selección azul**.
- Sin regresiones en abrir/cerrar ventanas desde el menú.

**Tier 3 (por ítem implementado):**
- Context menu aparece con click derecho en el fondo y se cierra con click-afuera/`Escape`.
- Sonidos suenan en el evento correcto, con mute funcional (si se implementa).
- Boot/login se muestra una vez por sesión y entra al escritorio al click.

## Orden de implementación sugerido

Tier 1 primero (da ~80% del efecto y es base para el resto). Dentro de Tier 1: tokens+fuente → título+caption → frame → taskbar+start (el chrome de ventana y el de taskbar son independientes y podrían paralelizarse). Tier 2 después (depende de la taskbar/estilos de Tier 1). Tier 3 al final, ítem por ítem, según ganas.

Cada tier debería convertirse en su propio **plan de implementación** (skill `writing-plans`) antes de ejecutar.

## Notas de mantenimiento

- Un cambio de paleta (ej. tema "Plata"/"Verde oliva" de XP) se hace tocando solo los tokens `luna.*` en `tailwind.config.js` — no los componentes.
- El registry de ventanas/íconos (`WINDOW_META` en `TaskBar.tsx`) es la fuente de títulos+íconos; el ícono del título de ventana (Tier 1.2) y el menú Inicio (Tier 2.1) deben consumir el mismo mapa para no duplicar.
