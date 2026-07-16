# Windows Media Player (XP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an XP-skinned Windows Media Player to the portfolio desktop — authentic WMP chrome, an audio-reactive canvas visualizer, functional nav/library/controls — replacing the orphaned `Mochify` mini-player.

**Architecture:** A self-managed window (`MediaPlayer/index.tsx`) with its own WMP chrome that replicates `DraggableWin`'s window mechanics (drag via `useDragMove`, resize via `re-resizable`, focus/z-index/minimize/close via `useWindow`) instead of reusing the generic XP frame. A `useAudioPlayer` hook wraps Howler in Web Audio mode and is the single source of playback state, consumed by `Controls`, `Visualizer`, and the `Library` view. The visualizer taps `Howler.masterGain` with an `AnalyserNode`. Nav routes to `views/`; "Copiar desde CD" / "Radio" open an in-window XP dialog instead of a view.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind (`font-xp`, `luna-*`/`window-*` colors), Howler 2.2 (Web Audio mode), `re-resizable`, GSAP, `react-icons`, Web Audio API (`AnalyserNode`).

## Global Constraints

- **No new dependencies.** Everything needed is already installed (`howler`, `re-resizable`, `gsap`, `react-icons`).
- **No test harness.** This project has no unit tests; scripts are only `dev`, `build`, `preview`, `lint`. Every task is verified by `bun run build` (which runs `tsc && vite build`, i.e. a full typecheck) plus a concrete manual check in `bun dev`. Do **not** add vitest/jest/testing-library.
- **Follow existing conventions:** path alias `src/*`; window title = exact key shared across `WINDOW_META`, `desktopIcons`, `WindowsContext`; skin classes live in `src/styles/globals.css` following the `.xp-*` / `.luna-*` pattern (add `.wmp-*` in the same `@layer components` block); icons are bare URLs under `public/static/`.
- **Mobile:** use `useIsMobile()` (`max-width: 767px`); on mobile the window is fullscreen and resize is disabled, matching `DraggableWin`.
- **Copy is in Spanish** to match the rest of the UI (labels, dialog text).
- **Commit after every task** with a `feat(media-player):` / `chore(media-player):` prefix. End each commit message with the two trailer lines this repo uses (`Co-Authored-By:` and `Claude-Session:`).
- **Surgical:** touch only what each task lists. Do not refactor `MochiDraw.tsx` or unrelated code.

Reference spec: `docs/superpowers/specs/2026-07-16-wmp-media-player-design.md`.

---

## File Structure

**Created:**
- `src/components/Windows/MediaPlayer/index.tsx` — window shell + WMP chrome, owns `view`/`accent`/`dialog` state and the `useAudioPlayer` instance.
- `src/components/Windows/MediaPlayer/useAudioPlayer.ts` — Howler-backed playback hook (the only place Howler is touched).
- `src/components/Windows/MediaPlayer/NavPanel.tsx` — left WMP nav; highlights active, switches view / opens dialog.
- `src/components/Windows/MediaPlayer/Controls.tsx` — bottom blue pod: transport buttons, volume, seek bar, time.
- `src/components/Windows/MediaPlayer/Visualizer.tsx` — canvas visualizer tapping `Howler.masterGain`.
- `src/components/Windows/MediaPlayer/XpDialog.tsx` — in-window authentic XP modal dialog (used by CD/Radio).
- `src/components/Windows/MediaPlayer/views/NowPlaying.tsx` — default view: `Visualizer` + artist/title overlay.
- `src/components/Windows/MediaPlayer/views/Library.tsx` — full track list; click → `playIndex`.
- `src/components/Windows/MediaPlayer/views/MediaGuide.tsx` — static "acerca de" page.
- `src/components/Windows/MediaPlayer/views/Visualizations.tsx` — accent-color selector.
- `public/static/music/` — local placeholder audio files.
- `public/static/icons/wmp.png` — WMP icon (taskbar / start / desktop / titlebar).

**Modified:**
- `src/lists/music.json` — new per-track schema, local placeholder URLs.
- `src/lists/windows.ts` — add `Reproductor` to `WINDOW_META`.
- `src/lists/desktopIcons.ts` — add `Reproductor` desktop icon.
- `src/context/WindowsContext.tsx` — add `Reproductor: false`; **remove** both `Mochify` entries.
- `src/App.tsx` — mount `<MediaPlayer />` gated by `visibleItems["Reproductor"]` (outside `WindowsContainer`).
- `src/styles/globals.css` — add `.wmp-*` skin classes.

**Deleted:**
- `src/components/Windows/Mochify.tsx`.

---

## Task 1: Foundation — data schema, placeholder audio, WMP icon, remove Mochify

Establishes the data model, dev audio, the icon asset, and removes the dead `Mochify` player. No visible UI yet; the app must still build and run unchanged.

**Files:**
- Modify: `src/lists/music.json`
- Create: `public/static/music/` (2 placeholder audio files)
- Create: `public/static/icons/wmp.png`
- Delete: `src/components/Windows/Mochify.tsx`
- Modify: `src/context/WindowsContext.tsx:51-59` (remove `Mochify` keys)

**Interfaces:**
- Produces: `src/lists/music.json` with shape `{ songs: Array<{ title: string; artist?: string; album?: string; url: string; cover?: string }> }` — consumed by `useAudioPlayer` (Task 3) and `Library` (Task 5).

- [ ] **Step 1: Rewrite `src/lists/music.json` to the new schema with local placeholder URLs**

```json
{
  "songs": [
    {
      "title": "Tono de prueba A",
      "artist": "Placeholder",
      "album": "Dev",
      "url": "/static/music/placeholder-a.mp3"
    },
    {
      "title": "Tono de prueba B",
      "artist": "Placeholder",
      "album": "Dev",
      "url": "/static/music/placeholder-b.mp3"
    }
  ]
}
```

- [ ] **Step 2: Add the placeholder audio files**

Create `public/static/music/` and add two short audio clips named `placeholder-a.mp3` and `placeholder-b.mp3`. They must contain real varying audio so the visualizer (Task 4) has signal. If `ffmpeg` is available, generate two distinct tone sweeps:

```bash
mkdir -p public/static/music
ffmpeg -f lavfi -i "sine=frequency=220:duration=12" -af "vibrato=f=5" public/static/music/placeholder-a.mp3
ffmpeg -f lavfi -i "sine=frequency=440:duration=15" -af "tremolo=f=6:d=0.8" public/static/music/placeholder-b.mp3
```

If `ffmpeg` is not available, drop any two short royalty-free `.mp3` clips with those exact filenames. These are dev-only; real sources are swapped in later by editing `music.json` (out of scope per spec).

- [ ] **Step 3: Add the WMP icon asset**

Add `public/static/icons/wmp.png` — a small (≈32×32 or larger square) Windows Media Player XP icon. Any WMP-style PNG works; it is referenced as the bare URL `/static/icons/wmp.png`.

- [ ] **Step 4: Delete the orphaned Mochify component**

```bash
git rm src/components/Windows/Mochify.tsx
```

- [ ] **Step 5: Remove the `Mochify` entries from `WindowsContext`**

In `src/context/WindowsContext.tsx`, delete the `Mochify: true` line from the `visibleItems` initial state and the `Mochify: true` line from the `minimizedItems` initial state. Leave the rest of both objects intact:

```tsx
  const [visibleItems, setVisibleItems] = useState<Flags>({
    Proyectos: false,
  });
  const [minimizedItems, setMinimizedItems] = useState<Flags>({
    Proyectos: false,
    "Mochi Draw": false,
  });
```

- [ ] **Step 6: Verify no `Mochify` references remain**

Run: `grep -rn "Mochify" src/`
Expected: no output (exit code 1). `MochiDraw` must be untouched.

- [ ] **Step 7: Verify the build passes**

Run: `bun run build`
Expected: `tsc` + `vite build` complete with no errors.

- [ ] **Step 8: Manual check**

Run: `bun dev` and open the app. Expected: desktop loads normally; nothing visibly changed (Mochify was already unmounted); no console errors.

- [ ] **Step 9: Commit**

```bash
git add src/lists/music.json public/static/music public/static/icons/wmp.png src/context/WindowsContext.tsx
git commit -m "chore(media-player): music schema, placeholder audio, wmp icon; remove Mochify

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NNHRvVCeuojtDNQvWApPZk"
```

---

## Task 2: WMP shell + skin + desktop registration

Create the self-managed WMP window with authentic chrome and wire it into the desktop (icon, Start menu, taskbar). Nav, center, and pod render as static placeholders; playback and views come later. This is the "it behaves and looks like a real WMP window" gate.

**Files:**
- Create: `src/components/Windows/MediaPlayer/index.tsx`
- Create: `src/components/Windows/MediaPlayer/NavPanel.tsx`
- Modify: `src/styles/globals.css` (add `.wmp-*` inside the `@layer components` block)
- Modify: `src/lists/windows.ts`
- Modify: `src/lists/desktopIcons.ts`
- Modify: `src/context/WindowsContext.tsx` (add `Reproductor: false` to `visibleItems`)
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useWindow()` → `{ focusWindow, zIndexOf, handleMinimize, handleClose, focused }`; `useDragMove(initial, opts)` → `{ pos, setPos, dragging, handlers }`; `useIsMobile()`.
- Produces:
  - Window title constant `"Reproductor"` (the shared key across `WINDOW_META` / `desktopIcons` / `WindowsContext`).
  - `type View = "nowplaying" | "library" | "guide" | "visualizations"` and `type Dialog = "cd" | "radio" | null` — defined in `index.tsx`, consumed by Tasks 5 & 6.
  - `NavPanel` component with props `{ view: View; onSelectView: (v: View) => void; onOpenDialog: (d: "cd" | "radio") => void }`.

- [ ] **Step 1: Add the `.wmp-*` skin classes to `src/styles/globals.css`**

Add inside the existing `@layer components { ... }` block (the same block that contains `.xp-titlebar`), after the last `.xp-*` rule:

```css
  /* Windows Media Player (XP) skin */
  .wmp-titlebar {
    background: linear-gradient(180deg, #3a3f4b 0%, #23262e 50%, #14161c 100%);
    border-bottom: 1px solid #000;
  }
  .wmp-body {
    background: linear-gradient(180deg, #1d2530 0%, #0f141b 100%);
  }
  .wmp-nav {
    background: linear-gradient(180deg, #2b3340 0%, #1a2029 100%);
    border-right: 1px solid #000;
  }
  .wmp-nav-item {
    color: #c8d2e0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  .wmp-nav-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
  }
  .wmp-nav-item--active {
    background: linear-gradient(180deg, #4a7fd0 0%, #2f5aa8 100%);
    color: #fff;
  }
  .wmp-stage {
    background: radial-gradient(circle at 50% 45%, #12202f 0%, #05080d 90%);
  }
  .wmp-pod {
    background: linear-gradient(180deg, #6ea3e6 0%, #2f6fc4 45%, #1c4f9c 100%);
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4);
  }
  .wmp-btn {
    color: #fff;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4));
  }
  .wmp-btn:hover {
    filter: brightness(1.2) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4));
  }
```

- [ ] **Step 2: Create `NavPanel.tsx`**

```tsx
import { View } from "./index";

type Dialog = "cd" | "radio";

interface Props {
  view: View;
  onSelectView: (v: View) => void;
  onOpenDialog: (d: Dialog) => void;
}

type Item =
  | { kind: "view"; view: View; label: string }
  | { kind: "dialog"; dialog: Dialog; label: string };

const ITEMS: Item[] = [
  { kind: "view", view: "nowplaying", label: "Reproducción en curso" },
  { kind: "view", view: "guide", label: "Guía multimedia" },
  { kind: "view", view: "library", label: "Biblioteca multimedia" },
  { kind: "dialog", dialog: "cd", label: "Copiar desde CD" },
  { kind: "dialog", dialog: "radio", label: "Radio" },
  { kind: "view", view: "visualizations", label: "Visualizaciones" },
];

export default function NavPanel({ view, onSelectView, onOpenDialog }: Props) {
  return (
    <nav className="wmp-nav flex w-40 shrink-0 flex-col overflow-y-auto py-1 text-[13px]">
      {ITEMS.map((item) => {
        const active = item.kind === "view" && item.view === view;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() =>
              item.kind === "view"
                ? onSelectView(item.view)
                : onOpenDialog(item.dialog)
            }
            className={`wmp-nav-item px-3 py-1.5 text-left ${
              active ? "wmp-nav-item--active" : ""
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: Create `index.tsx` — the shell chrome (static center/pod placeholders)**

This replicates `DraggableWin`'s mechanics (spawn cascade, drag, resize, focus/z-index, entrance/exit GSAP, Esc-to-close) with WMP skin. Playback and real views are added in later tasks; for now the center shows a static stage and the bottom shows a static pod.

```tsx
import gsap from "gsap";
import { Resizable } from "re-resizable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TbCopy, TbMinus, TbSquare, TbX } from "react-icons/tb";
import useDragMove, { Pos } from "src/hooks/useDragMove";
import useIsMobile from "src/hooks/useIsMobile";
import useWindow from "src/hooks/useWindow";
import { WINDOW_META } from "src/lists/windows";
import NavPanel from "./NavPanel";

export type View = "nowplaying" | "library" | "guide" | "visualizations";
export type Dialog = "cd" | "radio" | null;

export const WMP_TITLE = "Reproductor";

type Size = { width: number; height: number };

const TASKBAR = 32;
const RESIZE_ENABLE = {
  top: true, right: true, bottom: true, left: true,
  topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
};
const RESIZE_DISABLED = {
  top: false, right: false, bottom: false, left: false,
  topRight: false, bottomRight: false, bottomLeft: false, topLeft: false,
};

let spawnCounter = 0;

interface Props {
  close: (e: { target: { title: string } }) => void;
}

export default function MediaPlayer({ close }: Props) {
  const t = WMP_TITLE;
  const isMobile = useIsMobile();
  const { focusWindow, zIndexOf, handleMinimize, focused } = useWindow();

  const rootRef = useRef<HTMLDivElement>(null);
  const resizeOrigin = useRef<Pos>({ x: 0, y: 0 });
  const [full, setFull] = useState(false);
  const [size, setSize] = useState<Size>({ width: 640, height: 480 });

  const [view, setView] = useState<View>("nowplaying");
  const [dialog, setDialog] = useState<Dialog>(null);

  const spawn = useMemo<Pos>(() => {
    const i = spawnCounter++ % 6;
    return { x: 90 + i * 30, y: 40 + i * 30 };
  }, []);

  const isFull = full || isMobile;

  const { pos, setPos, dragging, handlers } = useDragMove(spawn, {
    nodeRef: rootRef,
    disabled: isFull,
    onStart: () => focusWindow(t),
  });

  const requestClose = useCallback(() => {
    const node = rootRef.current;
    if (!node) {
      close({ target: { title: t } });
      return;
    }
    gsap.to(node, {
      scale: 0.92,
      opacity: 0,
      duration: 0.14,
      ease: "power3.in",
      onComplete: () => close({ target: { title: t } }),
    });
  }, [close, t]);

  useEffect(() => {
    focusWindow(t);
    const node = rootRef.current;
    if (node) {
      gsap.fromTo(
        node,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.18, ease: "power3.out" }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (focused !== t) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, t, requestClose]);

  const active = focused === t;
  const z = zIndexOf(t);

  return (
    <div
      ref={rootRef}
      onPointerDown={() => focusWindow(t)}
      style={
        isFull
          ? { position: "fixed", inset: 0, zIndex: z }
          : { position: "fixed", left: pos.x, top: pos.y, zIndex: z }
      }
      className={isFull ? "" : `rounded-t-[8px] ${active ? "shadow-2xl" : "shadow-lg"}`}
    >
      <Resizable
        size={isFull ? { width: "100%", height: "100%" } : size}
        enable={isFull ? RESIZE_DISABLED : RESIZE_ENABLE}
        minWidth={480}
        minHeight={360}
        maxWidth="95vw"
        maxHeight="95vh"
        className={`flex h-full w-full flex-col overflow-hidden ${
          isFull ? "" : "rounded-t-[8px]"
        }`}
        onResizeStart={() => {
          resizeOrigin.current = { x: pos.x, y: pos.y };
          focusWindow(t);
        }}
        onResize={(_e, dir, ref, delta) => {
          const d = String(dir).toLowerCase();
          if (d.includes("left") || d.includes("top")) {
            setPos({
              x: d.includes("left")
                ? resizeOrigin.current.x - delta.width
                : resizeOrigin.current.x,
              y: d.includes("top")
                ? resizeOrigin.current.y - delta.height
                : resizeOrigin.current.y,
            });
          }
          setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
        }}
      >
        {/* WMP titlebar */}
        <div
          {...(isFull ? {} : handlers)}
          onDoubleClick={() => !isMobile && setFull((p) => !p)}
          style={{ touchAction: "none" }}
          className={`wmp-titlebar flex h-8 shrink-0 select-none items-center justify-between px-2 text-white ${
            isFull ? "cursor-default" : dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <img src={WINDOW_META[t]?.icon} alt="" width={16} height={16} />
            <span className="truncate text-sm font-semibold">
              Windows Media Player
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Minimizar"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => handleMinimize({ target: { title: t } })}
              className="xp-caption xp-caption-blue flex h-[21px] w-[21px] items-center justify-center text-white"
            >
              <TbMinus className="h-4 w-4" />
            </button>
            {!isMobile && (
              <button
                type="button"
                aria-label={full ? "Restaurar" : "Maximizar"}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setFull((p) => !p)}
                className="xp-caption xp-caption-blue flex h-[21px] w-[21px] items-center justify-center text-white"
              >
                {full ? <TbCopy className="h-3.5 w-3.5" /> : <TbSquare className="h-3.5 w-3.5" />}
              </button>
            )}
            <button
              type="button"
              aria-label="Cerrar"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={requestClose}
              className="xp-caption xp-caption-close flex h-[21px] w-[21px] items-center justify-center text-white"
            >
              <TbX className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* body: nav + stage */}
        <div className="wmp-body flex min-h-0 flex-1">
          <NavPanel view={view} onSelectView={setView} onOpenDialog={setDialog} />
          <div className="wmp-stage relative min-w-0 flex-1">
            {/* views mounted here in Task 5/6 */}
            <div className="flex h-full items-center justify-center text-sm text-white/60">
              {view}
            </div>
          </div>
        </div>

        {/* bottom pod (static placeholder; wired in Task 3) */}
        <div className="wmp-body shrink-0 px-4 pb-3 pt-1">
          <div className="wmp-pod mx-auto flex max-w-md items-center justify-center gap-4 py-2">
            <span className="text-xs text-white/90">controles</span>
          </div>
        </div>

        {/* dialog placeholder; XpDialog mounted in Task 6 */}
        {dialog && (
          <button
            type="button"
            onClick={() => setDialog(null)}
            className="absolute inset-0 bg-black/30 text-white"
          >
            {dialog}
          </button>
        )}
      </Resizable>
    </div>
  );
}
```

- [ ] **Step 4: Register the window in `src/lists/windows.ts`**

Add one entry to `WINDOW_META`:

```ts
export const WINDOW_META: Record<string, WindowMeta> = {
  Proyectos: { icon: "/static/folderIcon.png", label: "Proyectos" },
  Sociales: { icon: "/static/icons/redes.webp", label: "Redes sociales" },
  Tecnologías: { icon: "/static/folderIcon.png", label: "Tecnologías" },
  Reproductor: { icon: "/static/icons/wmp.png", label: "Reproductor multimedia" },
};
```

- [ ] **Step 5: Add the desktop icon in `src/lists/desktopIcons.ts`**

Insert into `DESKTOP_ICONS` (before the `amongus` easter-egg entry):

```ts
  {
    id: "Reproductor",
    icon: "/static/icons/wmp.png",
    label: "Reproductor multimedia",
    kind: { type: "open-window", title: "Reproductor" },
    defaultCell: { col: 0, row: 4 },
  },
```

- [ ] **Step 6: Add `Reproductor: false` to `WindowsContext` initial `visibleItems`**

```tsx
  const [visibleItems, setVisibleItems] = useState<Flags>({
    Proyectos: false,
    Reproductor: false,
  });
```

- [ ] **Step 7: Mount `<MediaPlayer />` in `src/App.tsx`**

Add the import near the other Windows imports:

```tsx
import MediaPlayer from "src/components/Windows/MediaPlayer";
```

Use `visibleItems` and `handleClose` from `useWindow()` (currently `App` only destructures `handleOpen` — extend it):

```tsx
  const { handleOpen, visibleItems, handleClose } = useWindow();
```

Render the player inside `<main>`, right after `<WindowsContainer />` (it manages its own chrome, so it is **not** inside `WindowsContainer`):

```tsx
        <WindowsContainer />
        {visibleItems["Reproductor"] && <MediaPlayer close={handleClose} />}
```

- [ ] **Step 8: Verify the build passes**

Run: `bun run build`
Expected: no type errors. (Note the circular-looking `NavPanel` → `./index` import of the `View` **type** is fine — it is type-only and erased by `tsc`.)

- [ ] **Step 9: Manual check**

Run: `bun dev`.
Expected:
- A "Reproductor multimedia" icon appears on the desktop and in the Start menu; opening it from either shows the WMP window; it also appears in the taskbar.
- The window has the dark WMP titlebar (icon + "Windows Media Player" + Luna min/restore/close buttons), a left nav, a dark central stage showing the active view name, and a rounded blue pod at the bottom.
- Drag by the titlebar, resize from edges, double-click title to maximize/restore, minimize/restore via taskbar, focus raises z-index over other windows, Esc closes when focused.
- On a narrow viewport (<768px) the window is fullscreen with resize disabled.
- Clicking nav items changes the center label; clicking "Copiar desde CD"/"Radio" shows the temporary dark overlay (replaced in Task 6).

- [ ] **Step 10: Commit**

```bash
git add src/components/Windows/MediaPlayer src/styles/globals.css src/lists/windows.ts src/lists/desktopIcons.ts src/context/WindowsContext.tsx src/App.tsx
git commit -m "feat(media-player): WMP window shell, skin, and desktop registration

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NNHRvVCeuojtDNQvWApPZk"
```

---

## Task 3: `useAudioPlayer` hook + `Controls` pod

Add the Howler-backed playback hook and the functional control pod (transport, volume, seek, time, autoplay-next). Playback becomes real. Howler runs in Web Audio mode (`html5: false`) so Task 4 can tap the analyser.

**Files:**
- Create: `src/components/Windows/MediaPlayer/useAudioPlayer.ts`
- Create: `src/components/Windows/MediaPlayer/Controls.tsx`
- Modify: `src/components/Windows/MediaPlayer/index.tsx` (instantiate hook, replace static pod with `<Controls />`)

**Interfaces:**
- Consumes: `src/lists/music.json` (Task 1 schema); `howler` (`Howl`).
- Produces (`useAudioPlayer.ts`):

```ts
export interface Track {
  title: string;
  artist?: string;
  album?: string;
  url: string;
  cover?: string;
}
export interface AudioPlayer {
  tracks: Track[];
  currentIndex: number;
  track: Track;
  playing: boolean;
  position: number; // seconds
  duration: number; // seconds
  volume: number;   // 0..1
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  playIndex: (i: number) => void;
}
export default function useAudioPlayer(): AudioPlayer;
```

  This `AudioPlayer` object is created in `index.tsx` and passed to `Controls` (Task 3), `NowPlaying`/`Visualizer` (Tasks 4–5), and `Library` (Task 5).

- [ ] **Step 1: Create `useAudioPlayer.ts`**

```ts
import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";
import songList from "src/lists/music.json";

export interface Track {
  title: string;
  artist?: string;
  album?: string;
  url: string;
  cover?: string;
}

export interface AudioPlayer {
  tracks: Track[];
  currentIndex: number;
  track: Track;
  playing: boolean;
  position: number;
  duration: number;
  volume: number;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  playIndex: (i: number) => void;
}

const TRACKS = songList.songs as Track[];
const INITIAL_VOLUME = 0.5;

export default function useAudioPlayer(): AudioPlayer {
  const howlsRef = useRef<Howl[]>([]);
  const rafRef = useRef<number | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(INITIAL_VOLUME);

  // Lazily build one Howl per track in Web Audio mode (needed for the analyser).
  const getHowl = useCallback((i: number): Howl => {
    let howl = howlsRef.current[i];
    if (!howl) {
      howl = new Howl({
        src: [TRACKS[i].url],
        html5: false,
        volume: INITIAL_VOLUME,
      });
      howlsRef.current[i] = howl;
    }
    return howl;
  }, []);

  const startRaf = useCallback((howl: Howl) => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      setPosition(howl.seek() as number);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const playIndex = useCallback(
    (i: number) => {
      const clamped = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
      // Stop everything currently sounding.
      howlsRef.current.forEach((h) => h && h.stop());
      const howl = getHowl(clamped);
      howl.volume(volume);
      howl.off("end");
      howl.once("end", () => {
        setPlaying(false);
        setPosition(0);
        playIndex(clamped + 1); // autoplay next
      });
      howl.play();
      setCurrentIndex(clamped);
      setDuration(howl.duration());
      setPlaying(true);
      startRaf(howl);
    },
    [getHowl, startRaf, volume]
  );

  const togglePlay = useCallback(() => {
    const howl = getHowl(currentIndex);
    if (playing) {
      howl.pause();
      setPlaying(false);
      stopRaf();
    } else {
      howl.volume(volume);
      if (!howl.playing()) {
        // fresh play wires the end handler + duration
        playIndex(currentIndex);
        return;
      }
      howl.play();
      setPlaying(true);
      startRaf(howl);
    }
  }, [currentIndex, getHowl, playIndex, playing, startRaf, stopRaf, volume]);

  const next = useCallback(() => playIndex(currentIndex + 1), [currentIndex, playIndex]);
  const prev = useCallback(() => playIndex(currentIndex - 1), [currentIndex, playIndex]);

  const stop = useCallback(() => {
    getHowl(currentIndex).stop();
    setPlaying(false);
    setPosition(0);
    stopRaf();
  }, [currentIndex, getHowl, stopRaf]);

  const seek = useCallback(
    (sec: number) => {
      getHowl(currentIndex).seek(sec);
      setPosition(sec);
    },
    [currentIndex, getHowl]
  );

  const setVolume = useCallback(
    (v: number) => {
      setVolumeState(v);
      const howl = howlsRef.current[currentIndex];
      if (howl) howl.volume(v);
    },
    [currentIndex]
  );

  // Cleanup on unmount: stop raf and unload all howls.
  useEffect(() => {
    const howls = howlsRef.current;
    return () => {
      stopRaf();
      howls.forEach((h) => h && h.unload());
    };
  }, [stopRaf]);

  return {
    tracks: TRACKS,
    currentIndex,
    track: TRACKS[currentIndex],
    playing,
    position,
    duration,
    volume,
    togglePlay,
    next,
    prev,
    stop,
    seek,
    setVolume,
    playIndex,
  };
}
```

- [ ] **Step 2: Create `Controls.tsx`**

```tsx
import { TbPlayerPause, TbPlayerPlay, TbPlayerSkipBack, TbPlayerSkipForward, TbPlayerStop, TbVolume } from "react-icons/tb";
import { AudioPlayer } from "./useAudioPlayer";

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  player: AudioPlayer;
}

export default function Controls({ player }: Props) {
  const { playing, position, duration, volume } = player;
  const pct = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <div className="wmp-body shrink-0 px-4 pb-3 pt-2">
      {/* seek bar */}
      <div className="mb-2 flex items-center gap-2 text-[11px] text-white/80">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={position}
          onChange={(e) => player.seek(Number(e.target.value))}
          className="h-1 flex-1 accent-sky-400"
          aria-label="Progreso"
          style={{ background: `linear-gradient(90deg, #4a7fd0 ${pct}%, #223 ${pct}%)` }}
        />
        <span className="tabular-nums">
          {fmt(position)} / {fmt(duration)}
        </span>
      </div>

      {/* blue pod */}
      <div className="wmp-pod mx-auto flex max-w-md items-center justify-center gap-3 px-4 py-2">
        <button type="button" aria-label="Anterior" onClick={player.prev} className="wmp-btn">
          <TbPlayerSkipBack className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pausar" : "Reproducir"}
          onClick={player.togglePlay}
          className="wmp-btn"
        >
          {playing ? <TbPlayerPause className="h-7 w-7" /> : <TbPlayerPlay className="h-7 w-7" />}
        </button>
        <button type="button" aria-label="Siguiente" onClick={player.next} className="wmp-btn">
          <TbPlayerSkipForward className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Detener" onClick={player.stop} className="wmp-btn">
          <TbPlayerStop className="h-5 w-5" />
        </button>
        <div className="ml-2 flex items-center gap-1">
          <TbVolume className="wmp-btn h-4 w-4" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => player.setVolume(Number(e.target.value))}
            className="h-1 w-20 accent-sky-200"
            aria-label="Volumen"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire the hook and `Controls` into `index.tsx`**

Add imports:

```tsx
import Controls from "./Controls";
import useAudioPlayer from "./useAudioPlayer";
```

Instantiate the player near the other state (after `const [dialog, setDialog] = useState<Dialog>(null);`):

```tsx
  const player = useAudioPlayer();
```

Replace the **static bottom pod block** (the `<div className="wmp-body shrink-0 px-4 pb-3 pt-1">…controles…</div>`) with:

```tsx
        <Controls player={player} />
```

- [ ] **Step 4: Verify the build passes**

Run: `bun run build`
Expected: no type errors.

- [ ] **Step 5: Manual check**

Run: `bun dev`, open the player.
Expected: Play starts audio (browser may require the click, which resumes the AudioContext). Pause/resume works; prev/next switch tracks and audio follows; stop resets to 0:00; the time readout and seek bar advance while playing; dragging the seek bar jumps position; volume slider changes loudness; when a track ends the next one auto-plays. No console errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Windows/MediaPlayer
git commit -m "feat(media-player): audio playback hook and control pod

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NNHRvVCeuojtDNQvWApPZk"
```

---

## Task 4: `Visualizer` canvas (audio-reactive)

Add the canvas visualizer that taps `Howler.masterGain` with an `AnalyserNode` and renders a starburst + bars driven by frequency data, tinted by the current accent color.

**Files:**
- Create: `src/components/Windows/MediaPlayer/Visualizer.tsx`
- Modify: `src/components/Windows/MediaPlayer/index.tsx` (add `accent` state; render `<Visualizer accent={accent} />` in the stage)

**Interfaces:**
- Consumes: `howler` global (`Howler.ctx`, `Howler.masterGain`).
- Produces:
  - `type Accent = "blue" | "red" | "green"` and `const ACCENT_COLORS: Record<Accent, string>` — exported from `Visualizer.tsx`, consumed by `Visualizations` (Task 6).
  - `Visualizer` component with props `{ accent: Accent }`.
  - `index.tsx` gains `const [accent, setAccent] = useState<Accent>("blue")` — passed to `Visualizer` now and `Visualizations` in Task 6.

- [ ] **Step 1: Create `Visualizer.tsx`**

```tsx
import { Howler } from "howler";
import { useEffect, useRef } from "react";

export type Accent = "blue" | "red" | "green";

export const ACCENT_COLORS: Record<Accent, string> = {
  blue: "#4a9bff",
  red: "#ff5a5a",
  green: "#4ade80",
};

interface Props {
  accent: Accent;
}

export default function Visualizer({ accent }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const accentRef = useRef(accent);
  accentRef.current = accent;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    // Size the canvas to its container.
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = () => {
      // Lazily create the analyser once the Web Audio context exists.
      if (!analyserRef.current) {
        const audioCtx = Howler.ctx as AudioContext | undefined;
        const master = (Howler as unknown as { masterGain?: GainNode }).masterGain;
        if (audioCtx && master) {
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          master.connect(analyser); // tap only; master stays connected to destination
          analyserRef.current = analyser;
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx2d.clearRect(0, 0, w, h);
      ctx2d.fillStyle = "rgba(0,0,0,0.25)";
      ctx2d.fillRect(0, 0, w, h);

      const color = ACCENT_COLORS[accentRef.current];
      const analyser = analyserRef.current;

      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const cx = w / 2;
        const cy = h / 2;
        const bins = data.length;

        // Radial starburst.
        ctx2d.strokeStyle = color;
        ctx2d.lineWidth = 2;
        for (let i = 0; i < bins; i++) {
          const amp = data[i] / 255;
          const angle = (i / bins) * Math.PI * 2;
          const r0 = 20;
          const r1 = r0 + amp * Math.min(w, h) * 0.42;
          ctx2d.globalAlpha = 0.35 + amp * 0.65;
          ctx2d.beginPath();
          ctx2d.moveTo(cx + Math.cos(angle) * r0, cy + Math.sin(angle) * r0);
          ctx2d.lineTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
          ctx2d.stroke();
        }
        ctx2d.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}
```

- [ ] **Step 2: Add accent state and render the visualizer in `index.tsx`**

Add the import:

```tsx
import Visualizer, { Accent } from "./Visualizer";
```

Add state near the other `useState` calls:

```tsx
  const [accent, setAccent] = useState<Accent>("blue");
```

Replace the placeholder stage content (the `<div className="flex h-full items-center justify-center text-sm text-white/60">{view}</div>`) with the visualizer for now (the full view router arrives in Task 5):

```tsx
            <Visualizer accent={accent} />
```

- [ ] **Step 3: Verify the build passes**

Run: `bun run build`
Expected: no type errors.

- [ ] **Step 4: Manual check**

Run: `bun dev`, open the player, press Play.
Expected: the central stage shows a radial starburst that visibly reacts to the audio (bars grow/shrink with the tone). Before the first play the AudioContext may be suspended and the canvas stays dark/static; it comes alive once playback starts. No console errors; closing the window leaves no runaway animation (no console warnings about audio nodes).

- [ ] **Step 5: Commit**

```bash
git add src/components/Windows/MediaPlayer
git commit -m "feat(media-player): audio-reactive canvas visualizer

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NNHRvVCeuojtDNQvWApPZk"
```

---

## Task 5: View router + `NowPlaying` and `Library` views

Introduce the real views directory and route the stage by `view`. `NowPlaying` wraps the visualizer with the artist/title overlay; `Library` lists all tracks and plays on click.

**Files:**
- Create: `src/components/Windows/MediaPlayer/views/NowPlaying.tsx`
- Create: `src/components/Windows/MediaPlayer/views/Library.tsx`
- Modify: `src/components/Windows/MediaPlayer/index.tsx` (replace the direct `<Visualizer />` with a `view` switch)

**Interfaces:**
- Consumes: `Accent` + `Visualizer` (Task 4); `AudioPlayer` (Task 3); `View` (Task 2).
- Produces:
  - `NowPlaying` props `{ player: AudioPlayer; accent: Accent }`.
  - `Library` props `{ player: AudioPlayer }`.

- [ ] **Step 1: Create `views/NowPlaying.tsx`**

```tsx
import Visualizer, { Accent } from "../Visualizer";
import { AudioPlayer } from "../useAudioPlayer";

interface Props {
  player: AudioPlayer;
  accent: Accent;
}

export default function NowPlaying({ player, accent }: Props) {
  const { track } = player;
  return (
    <div className="relative h-full w-full">
      <Visualizer accent={accent} />
      <div className="pointer-events-none absolute left-4 top-3 text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">
        <div className="text-xs text-white/70">{track.artist ?? ""}</div>
        <div className="text-lg font-semibold">{track.title}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `views/Library.tsx`**

```tsx
import { AudioPlayer } from "../useAudioPlayer";

interface Props {
  player: AudioPlayer;
}

export default function Library({ player }: Props) {
  return (
    <div className="h-full overflow-y-auto p-3 text-white">
      <div className="mb-2 border-b border-white/15 pb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">
        Biblioteca multimedia
      </div>
      <ul className="text-sm">
        {player.tracks.map((tr, i) => {
          const active = i === player.currentIndex;
          return (
            <li key={`${tr.url}-${i}`}>
              <button
                type="button"
                onClick={() => player.playIndex(i)}
                className={`flex w-full items-center justify-between gap-3 rounded px-2 py-1.5 text-left hover:bg-white/10 ${
                  active ? "bg-white/15 font-semibold" : ""
                }`}
              >
                <span className="truncate">{tr.title}</span>
                <span className="shrink-0 text-xs text-white/60">{tr.artist ?? ""}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Route the stage by `view` in `index.tsx`**

Replace the imports for the direct visualizer with the views. Remove `import Visualizer, { Accent } from "./Visualizer";` and replace with:

```tsx
import { Accent } from "./Visualizer";
import Library from "./views/Library";
import NowPlaying from "./views/NowPlaying";
```

Replace the stage content (currently `<Visualizer accent={accent} />`) with a switch. `guide` and `visualizations` render placeholders until Task 6:

```tsx
            {view === "nowplaying" && <NowPlaying player={player} accent={accent} />}
            {view === "library" && <Library player={player} />}
            {(view === "guide" || view === "visualizations") && (
              <div className="flex h-full items-center justify-center text-sm text-white/50">
                {view}
              </div>
            )}
```

- [ ] **Step 4: Verify the build passes**

Run: `bun run build`
Expected: no type errors (the `Accent` import is still used by the `accent` state type).

- [ ] **Step 5: Manual check**

Run: `bun dev`, open the player.
Expected:
- "Reproducción en curso" shows the visualizer with the current artist/title overlaid top-left; the title updates when tracks change.
- "Biblioteca multimedia" lists both tracks; clicking one starts it and highlights it as active; the pod and visualizer follow.
- "Guía multimedia" and "Visualizaciones" show placeholder text (wired next task).

- [ ] **Step 6: Commit**

```bash
git add src/components/Windows/MediaPlayer
git commit -m "feat(media-player): now-playing and library views with nav routing

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NNHRvVCeuojtDNQvWApPZk"
```

---

## Task 6: `Visualizations` + `MediaGuide` views and the CD/Radio XP dialog

Complete the remaining views and replace the temporary dialog overlay with an authentic in-window XP dialog for "Copiar desde CD" and "Radio".

**Files:**
- Create: `src/components/Windows/MediaPlayer/views/Visualizations.tsx`
- Create: `src/components/Windows/MediaPlayer/views/MediaGuide.tsx`
- Create: `src/components/Windows/MediaPlayer/XpDialog.tsx`
- Modify: `src/components/Windows/MediaPlayer/index.tsx` (render the two new views; replace the placeholder dialog with `<XpDialog />`)

**Interfaces:**
- Consumes: `Accent` + `ACCENT_COLORS` (Task 4); `Dialog` (Task 2).
- Produces:
  - `Visualizations` props `{ accent: Accent; onAccentChange: (a: Accent) => void }`.
  - `MediaGuide` — no props.
  - `XpDialog` props `{ title: string; message: string; onClose: () => void }`.

- [ ] **Step 1: Create `views/Visualizations.tsx`**

```tsx
import { Accent, ACCENT_COLORS } from "../Visualizer";

interface Props {
  accent: Accent;
  onAccentChange: (a: Accent) => void;
}

const OPTIONS: { value: Accent; label: string }[] = [
  { value: "blue", label: "Azul clásico" },
  { value: "red", label: "Rojo" },
  { value: "green", label: "Verde" },
];

export default function Visualizations({ accent, onAccentChange }: Props) {
  return (
    <div className="h-full overflow-y-auto p-4 text-white">
      <div className="mb-3 border-b border-white/15 pb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">
        Visualizaciones
      </div>
      <p className="mb-3 text-sm text-white/70">Color de acento del visualizador:</p>
      <div className="flex flex-col gap-2">
        {OPTIONS.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="wmp-accent"
              checked={accent === opt.value}
              onChange={() => onAccentChange(opt.value)}
            />
            <span
              className="inline-block h-4 w-4 rounded-sm"
              style={{ background: ACCENT_COLORS[opt.value] }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `views/MediaGuide.tsx`**

```tsx
export default function MediaGuide() {
  return (
    <div className="h-full overflow-y-auto p-5 text-white">
      <div className="mb-3 border-b border-white/15 pb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">
        Guía multimedia
      </div>
      <h2 className="mb-2 text-lg font-semibold">Windows Media Player</h2>
      <p className="max-w-prose text-sm text-white/80">
        Reproductor de música ambientado en Windows XP, parte del portfolio de
        Ignacio Iglesias. Reproducí las pistas desde la Biblioteca, mirá el
        visualizador reaccionar al audio y cambiá el color de acento en
        Visualizaciones.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create `XpDialog.tsx`**

```tsx
interface Props {
  title: string;
  message: string;
  onClose: () => void;
}

export default function XpDialog({ title, message, onClose }: Props) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
      <div className="w-72 overflow-hidden rounded-t-[6px] border border-luna-frame bg-white text-black shadow-2xl">
        <div className="xp-titlebar flex h-7 items-center px-2 text-sm font-bold text-white [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
          {title}
        </div>
        <div className="p-4 text-sm">{message}</div>
        <div className="flex justify-end px-4 pb-3">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="min-w-[72px] rounded-sm border border-slate-400 bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire the new views and dialog into `index.tsx`**

Add imports:

```tsx
import XpDialog from "./XpDialog";
import MediaGuide from "./views/MediaGuide";
import Visualizations from "./views/Visualizations";
```

Replace the combined `guide`/`visualizations` placeholder block with real views:

```tsx
            {view === "guide" && <MediaGuide />}
            {view === "visualizations" && (
              <Visualizations accent={accent} onAccentChange={setAccent} />
            )}
```

Replace the placeholder dialog block (the `{dialog && (<button …>{dialog}</button>)}`) with the XP dialog. Map the two dialog kinds to authentic XP copy:

```tsx
        {dialog && (
          <XpDialog
            title={dialog === "cd" ? "Copiar desde CD" : "Radio"}
            message={
              dialog === "cd"
                ? "No se detectó ninguna unidad de CD."
                : "Sin conexión a Internet."
            }
            onClose={() => setDialog(null)}
          />
        )}
```

- [ ] **Step 5: Verify the build passes**

Run: `bun run build`
Expected: no type errors.

- [ ] **Step 6: Manual check**

Run: `bun dev`, open the player.
Expected:
- "Visualizaciones" shows three accent options; selecting Rojo/Verde/Azul changes the visualizer color live (switch back to "Reproducción en curso" to confirm while playing).
- "Guía multimedia" shows the static about page.
- "Copiar desde CD" opens an XP dialog reading "No se detectó ninguna unidad de CD." with an Aceptar button that closes it; "Radio" opens one reading "Sin conexión a Internet."

- [ ] **Step 7: Commit**

```bash
git add src/components/Windows/MediaPlayer
git commit -m "feat(media-player): visualizations + guide views and CD/Radio XP dialog

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NNHRvVCeuojtDNQvWApPZk"
```

---

## Task 7: End-to-end verification against the spec

Run the spec's full verification checklist against the finished feature and fix any gaps. No new files expected; this is the acceptance gate.

**Files:**
- Modify: only as needed to fix defects found here.

- [ ] **Step 1: Build and lint clean**

Run: `bun run build && bun run lint`
Expected: build succeeds; lint reports no new errors in `src/components/Windows/MediaPlayer/`.

- [ ] **Step 2: Walk the spec verification list in `bun dev`**

Confirm each item from the spec's "Verificación" section:
1. Open the player from the desktop icon, Start menu, and taskbar.
2. Playback: visualizer reacts; play/pause, prev, next, stop, seek, volume all work; time advances; track auto-advances on end.
3. Library: clicking a track plays it.
4. Visualizations: changing the accent changes the visualizer color.
5. "Copiar desde CD" / "Radio" show the XP dialog.
6. Window management: minimize/restore/close/focus/drag/resize via taskbar and chrome, consistent with other windows; fullscreen on mobile viewport.
7. `bun run build` passes with no type errors.

- [ ] **Step 3: Confirm cleanup is complete**

Run: `grep -rn "Mochify" src/`
Expected: no output. Confirm `src/components/Windows/MochiDraw.tsx` is untouched.

- [ ] **Step 4: Final commit (only if fixes were made)**

```bash
git add -A
git commit -m "fix(media-player): address end-to-end verification findings

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NNHRvVCeuojtDNQvWApPZk"
```

If no fixes were needed, skip the commit and note that verification passed clean.

---

## Notes for the implementer

- **AudioContext autoplay policy:** browsers start the Web Audio context suspended until a user gesture. Howler resumes it on the first `play()`, which is user-initiated here (clicking Play), so no extra handling is required. The visualizer simply stays static until then.
- **`Howler.masterGain` typing:** `@types/howler` does not expose `masterGain`, hence the narrow cast in `Visualizer.tsx`. Do not widen it globally.
- **Single player instance:** `useAudioPlayer` is instantiated once in `index.tsx` and passed down by props. Do not call it again in child components — that would create independent, conflicting Howler graphs.
- **Type-only circular import:** `NavPanel` and the views import `View`/`Accent` **types** from sibling modules; these are erased at compile time and are safe. Keep them type-only.
