import { describe, expect, test } from "bun:test";
import { en } from "src/i18n/en";
import { es } from "src/i18n/es";
import { fmt, pick } from "src/i18n/text";

describe("i18n", () => {
  test("en tiene exactamente las claves de es", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  test("ninguna traducción queda vacía", () => {
    for (const [key, value] of Object.entries({ ...es, ...en })) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  test("pick elige el idioma del par", () => {
    const par: Bi = { es: "hola", en: "hi" };
    expect(pick(par, "es")).toBe("hola");
    expect(pick(par, "en")).toBe("hi");
    expect(pick("taskbar.start", "es")).toBe(es["taskbar.start"]);
  });

  test("fmt reemplaza las variables", () => {
    expect(fmt("Abriendo {title}", { title: "Goblin" })).toBe("Abriendo Goblin");
  });

  test("fmt deja visible la variable faltante", () => {
    expect(fmt("Hola {name}", {})).toBe("Hola {name}");
  });
});
