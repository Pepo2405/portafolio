import React from "react";
import { TaskBartGradient, xpLogoIcon } from "src/images";
import list from "src/lists/taskList.json";
import DateTime from "./dateTime";
import useWindow from "src/hooks/useWindow";

type Props = {};

// Ventanas reales del escritorio: las únicas que pueden abrirse/minimizarse.
// La clave debe coincidir EXACTO con el title que despachan Folder/Socials/Techs.
const WINDOW_META: Record<string, { icon: string }> = {
  Proyectos: { icon: "/static/folderIcon.png" },
  Sociales: { icon: "/static/icons/redes.webp" },
  Tecnologías: { icon: "/static/folderIcon.png" },
};

const TaskBar = (props: Props) => {
  const { items: Tasks } = list;
  const {
    visibleItems,
    minimizedItems,
    focused,
    handleMaximize,
    handleMinimize,
  } = useWindow();

  function uniqueID() {
    return String(Math.floor(Math.random() * Date.now()));
  }

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
    <nav
      style={{
        backgroundImage: TaskBartGradient,
        backgroundRepeat: "repeat-x",
      }}
      className="fixed inset-x-0 bottom-0 z-30 flex h-8 w-full justify-between pr-8"
    >
      <section className="h-full flex items-center">
        <button className="px-2 h-full  z-50 flex items-center bg-[#52911e] gap-2  pr-4 relative group rounded-r-md  hover:bg-[#52911e]">
          <div className="hidden group-hover:flex flex-col justify-between items-start absolute left-0 -top-[20rem] w-72 h-80 bg-white rounded-t-sm ">
            <header className="bg-blue-500 rounded-t-sm text-left pl-4 flex items-center w-full h-8 font-semibold ">
              Hablemos
            </header>
            <div className="flex flex-col grow w-full">
              {Tasks.map(({ title, href, icon }: any) => {
                const key = uniqueID();
                return (
                  <div
                    className="hover:bg-gray-400/50 gap-x-12 flex justify-start w-full pr-10"
                    {...props}
                    key={key}
                  >
                    <a href={href} target="_blank">
                      <span className="flex p-4 text-black w-full ">
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
                  </div>
                );
              })}
            </div>
          </div>
          <img
            width={20}
            height={20}
            alt="xpIcon"
            src={xpLogoIcon}
            className="shadow-xl min-w-fit"
          />{" "}
          Inicio
        </button>
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

      <span className="md:px-2 text-sm flex items-center justify-center">
        <DateTime />
      </span>
    </nav>
  );
};

export default TaskBar;
