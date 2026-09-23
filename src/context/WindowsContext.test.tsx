import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { WindowsProvider } from "src/context/WindowsContext";
import useWindow from "src/hooks/useWindow";

const Probe = () => {
  const { visibleItems } = useWindow();
  return <span data-open={Object.entries(visibleItems).filter(([, v]) => v).map(([k]) => k).join(",")} />;
};

describe("WindowsProvider", () => {
  test("siembra las ventanas iniciales de la ruta", () => {
    const html = renderToString(
      <WindowsProvider initialWindows={["Proyectos", "Gym Admin"]}>
        <Probe />
      </WindowsProvider>
    );
    expect(html).toContain('data-open="Proyectos,Gym Admin"');
  });

  test("default: Sobre mí abierto", () => {
    const html = renderToString(
      <WindowsProvider>
        <Probe />
      </WindowsProvider>
    );
    expect(html).toContain('data-open="Sobre mí"');
  });
});
