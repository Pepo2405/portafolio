import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import SobreMi from "src/components/Windows/SobreMi";
import { I18nProvider } from "src/i18n";

describe("link de idioma", () => {
  test("apunta a la misma página en el otro idioma", () => {
    const html = renderToString(
      <I18nProvider locale="es" alternateHref="/en/proyectos/goblin/">
        <SobreMi />
      </I18nProvider>
    );
    expect(html).toContain('href="/en/proyectos/goblin/"');
  });
});
