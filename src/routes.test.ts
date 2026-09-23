import { describe, expect, test } from "bun:test";
import {
  PROJECT_ROUTES,
  ROUTES,
  alternateHref,
  alternatePath,
  parseRoute,
  slugify,
} from "src/routes";

describe("slugify", () => {
  test("normaliza títulos reales de proyectos", () => {
    expect(slugify("Huésped+")).toBe("huesped-plus");
    expect(slugify("Gym App Móvil")).toBe("gym-app-movil");
    expect(slugify("Lector de Huellas")).toBe("lector-de-huellas");
    expect(slugify("Mecánica Torres")).toBe("mecanica-torres");
    expect(slugify("Slop Together")).toBe("slop-together");
  });
});

describe("ROUTES", () => {
  test("los slugs de proyecto quedan anclados", () => {
    expect(PROJECT_ROUTES.map((r) => r.path)).toEqual([
      "/proyectos/huesped-plus/",
      "/proyectos/gym-admin/",
      "/proyectos/gym-app-movil/",
      "/proyectos/lector-de-huellas/",
      "/proyectos/goblin/",
      "/proyectos/slop-together/",
      "/proyectos/mecanica-torres/",
      "/proyectos/scrappers-de-precios/",
      "/proyectos/bonitas-ayelen/",
    ]);
  });

  test("20 rutas: 2 homes + 9 proyectos, por idioma", () => {
    expect(ROUTES.length).toBe(20);
    expect(ROUTES.filter((r) => r.kind === "home").length).toBe(2);
  });

  test("toda ruta tiene barra final y absoluta", () => {
    for (const r of ROUTES) {
      expect(r.path.startsWith("/"), r.path).toBe(true);
      expect(r.path.endsWith("/"), r.path).toBe(true);
    }
  });
});

describe("parseRoute", () => {
  test("home en español", () => {
    expect(parseRoute("/")).toEqual({ locale: "es", initialWindows: ["Sobre mí"] });
  });

  test("ficha de proyecto abre Proyectos + la ficha", () => {
    expect(parseRoute("/proyectos/gym-admin/")).toEqual({
      locale: "es",
      initialWindows: ["Proyectos", "Gym Admin"],
    });
  });

  test("acepta URL sin barra final", () => {
    expect(parseRoute("/en/proyectos/goblin")).toEqual({
      locale: "en",
      initialWindows: ["Proyectos", "Goblin"],
    });
  });

  test("ruta desconocida cae en la home en español", () => {
    expect(parseRoute("/no-existe/")).toEqual({
      locale: "es",
      initialWindows: ["Sobre mí"],
    });
  });
});

describe("alternatePath", () => {
  test("es -> en y en -> es", () => {
    expect(alternatePath(ROUTES[0])).toBe("/en/");
    const ficha = ROUTES.find((r) => r.path === "/proyectos/goblin/")!;
    expect(alternatePath(ficha)).toBe("/en/proyectos/goblin/");
    const enHome = ROUTES.find((r) => r.path === "/en/")!;
    expect(alternatePath(enHome)).toBe("/");
  });
});

describe("alternateHref", () => {
  test("misma página en el otro idioma, con o sin barra final", () => {
    expect(alternateHref("/")).toBe("/en/");
    expect(alternateHref("/proyectos/goblin")).toBe("/en/proyectos/goblin/");
    expect(alternateHref("/en/proyectos/goblin/")).toBe("/proyectos/goblin/");
  });

  test("ruta desconocida lleva a la home en inglés", () => {
    expect(alternateHref("/no-existe/")).toBe("/en/");
  });
});
