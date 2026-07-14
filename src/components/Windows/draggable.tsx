import gsap from "gsap";
import { Resizable } from "re-resizable";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useDragMove, { Pos } from "src/hooks/useDragMove";
import useIsMobile from "src/hooks/useIsMobile";
import useWindow from "src/hooks/useWindow";
import TitleBar from "./TitleBar";
import { WINDOW_META } from "src/lists/windows";

interface Props {
  children?: ReactNode;
  close: (e: { target: { title: string } }) => void;
  title?: string;
}

type Size = { width: number; height: number };

const TASKBAR = 32;
const SNAP = 14;
const RESIZE_ENABLE = {
  top: true,
  right: true,
  bottom: true,
  left: true,
  topRight: true,
  bottomRight: true,
  bottomLeft: true,
  topLeft: true,
};
const RESIZE_DISABLED = {
  top: false,
  right: false,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
};

// Cascade successive windows so they never spawn perfectly stacked.
let spawnCounter = 0;

export default function DraggableWin({ children, close, title }: Props) {
  const t = title ?? "Titulo";
  const isMobile = useIsMobile();
  const { focusWindow, zIndexOf, handleMinimize, focused } = useWindow();

  const rootRef = useRef<HTMLDivElement>(null);
  const resizeOrigin = useRef<Pos>({ x: 0, y: 0 });
  const [full, setFull] = useState(false);
  const [size, setSize] = useState<Size>({ width: 600, height: 430 });

  const spawn = useMemo<Pos>(() => {
    const i = spawnCounter++ % 6;
    return { x: 64 + i * 30, y: 36 + i * 30 };
  }, []);

  const isFull = full || isMobile;

  const onDragEnd = useCallback(
    (pointer: Pos, moved: boolean) => {
      if (!moved || isMobile) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (pointer.y <= SNAP) {
        setFull(true);
      } else if (pointer.x <= SNAP) {
        setFull(false);
        setPos({ x: 0, y: 0 });
        setSize({ width: Math.round(vw / 2), height: vh - TASKBAR });
      } else if (pointer.x >= vw - SNAP) {
        setFull(false);
        setPos({ x: Math.round(vw / 2), y: 0 });
        setSize({ width: Math.round(vw / 2), height: vh - TASKBAR });
      }
    },
    // setPos/setSize are stable setters, referenced only after render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobile]
  );

  const { pos, setPos, dragging, handlers } = useDragMove(spawn, {
    nodeRef: rootRef,
    disabled: isFull,
    onStart: () => focusWindow(t),
    onEnd: onDragEnd,
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

  // Entrance animation + initial focus.
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

  // Esc closes the focused window.
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
      className={isFull ? "" : `rounded-lg ${active ? "shadow-2xl" : "shadow-lg"}`}
    >
      <Resizable
        size={isFull ? { width: "100%", height: "100%" } : size}
        enable={isFull ? RESIZE_DISABLED : RESIZE_ENABLE}
        minWidth={240}
        minHeight={200}
        maxWidth="95vw"
        maxHeight="95vh"
        className={`flex h-full w-full flex-col overflow-hidden bg-white ${
          isFull ? "" : "rounded-lg ring-1 ring-black/10"
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
        <div className="min-h-0 flex-1 overflow-hidden text-black">
          {children}
        </div>
      </Resizable>
    </div>
  );
}
