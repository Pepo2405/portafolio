import { useSyncExternalStore } from "react";

/**
 * Tracks a media query; defaults to Tailwind's `md` breakpoint.
 * El server snapshot devuelve `false` para evitar el mismatch de hidratación
 * entre el HTML prerenderizado y el primer render del cliente en móvil.
 */
export default function useIsMobile(query = "(max-width: 767px)"): boolean {
  const subscribe = (onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
