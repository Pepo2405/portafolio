import { afterEach, describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import useIsMobile from "src/hooks/useIsMobile";

function Probe() {
  return <span>{String(useIsMobile())}</span>;
}

describe("useIsMobile", () => {
  const original = (globalThis as { window?: unknown }).window;

  afterEach(() => {
    if (original === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      (globalThis as { window?: unknown }).window = original;
    }
  });

  test("en SSR devuelve false aunque matchMedia diga true", () => {
    (globalThis as { window?: unknown }).window = {
      matchMedia: () => ({
        matches: true,
        addEventListener() {},
        removeEventListener() {},
      }),
    };
    expect(renderToString(<Probe />)).toContain(">false<");
  });
});
