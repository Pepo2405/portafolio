import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import SobreMi from "src/components/Windows/SobreMi";
import Curriculum from "src/components/Windows/Curriculum";
import MediaGuide from "src/components/Windows/MediaPlayer/views/MediaGuide";
import { I18nProvider } from "src/i18n";

function render(locale: Locale, node: JSX.Element): string {
  return renderToString(<I18nProvider locale={locale}>{node}</I18nProvider>);
}

describe("UI traducida", () => {
  test("Sobre mí en español", () => {
    const html = render("es", <SobreMi />);
    expect(html).toContain("Stack principal");
    expect(html).toContain("Ver proyectos");
    expect(html).toContain("English version");
  });

  test("Sobre mí en inglés", () => {
    const html = render("en", <SobreMi />);
    expect(html).toContain("Main stack");
    expect(html).toContain("See projects");
    expect(html).toContain("Versión en español");
  });

  test("Media Guide traducido", () => {
    expect(render("es", <MediaGuide />)).toContain("Guía multimedia");
    expect(render("en", <MediaGuide />)).toContain("Media guide");
  });

  test("Curriculum nombra la ventana Proyectos traducida", () => {
    const en = render("en", <Curriculum />);
    expect(en).toContain("Projects");
    expect(en).not.toContain("Proyectos");
    expect(render("es", <Curriculum />)).toContain("Proyectos");
  });
});
