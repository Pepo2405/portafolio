import useWindows from "src/hooks/useWindow";
import data from "src/lists/proyects.json";
import socials from "src/lists/taskList.json";
import techsJson from "src/lists/technologies.json";
import DraggableWin from "./draggable";

const techs = techsJson.items;

const WindowsContainer = () => {
  const { proyects } = data;

  const { visibleItems, handleClose, handleOpen } = useWindows();
  const windows = { Proyectos: true, Sociales: true };
  return (
    <div className="absolute h-1  top-0 left-0 md:left-0 md:top-0 bottom-28 flex w-full">
      {visibleItems["Proyectos"] && (
        <DraggableWin title={"Proyectos"} close={handleClose}>
          <main className="px-4 py-4  text-black folderIcons  overflow-y-scroll">
            {proyects.map((el: any) => (
              <ProjectItem {...el} key={el.url} />
            ))}
          </main>
        </DraggableWin>
      )}
      <div className="absolute">
        {visibleItems["Sociales"] && (
          <DraggableWin title={"Sociales"} close={handleClose}>
            <main
              className=" px-4 py-4  text-black folderIcons overflow-y-auto "
              style={{ columnGap: "2rem" }}
            >
              {socials.items.map((el: any) => (
                <ProjectItem {...el} key={el.url} />
              ))}
            </main>
          </DraggableWin>
        )}
      </div>
      <div className="absolute">
        {visibleItems["Tecnologías"] && (
          <DraggableWin title={"Tecnologías"} close={handleClose}>
            <main
              className="flex px-4 py-4 items-center text-black h-full folderIcons overflow-y-auto "
              style={{ columnGap: "2rem" }}
            >
              {techs.map((el: any) => (
                <ProjectItem
                  {...el}
                  key={el.url}
                  icon={`/static/icons/techs/${el.icon}`}
                />
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
      href={url ? url : undefined}
      target="_blank"
      rel='noreferrer'
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
