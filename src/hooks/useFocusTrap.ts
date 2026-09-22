import { RefObject, useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Mantiene el foco dentro de `ref` mientras `active` es true (Tab cicla).
 * Sin esto, un menú/diálogo modal deja que el foco se escape al fondo.
 */
export default function useFocusTrap(
  ref: RefObject<HTMLElement>,
  active: boolean,
  focusFirst = true
) {
  // Foco inicial en el primer elemento focuseable.
  useEffect(() => {
    if (!active || !focusFirst) return;
    const node = ref.current;
    if (!node) return;
    const first = node.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }, [active, focusFirst, ref]);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.getClientRects().length > 0);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [active, ref]);
}
