import { PointerEvent as ReactPointerEvent, RefObject, useRef, useState } from "react";

export type Pos = { x: number; y: number };

interface Options {
  /** Window root, used to keep part of it on screen while dragging. */
  nodeRef: RefObject<HTMLElement>;
  disabled?: boolean;
  onStart?: () => void;
  /** Fired on pointer up; `moved` is false for a click that never dragged. */
  onEnd?: (pointer: Pos, moved: boolean) => void;
}

// Keep at least this much of the window reachable on screen.
const KEEP_VISIBLE = 80;
const TITLE_H = 36;
const MOVE_THRESHOLD = 3;

export default function useDragMove(initial: Pos, opts: Options) {
  const [pos, setPos] = useState<Pos>(initial);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ px: number; py: number; ox: number; oy: number } | null>(
    null
  );
  const moved = useRef(false);

  const handlers = {
    onPointerDown(e: ReactPointerEvent) {
      if (opts.disabled || e.button !== 0) return;
      // Record the grab, but don't capture yet: capturing here would swallow
      // the native click / dblclick used to maximize. Capture on real movement.
      start.current = { px: e.clientX, py: e.clientY, ox: pos.x, oy: pos.y };
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
        setDragging(true);
        opts.onStart?.();
      }
      const width = opts.nodeRef.current?.offsetWidth ?? 0;
      const nextX = Math.max(
        Math.min(0, -(width - KEEP_VISIBLE)),
        Math.min(s.ox + dx, window.innerWidth - KEEP_VISIBLE)
      );
      const nextY = Math.max(0, Math.min(s.oy + dy, window.innerHeight - TITLE_H));
      setPos({ x: nextX, y: nextY });
    },
    onPointerUp(e: ReactPointerEvent) {
      if (!start.current) return;
      const wasMoved = moved.current;
      start.current = null;
      if (wasMoved) {
        setDragging(false);
        opts.onEnd?.({ x: e.clientX, y: e.clientY }, true);
      }
    },
  };

  return { pos, setPos, dragging, handlers };
}
