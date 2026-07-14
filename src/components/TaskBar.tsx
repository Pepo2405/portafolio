import { useEffect, useRef, useState } from "react";
import { xpLogoIcon } from "src/images";
import list from "src/lists/taskList.json";
import DateTime from "./dateTime";
import useWindow from "src/hooks/useWindow";
import { WINDOW_META } from "src/lists/windows";

const TaskBar = () => {
  const { items: Tasks } = list;
  const {
    visibleItems,
    minimizedItems,
    focused,
    handleMaximize,
    handleMinimize,
  } = useWindow();
  const [startOpen, setStartOpen] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú Inicio al clickear afuera o presionar Escape.
  useEffect(() => {
    if (!startOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setStartOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStartOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [startOpen]);

  // Una ventana aparece en la taskbar mientras siga abierta (a la vista o minimizada).
  const openWindows = Object.keys(WINDOW_META).filter(
    (title) => minimizedItems[title]
  );

  const onTaskClick = (title: string) => {
    // Enfocada y a la vista → minimizar; en cualquier otro caso restaurar + enfocar.
    if (visibleItems[title] && focused === title) {
      handleMinimize({ target: { title } });
    } else {
      handleMaximize({ target: { title } });
    }
  };

  return (
    <nav className="xp-taskbar fixed inset-x-0 bottom-0 z-30 flex h-8 w-full justify-between">
      <section className="flex h-full min-w-0 items-center">
        <div ref={startRef} className="relative h-full">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={startOpen}
            onClick={() => setStartOpen((v) => !v)}
            className="xp-start z-50 flex h-full items-center gap-2 px-2 pr-4"
          >
            <img
              width={20}
              height={20}
              alt="Inicio"
              src={xpLogoIcon}
              className="min-w-fit shadow-xl"
            />{" "}
            <span className="font-bold italic">Inicio</span>
          </button>

          {startOpen && (
            <div
              role="menu"
              className="absolute bottom-full left-0 flex h-80 w-72 flex-col items-start justify-between rounded-t-sm bg-white shadow-2xl"
            >
              <header className="flex h-8 w-full items-center rounded-t-sm bg-blue-500 pl-4 text-left font-semibold text-white">
                Hablemos
              </header>
              <div className="flex w-full grow flex-col">
                {Tasks.map(({ title, href, icon }) => (
                  <a
                    key={title}
                    role="menuitem"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setStartOpen(false)}
                    className="flex w-full justify-start hover:bg-gray-400/50"
                  >
                    <span className="flex w-full items-center p-4 text-black">
                      <img
                        alt=""
                        width={20}
                        height={20}
                        src={icon}
                        className="mx-2"
                      />
                      {title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex h-full min-w-0 grow items-center gap-1 overflow-x-auto pl-2">
          {openWindows.map((title) => {
            const active = focused === title;
            return (
              <button
                type="button"
                key={title}
                title={title}
                aria-label={title}
                aria-pressed={active}
                onClick={() => onTaskClick(title)}
                className={`shadowText relative z-50 flex h-full w-auto shrink-0 items-center justify-center gap-2 px-3 text-sm text-white transition-colors md:w-40 md:max-w-[40vw] md:justify-start ${
                  active ? "bg-blue-800/70 shadow-inner" : "hover:bg-blue-600/60"
                }`}
              >
                <img
                  alt=""
                  width={18}
                  height={18}
                  src={WINDOW_META[title].icon}
                  className="shrink-0"
                />
                <span className="hidden truncate md:block">{title}</span>
              </button>
            );
          })}
        </div>
      </section>

      <span className="xp-tray flex shrink-0 items-center justify-center px-3 text-sm text-white">
        <DateTime />
      </span>
    </nav>
  );
};

export default TaskBar;
