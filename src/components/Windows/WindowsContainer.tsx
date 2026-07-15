import useWindows from "src/hooks/useWindow";
import data from "src/lists/proyects.json";
import socials from "src/lists/taskList.json";
import techsJson from "src/lists/technologies.json";
import DraggableWin from "./draggable";

const techs = techsJson.items;

type ItemProps = {
  title: string;
  icon: string;
  url?: string;
  href?: string;
  target?: string;
  featured?: boolean;
  description?: string;
  stack?: string[];
  type?: string;
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2 border-b border-slate-300 text-[11px] font-bold uppercase tracking-wide text-window-brand">
    {children}
  </div>
);

const WindowsContainer = () => {
  const proyects = data.proyects as Project[];
  const featured = proyects.filter((p) => p.featured);
  const rest = proyects.filter((p) => !p.featured);

  const { visibleItems, handleClose } = useWindows();

  return (
    <>
      {visibleItems["Proyectos"] && (
        <DraggableWin title="Proyectos" close={handleClose}>
          <main className="h-full overflow-y-auto px-4 py-4 text-black">
            {featured.length > 0 && (
              <>
                <SectionLabel>★ Destacados</SectionLabel>
                <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {featured.map((el) => (
                    <FeaturedCard {...el} key={el.url} />
                  ))}
                </div>
              </>
            )}
            <SectionLabel>Más proyectos</SectionLabel>
            <div className="folderIcons">
              {rest.map((el) => (
                <ProjectItem {...el} key={el.url} />
              ))}
            </div>
          </main>
        </DraggableWin>
      )}

      {visibleItems["Sociales"] && (
        <DraggableWin title="Sociales" close={handleClose}>
          <main
            className="folderIcons h-full overflow-y-auto px-4 py-4 text-black"
            style={{ columnGap: "2rem" }}
          >
            {socials.items.map((el) => (
              <ProjectItem {...el} key={el.title} />
            ))}
          </main>
        </DraggableWin>
      )}

      {visibleItems["Tecnologías"] && (
        <DraggableWin title="Tecnologías" close={handleClose}>
          <main
            className="folderIcons flex h-full items-center overflow-y-auto px-4 py-4 text-black"
            style={{ columnGap: "2rem" }}
          >
            {techs.map((el) => (
              <ProjectItem
                {...el}
                key={el.url}
                icon={`/static/icons/techs/${el.icon}`}
              />
            ))}
          </main>
        </DraggableWin>
      )}
    </>
  );
};

export default WindowsContainer;

const ProjectItem = ({
  url,
  title,
  icon,
  featured,
  description,
  stack,
  type,
  ...rest
}: ItemProps) => {
  return (
    <a
      className="flex h-16 w-fit flex-col items-center justify-between rounded-sm p-1 text-center text-black xp-select md:h-28 md:w-28"
      {...rest}
      href={url ? url : undefined}
      target="_blank"
      rel="noreferrer"
    >
      <div
        className="h-16 w-16"
        title={title}
        style={{
          backgroundImage: `url(${icon})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      ></div>
      <span className="whitespace-nowrap text-sm font-medium text-inherit">
        {title}
      </span>
    </a>
  );
};

const FeaturedCard = ({ url, title, icon, description, stack }: Project) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex gap-3 rounded-md border border-slate-300 bg-slate-50 p-2 transition-colors xp-select"
    >
      <div
        className="h-16 w-24 flex-none rounded bg-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${icon})` }}
        title={title}
      ></div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-black">{title}</h4>
        {description && <p className="text-xs text-slate-600">{description}</p>}
        {stack && (
          <div className="mt-1 flex flex-wrap gap-1">
            {stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-800"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
};
