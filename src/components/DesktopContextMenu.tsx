import { useEffect, useRef } from "react";

export type MenuItem =
  | { type: "action"; label: string; onSelect: () => void }
  | { type: "disabled"; label: string }
  | { type: "separator" };

type Props = {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
};

const MENU_W = 190;
const ITEM_H = 24;

export default function DesktopContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  // Cerrar al clickear afuera o presionar Escape.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // Enfocar el primer ítem accionable al abrir.
  useEffect(() => {
    firstItemRef.current?.focus();
  }, []);

  // Clamp al viewport para no desbordar.
  const left = Math.min(x, window.innerWidth - MENU_W - 4);
  const top = Math.min(y, window.innerHeight - items.length * ITEM_H - 8);

  let firstAssigned = false;

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Menú del escritorio"
      className="xp-menu"
      style={{ position: "fixed", left, top, width: MENU_W, zIndex: 1000 }}
    >
      {items.map((item, i) => {
        if (item.type === "separator") {
          return <div key={i} className="xp-menu-sep" aria-hidden="true" />;
        }
        if (item.type === "disabled") {
          return (
            <div
              key={i}
              role="menuitem"
              aria-disabled="true"
              className="xp-menu-item xp-menu-item--disabled"
            >
              {item.label}
            </div>
          );
        }
        const isFirst = !firstAssigned;
        firstAssigned = true;
        return (
          <button
            key={i}
            ref={isFirst ? firstItemRef : undefined}
            type="button"
            role="menuitem"
            className="xp-menu-item"
            onClick={() => {
              item.onSelect();
              onClose();
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
