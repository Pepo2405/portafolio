# Windows Media Player (XP) — Diseño

Fecha: 2026-07-16
Estado: aprobado para escribir plan de implementación

## Objetivo

Agregar al escritorio XP del portfolio un reproductor de música con **skin propio
de Windows Media Player (XP)**, con **visualizador reactivo al audio**, abrible como
una app más del escritorio. Reemplaza al mini-player `Mochify` (hoy huérfano).

Referencia visual: el WMP clásico de XP (barra oscura arriba, nav a la izquierda,
visualizador central tipo "starburst", pod de controles azul redondeado abajo).

## Decisiones de alcance (confirmadas)

- **Skin WMP auténtico**, NO reusa el chrome XP genérico (`DraggableWin`).
- **Reemplaza a Mochify**: se elimina `src/components/Windows/Mochify.tsx` y las
  entradas muertas `Mochify` en `WindowsContext`.
- **Audio placeholder** por ahora (URLs reales de `music.json` están caídas). El
  player se construye contra archivos locales de prueba; las fuentes reales se
  cambian después editando `music.json`.
- **Visualizador reactivo al audio** vía Web Audio API (`AnalyserNode`).
- **Nav funcional** (con criterio; ver abajo), no solo decorativa.

## Layout

```
┌─ ◐ Windows Media Player ───────────────[_][□][X]┐  barra WMP oscura + botones Luna
│┌──────────┐┌──────────────────────────────────┐│
││Reproducc.││ <artista>                          ││  overlay artista/título
││Guía      ││ <título>                           ││
││Biblioteca││                                    ││
││Copiar CD ││        ✦ VISUALIZADOR ✦            ││  canvas reactivo
││Radio     ││         (starburst/barras)         ││
││Visualiz. ││                                    ││
│└──────────┘└──────────────────────────────────┘│
├─────────────────────────────────────────────────┤
│  ●───────seek───────────●          ⏱ 2:14/4:21  │  barra progreso
│ ╭─────────────────────────────────────────────╮ │
│ │  ◁◁  ▶  ▷▷  ■   🔊─vol─                       │ │  pod azul redondeado
│ ╰─────────────────────────────────────────────╯ │
└─────────────────────────────────────────────────┘
```

En mobile (`useIsMobile`), la ventana pasa a fullscreen como el resto de las
ventanas; el nav izquierdo puede colapsarse. Se mantiene consistente con el patrón
actual del proyecto.

## Arquitectura y componentes

Nueva carpeta: `src/components/Windows/MediaPlayer/`

### `index.tsx` — shell del player
- Chrome custom con skin WMP.
- Drag vía `useDragMove` (mismo hook que `draggable.tsx`).
- Integración con `WindowsContext` (`useWindow`): `focusWindow`, `zIndexOf`,
  `handleMinimize`, `handleClose`, lectura de `focused`. Replica la mecánica de
  `DraggableWin` (focus al `pointerDown`, z-index dinámico, animación de entrada/
  salida con gsap, Esc cierra si está enfocada) pero con piel WMP.
- Mantiene el estado de "vista activa" del nav y la rutea a `views/`.
- Es resizable (usar `re-resizable`, como `DraggableWin`) con min-width/height
  razonables; en fullscreen/mobile se desactiva el resize.

### `useAudioPlayer.ts` — hook de estado de audio
Encapsula Howler. Responsabilidades:
- Construir los `Howl` con `html5: false` (modo Web Audio, necesario para el
  analyser) y `volume` inicial.
- Estado expuesto: `currentIndex`, `track` (metadata), `playing`, `position`
  (segundos), `duration`, `volume`.
- Acciones: `togglePlay`, `next`, `prev`, `stop`, `seek(sec)`, `setVolume(v)`,
  `playIndex(i)` (usado por Biblioteca).
- Avance de `position` con `requestAnimationFrame` mientras `playing` (o
  `setInterval` 250ms; se decide en implementación, preferir rAF y limpiar al
  desmontar).
- Autoplay del siguiente track al terminar (`onend`).
- Expone acceso al `AnalyserNode` (o la señal de que el contexto está listo) para
  `Visualizer`.

Interfaz clara: el resto de los componentes consumen este hook y no tocan Howler
directamente.

### `Visualizer.tsx`
- `<canvas>` dimensionado al área central (resize observer o al tamaño del
  contenedor).
- Toma `Howler.ctx` y `Howler.masterGain`; crea **una** vez un `AnalyserNode`
  (`fftSize` p.ej. 256) y hace `Howler.masterGain.connect(analyser)` como tap
  (no altera la señal; `masterGain` ya está conectado a `destination`).
- Loop `requestAnimationFrame`: `analyser.getByteFrequencyData(data)` → dibuja el
  efecto (starburst radial + barras) con el color de acento actual.
- Limpia el rAF y desconecta el analyser al desmontar.
- Degradación: si el `AudioContext` está `suspended` (política de autoplay del
  browser), el visualizador queda estático hasta el primer play (que hace
  `ctx.resume()`), disparado por Howler al reproducir.

### `Controls.tsx` — pod inferior
- Botones: prev, play/pause (toggle), next, stop; slider de volumen; barra de
  progreso/seek (click y drag para buscar); tiempo `mm:ss / mm:ss`.
- Estilo pod azul redondeado (skin WMP) vía clases `.wmp-*` en `globals.css`.

### `NavPanel.tsx` — menú izquierdo
Lista de secciones estilo WMP; resalta la activa; cambia la vista central.

### `views/`
- `NowPlaying.tsx` — vista default: `Visualizer` + overlay artista/título.
- `Library.tsx` — lista real de todos los temas de `music.json`; click → `playIndex`.
- `MediaGuide.tsx` — página estática "acerca de" (breve, autor/portfolio).
- `Visualizations.tsx` — selector de **color de acento** del visualizador
  (azul clásico / rojo / verde). Guarda el acento en el estado del shell.
- **Copiar desde CD** y **Radio**: no son vistas; al clickearlas abren un
  **diálogo modal XP auténtico** dentro de la ventana ("No se detectó ninguna
  unidad de CD." / "Sin conexión a Internet."), con botón Aceptar. Costo bajo,
  alta fidelidad.

## Datos

`src/lists/music.json` — extender cada tema:

```json
{
  "songs": [
    { "title": "...", "artist": "...", "album": "...", "url": "/static/music/...", "cover": "/static/music/...jpg" }
  ]
}
```

`album` y `cover` son opcionales. `url` apunta a archivos locales placeholder en
`public/static/music/` para desarrollo.

## Integración con el escritorio

- `src/lists/windows.ts`: agregar entrada a `WINDOW_META` con clave/título
  `"Reproductor"` (label p.ej. `"Reproductor multimedia"`) e ícono WMP. Esto lo
  hace aparecer **automáticamente** en taskbar y menú Inicio (ambos iteran
  `WINDOW_META`).
- `src/lists/desktopIcons.ts`: nuevo `DesktopIconDef` con
  `kind: { type: "open-window", title: "Reproductor" }` e ícono WMP.
- `src/App.tsx`: montar `<MediaPlayer />` gateado por
  `visibleItems["Reproductor"]` (mismo patrón que las ventanas actuales). NO pasa
  por `WindowsContainer` porque tiene chrome propio.
- `src/context/WindowsContext.tsx`: agregar `Reproductor: false` al estado inicial
  si hace falta; **eliminar** las dos entradas `Mochify`.
- `src/styles/globals.css`: clases `.wmp-*` para el skin, siguiendo el patrón
  existente `.xp-*` / `.luna-*`.
- Ícono WMP: agregar asset en `public/static/icons/` (p.ej. `wmp.png`).

## Limpieza (mess propio de esta feature)

- Eliminar `src/components/Windows/Mochify.tsx` (huérfano, reemplazado).
- Eliminar entradas `Mochify` en `WindowsContext.tsx`.
- No tocar `MochiDraw.tsx` ni otro código no relacionado.

## Verificación

1. `bun dev`: abrir el player desde ícono de escritorio, menú Inicio y taskbar.
2. Reproducir: el visualizador reacciona al audio; play/pause, prev, next, stop,
   seek y volumen funcionan; el tiempo avanza y el track cambia al terminar.
3. Biblioteca: click en un tema lo reproduce.
4. Visualizaciones: cambiar acento cambia el color del visualizador.
5. Copiar desde CD / Radio: muestran el diálogo XP.
6. Gestión de ventana: minimizar/restaurar/cerrar/enfocar/arrastrar/resize vía
   taskbar y chrome, consistente con las otras ventanas.
7. `bun run build` (tsc + vite) sin errores de tipos.

## Fuera de alcance (YAGNI)

- Fuentes de audio reales (se cargan después editando `music.json`).
- Múltiples modos de visualización distintos (solo uno reactivo + color de acento).
- Radio con stream de internet real (queda como diálogo "sin conexión"; posible
  stretch futuro).
- Copiar/quemar CD real, biblioteca persistente, playlists editables.
```
