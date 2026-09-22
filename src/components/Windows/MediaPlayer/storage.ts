// Helpers para persistir ajustes del reproductor en localStorage.
// Todo acceso va con try/catch: en navegación privada el storage puede fallar.

export function readStored<T>(
  key: string,
  fallback: T,
  parse: (raw: string) => T | null
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const value = parse(raw);
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento: los ajustes viven solo en memoria.
  }
}

export const VIZ_KEY = "wmp:viz";
export const VOLUME_KEY = "wmp:volume";
