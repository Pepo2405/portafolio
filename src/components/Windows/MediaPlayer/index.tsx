import gsap from "gsap";
import { Resizable } from "re-resizable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TbCopy, TbMinus, TbSquare, TbX } from "react-icons/tb";
import useDragMove, { Pos } from "src/hooks/useDragMove";
import useIsMobile from "src/hooks/useIsMobile";
import useWindow from "src/hooks/useWindow";
import { WINDOW_META } from "src/lists/windows";
import Controls from "./Controls";
import NavPanel from "./NavPanel";
import useAudioPlayer from "./useAudioPlayer";

export type View = "nowplaying" | "library" | "guide" | "visualizations";
export type Dialog = "cd" | "radio" | null;

export const WMP_TITLE = "Reproductor";

type Size = { width: number; height: number };

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

  const player = useAudioPlayer();

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

        <Controls player={player} />

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
