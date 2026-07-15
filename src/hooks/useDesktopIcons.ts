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
