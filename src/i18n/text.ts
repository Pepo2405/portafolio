import type { Catalog, StringKey } from "src/i18n/es";
import { en } from "src/i18n/en";
import { es } from "src/i18n/es";

const CATALOGS: Record<Locale, Catalog> = { es, en };

/** Resuelve una clave del catálogo o un par {es, en} al idioma dado. */
export function pick(v: StringKey | Bi, locale: Locale): string {
  return typeof v === "string" ? CATALOGS[locale][v] : v[locale];
}

/**
 * Formatea un template del catálogo con variables `{nombre}`.
 * La variable faltante queda visible en vez de desaparecer.
 */
export function fmt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => vars[k] ?? `{${k}}`);
}
