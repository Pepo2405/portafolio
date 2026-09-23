import { describe, expect, test } from "bun:test";
import { WINDOW_META, windowLabel } from "src/lists/windows";

describe("labels de ventana", () => {
  test("todos los labels tienen es y en", () => {
    for (const [title, meta] of Object.entries(WINDOW_META)) {
      expect(meta.label.es.trim(), title).not.toBe("");
      expect(meta.label.en.trim(), title).not.toBe("");
    }
  });

  test("windowLabel traduce y cae al título para fichas de proyecto", () => {
    expect(windowLabel("Sobre mí")).toEqual({ es: "Sobre mí", en: "About me" });
    expect(windowLabel("Gym Admin")).toEqual({ es: "Gym Admin", en: "Gym Admin" });
    expect(windowLabel("Gym App Móvil")).toEqual({
      es: "Gym App Móvil",
      en: "Gym Mobile App",
    });
  });
});
