import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import DateTime from "src/components/dateTime";

describe("DateTime", () => {
  test("el HTML prerenderizado no trae la hora del build", () => {
    expect(renderToString(<DateTime />)).not.toMatch(/\d{2}:\d{2}/);
  });
});
