import { ReactNode, createContext, useContext, useMemo } from "react";
import type { StringKey } from "src/i18n/es";
import { pick } from "src/i18n/text";

export { fmt, pick } from "src/i18n/text";

type T = (v: StringKey | Bi) => string;

interface I18nCtx {
  locale: Locale;
  t: T;
  /** Href de la misma página en el otro idioma (link de idioma). */
  alternateHref: string;
}

const fallback: I18nCtx = {
  locale: "es",
  t: (v) => pick(v, "es"),
  alternateHref: "/en/",
};
const I18nContext = createContext<I18nCtx>(fallback);

export function I18nProvider({
  locale,
  alternateHref = locale === "es" ? "/en/" : "/",
  children,
}: {
  locale: Locale;
  alternateHref?: string;
  children: ReactNode;
}) {
  const value = useMemo<I18nCtx>(
    () => ({ locale, t: (v) => pick(v, locale), alternateHref }),
    [locale, alternateHref]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nCtx {
  return useContext(I18nContext);
}

export function useT(): T {
  return useContext(I18nContext).t;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}
