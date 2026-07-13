import useWindows from "src/hooks/useWindow";
import data from "src/lists/proyects.json";
import socials from "src/lists/taskList.json";
import techsJson from "src/lists/technologies.json";
import DraggableWin from "./draggable";

const techs = techsJson.items;

const WindowsContainer = () => {
  const proyects = data.proyects as Project[];
  const featured = proyects.filter((p) => p.featured);
  const rest = proyects.filter((p) => !p.featured);

  const { visibleItems, handleClose, handleOpen } = useWindows();
  const windows = { Proyectos: true, Sociales: true };
  return (
    <div className="absolute h-1  top-0 left-0 md:left-0 md:top-0 bottom-28 flex w-full">
      {visibleItems["Proyectos"] && (
        <DraggableWin title={"Proyectos"} close={handleClose}>
          <main className="px-4 py-4 text-black folderIcons overflow-y-scroll">
            {featured.length > 0 && (
              <>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#045aa5] border-b border-slate-300 mb-2">
                  ★ Destacados
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {featured.map((el) => (
                    <FeaturedCard {...el} key={el.url} />
                  ))}
                </div>
              </>
            )}
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#045aa5] border-b border-slate-300 mb-2">
              Más proyectos
            </div>
            <div className="flex flex-wrap">
              {rest.map((el) => (
                <ProjectItem {...el} key={el.url} />
              ))}
            </div>
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

const ProjectItem = ({ url, title, icon, featured, description, stack, type, ...props }: any) => {
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

const FeaturedCard = ({ url, title, icon, description, stack }: Project) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex gap-3 border border-slate-300 bg-slate-50 rounded-md p-2 hover:bg-cyan-200/60 transition-colors"
    >
      <div
        className="w-24 h-16 flex-none rounded bg-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${icon})` }}
        title={title}
      ></div>
      <div className="min-w-0">
        <h4 className="font-semibold text-sm text-black">{title}</h4>
        {description && (
          <p className="text-xs text-slate-600">{description}</p>
        )}
        {stack && (
          <div className="flex flex-wrap gap-1 mt-1">
            {stack.map((t) => (
              <span
                key={t}
                className="bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-[10px]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
};
