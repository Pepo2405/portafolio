import { useEffect, useRef, useState } from "react";
import { xpLogoIcon } from "src/images";
import list from "src/lists/taskList.json";
import DateTime from "./dateTime";
import useWindow from "src/hooks/useWindow";
import useFocusTrap from "src/hooks/useFocusTrap";
import { useT } from "src/i18n";
import { WINDOW_META, windowIcon, windowLabel } from "src/lists/windows";

interface Props {
  /** Cierra todas las ventanas y resetea el layout de íconos. */
  onLogOff: () => void;
  /** Muestra la pantalla de apagado. */
  onShutdown: () => void;
}

const TaskBar = ({ onLogOff, onShutdown }: Props) => {
  const t = useT();
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
  const startBtnRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(startRef, startOpen);

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

  // Al abrir el menú, el foco entra al panel (lo maneja useFocusTrap).
  // Las ventanas abiertas salen del contexto, no de WINDOW_META: así las fichas
  // de proyecto también aparecen en la taskbar.
  const openWindows = Object.keys(minimizedItems).filter(
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
              alt={t("taskbar.start")}
              src={xpLogoIcon}
              className="min-w-fit shadow-xl"
            />{" "}
            <span className="font-bold italic">{t("taskbar.start")}</span>
          </button>

          {startOpen && (
            <div
              role="dialog"
              aria-label={t("taskbar.startMenu")}
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
                  {Object.entries(WINDOW_META).map(([title, meta]) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => {
                        handleOpen({ target: { title } });
                        setStartOpen(false);
                      }}
                      className="xp-select flex items-center gap-3 px-3 py-2 text-left text-black"
                    >
                      <img src={meta.icon} alt="" width={24} height={24} />
                      <span className="text-sm font-bold">{t(meta.label)}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      handleOpen({ target: { title: "Curriculum" } });
                      setStartOpen(false);
                    }}
                    className="xp-select flex items-center gap-3 px-3 py-2 text-left text-black"
                  >
                    <img src="/static/icons/cv.svg" alt="" width={24} height={24} />
                    <span className="text-sm font-bold">{t(windowLabel("Curriculum"))}</span>
                  </button>
                </div>

                <div className="flex w-1/2 flex-col bg-luna-menuRight py-2">
                  {Tasks.map(({ title, href, icon }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setStartOpen(false)}
                      className="xp-select flex items-center gap-3 px-3 py-2 text-left text-black"
                    >
                      <img src={icon} alt="" width={22} height={22} />
                      <span className="text-sm">{t(title)}</span>
                    </a>
                  ))}
                </div>
              </div>

              <footer className="xp-startmenu-footer flex items-center justify-end gap-4 px-4 py-2 text-white">
                <button
                  type="button"
                  onClick={() => {
                    setStartOpen(false);
                    onLogOff();
                  }}
                  className="flex items-center gap-2 text-sm font-semibold hover:brightness-110"
                >
                  <span aria-hidden>🔑</span> {t("taskbar.logOff")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartOpen(false);
                    onShutdown();
                  }}
                  className="flex items-center gap-2 text-sm font-semibold hover:brightness-110"
                >
                  <span aria-hidden>⏻</span> {t("taskbar.shutdown")}
                </button>
              </footer>
            </div>
          )}
        </div>

        <div className="flex h-full min-w-0 grow items-center gap-1 overflow-x-auto pl-2">
          {openWindows.map((title) => {
            const active = focused === title;
            const icon = windowIcon(title);
            return (
              <button
                type="button"
                key={title}
                title={t(windowLabel(title))}
                aria-label={t(windowLabel(title))}
                aria-pressed={active}
                onClick={() => onTaskClick(title)}
                className={`shadowText relative z-50 flex h-full w-auto shrink-0 items-center justify-center gap-2 px-3 text-sm text-white transition-colors md:w-40 md:max-w-[40vw] md:justify-start ${
                  active ? "bg-blue-800/70 shadow-inner" : "hover:bg-blue-600/60"
                }`}
              >
                {icon && (
                  <img alt="" width={18} height={18} src={icon} className="shrink-0" />
                )}
                <span className="hidden truncate md:block">{t(windowLabel(title))}</span>
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
