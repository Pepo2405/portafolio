import React from "react";
import useWindows from "src/hooks/useWindow";
import DraggableWin from "./draggable";
import data from "src/lists/proyects.json";
import DraggableLink from "./DraggableLink";
import socials from "src/lists/taskList.json";

const WindowsContainer = () => {
  const { proyects } = data;

  const { visibleItems, handleClose, handleOpen } = useWindows();
  const windows = { Proyectos: true, Sociales: true };
  return (
    <div className="absolute h-1  top-0 left-0 md:left-0 md:top-0 bottom-28 flex w-full">
      {/* <DraggableLink title='Mochify' url='https://pepo2405.github.io/mochifyPlayer.github.io/'></DraggableLink> */}

      {/* Proyects Folder */}

      {visibleItems["Proyectos"] && (
        <DraggableWin title={"Proyectos"} close={handleClose}>
          <main className="px-4 py-4  text-black folderIcons overflow-hidden overflow-y-scroll border border-gray-600 h-full ">
            {proyects.map((el: any) => (
              <ProjectItem {...el} />
            ))}
          </main>
        </DraggableWin>
      )}

      {/* Proyects window */}
      {/* <div className="absolute">
        {proyects.map((item: any) => {
          return (
            <div key={item.title}>
              {visibleItems[item.title] ? <DraggableLink {...item} /> : <></>}
            </div>
          );
        })}
      </div> */}

      {/* Socials window */}
      <div className="absolute">
        {visibleItems["Sociales"] && (
          <DraggableWin title={"Sociales"} close={handleClose}>
            <main
              className="flex px-4 py-4 items-center text-black folderIcons "
              style={{ columnGap: "2rem" }}
            >
              {socials.items.map((el: any) => (
                <ProjectItem {...el} />
              ))}
            </main>
          </DraggableWin>
        )}
      </div>
    </div>
  );
};

export default WindowsContainer;

const ProjectItem = ({ url, title, icon, ...props }: any) => {
  return (
    <a
      key={url}
      className="cursor-pointer w-fit h-16 md:w-28 md:h-28 bg-transparen hover:bg-cyan-200/90 rounded-sm flex flex-col justify-between text-center items-center p-1 "
      {...props}
    >
      <div
        className="w-16 h-16"
        title={title}
        style={{
          backgroundImage: `url(${icon})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      ></div>
      <span className="whitespace-nowrap text-sm text-black font-medium">
        {title}
      </span>
    </a>
  );
};

const Folder = ({ title, icon, ...props }: any) => {};
