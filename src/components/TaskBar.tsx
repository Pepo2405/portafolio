import React from "react";
import { SocialsICon, TaskBartGradient, xpLogoIcon } from "src/images";
import list from "src/lists/taskList.json";
import TaskItems from "src/lists/proyects.json";
import DateTime from "./dateTime";
import Image from "next/image";
import useWindow from "src/hooks/useWindow";
import { randomBytes } from "crypto";

type Props = {};
const folder = {
  title: "Proyectos",
  url: "https://github.com/pepo2405",
  icon: "/static/folderIcon.png",
  target: "_blank",
};
const socials = {
  title: "Sociales",
  url: "",
  icon: `/static/icons/redes.webp`,
  target: "_blank",
};

const TaskBar = (props: Props) => {
  const { items: Tasks } = list;
  const windows = [socials, folder, ...TaskItems.proyects];
  const { minimizedItems, handleMaximize } = useWindow();

  function uniqueID() {
    return String(Math.floor(Math.random() * Date.now()));
  }

  return (
    <nav
      style={{
        backgroundImage: TaskBartGradient,
        backgroundRepeat: "repeat-x",
      }}
      className="w-screen md:w-full h-8 fixed bottom-0 flex z-30 justify-between pr-8"
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
                        <Image
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
          <Image
            width={20}
            height={20}
            alt="xpIcon"
            src={xpLogoIcon}
            className="shadow-xl min-w-fit"
          />{" "}
          Inicio
        </button>
        <div className="-ml-4 grow flex text-center pl-4  items-center overflow-x-auto h-full">
          {windows.map(({ title, url, icon }) => {
            if (!minimizedItems[title]) return null;
            const key = uniqueID();
      
            return (
              <div
                title={title}
                onClick={handleMaximize as any}
                className="relative z-50 hover:bg-blue-600/60 px-4 cursor-pointer grow flex gap-3 text-sm h-full textShadow items-center shadowText"
                key={key}
              >
                <Image
                  title={title}
                  onClick={handleMaximize as any}
                  alt=""
                  width={20}
                  height={20}
                  src={icon}
                />
                <span
                  title={title}
                  onClick={handleMaximize as any}
                  className="hidden md:block"
                >
                  {title}
                </span>
              </div>
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
