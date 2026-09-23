import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import SeoContent from "src/components/SeoContent";
import { I18nProvider } from "src/i18n";
import proyectsData from "src/lists/proyects.json";

const PROJECTS = proyectsData.proyects as Project[];

function render(locale: Locale): string {
  return renderToString(
    <I18nProvider locale={locale}>
      <SeoContent />
    </I18nProvider>
  );
}

describe("SeoContent", () => {
  test("incluye todos los proyectos en el HTML", () => {
    const html = render("es");
    for (const p of PROJECTS) expect(html, p.title).toContain(p.title);
  });

  test("incluye la bio completa en español", () => {
    const html = render("es");
    expect(html).toContain("Ingeniero full-stack senior");
    expect(html).toContain("hotel agéntico");
  });

  test("traduce el rol en español", () => {
    expect(render("es")).toContain("Desarrollador Full Stack");
  });

  test("incluye la bio en inglés", () => {
    const html = render("en");
    expect(html).toContain("Senior full-stack engineer");
    expect(html).toContain("agentic hotel");
  });

  test("traduce el rol en inglés", () => {
    expect(render("en")).toContain("Senior Full-Stack Engineer");
  });

  test("usa sr-only, nunca display:none", () => {
    const html = render("es");
    expect(html).toContain("sr-only");
    expect(html).not.toContain("display:none");
    expect(html).not.toContain("visibility:hidden");
  });

  test("linkea GitHub y LinkedIn", () => {
    const html = render("es");
    expect(html).toContain("https://github.com/pepo2405");
    expect(html).toContain("https://www.linkedin.com/in/ignacioniglesias2405/");
  });
});
