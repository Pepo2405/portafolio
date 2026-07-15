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
    handleOpen,
    handleMaximize,
    handleMinimize,
  } = useWindow();
  const [startOpen, setStartOpen] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const startBtnRef = useRef<HTMLButtonElement>(null);

  // Cerrar el menú Inicio al clickear afuera o presionar Escape.
  useEffect(() => {
    if (!startOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setStartOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStartOpen(false);
        startBtnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [startOpen]);

  // Al abrir el menú, enfocar el primer ítem.
  useEffect(() => {
    if (startOpen) firstItemRef.current?.focus();
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
            ref={startBtnRef}
            type="button"
            aria-haspopup="dialog"
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
              role="dialog"
              aria-label="Menú Inicio"
              className="xp-startmenu absolute bottom-full left-0 w-[380px] overflow-hidden bg-white shadow-2xl"
            >
              <header className="xp-startmenu-header flex items-center gap-3 px-4 py-2 text-white">
                <img
                  src="/kirby.webp"
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-md border border-white/60 bg-white/20"
                />
                <span className="text-base font-bold [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
                  Ignacio Iglesias
                </span>
              </header>

              <div className="flex">
                <div className="flex w-1/2 flex-col bg-white py-2">
                  {Object.entries(WINDOW_META).map(([title, meta], i) => (
                    <button
                      key={title}
                      type="button"
                      ref={i === 0 ? firstItemRef : undefined}
                      onClick={() => {
                        handleOpen({ target: { title } });
                        setStartOpen(false);
                      }}
                      className="xp-select flex items-center gap-3 px-3 py-2 text-left text-black"
                    >
                      <img src={meta.icon} alt="" width={24} height={24} />
                      <span className="text-sm font-bold">{meta.label}</span>
                    </button>
                  ))}
                  <a
                    href="/static/Cv Ignacio Iglesias.pdf"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setStartOpen(false)}
                    className="xp-select flex items-center gap-3 px-3 py-2 text-left text-black"
                  >
                    <img src="/static/icons/chrome.svg" alt="" width={24} height={24} />
                    <span className="text-sm font-bold">Curriculum</span>
                  </a>
                </div>

                <div className="flex w-1/2 flex-col bg-luna-menuRight py-2">
                  {Tasks.map(({ title, href, icon }) => (
                    <a
                      key={title}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setStartOpen(false)}
                      className="xp-select flex items-center gap-3 px-3 py-2 text-left text-black"
                    >
                      <img src={icon} alt="" width={22} height={22} />
                      <span className="text-sm">{title}</span>
                    </a>
                  ))}
                </div>
              </div>

              <footer className="xp-startmenu-footer flex items-center justify-end gap-4 px-4 py-2 text-white">
                <button
                  type="button"
                  onClick={() => setStartOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold hover:brightness-110"
                >
                  <span aria-hidden>🔑</span> Cerrar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setStartOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold hover:brightness-110"
                >
                  <span aria-hidden>⏻</span> Apagar
                </button>
              </footer>
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
