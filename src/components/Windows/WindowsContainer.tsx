import useWindows from "src/hooks/useWindow";
import data from "src/lists/proyects.json";
import socials from "src/lists/taskList.json";
import techsJson from "src/lists/technologies.json";
import DraggableWin from "./draggable";
import Curriculum from "./Curriculum";
import SobreMi from "./SobreMi";
import Terminal from "./Terminal";

const techs = techsJson.items;

type ProjectItemProps = {
  title: string;
  icon: string;
  /** Link del ítem. `href` es el alias que usan los items de redes. */
  url?: string;
  href?: string;
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

  const { visibleItems, handleClose, handleOpen } = useWindows();

  return (
    <>
      {visibleItems["Sobre mí"] && (
        <DraggableWin title="Sobre mí" close={handleClose}>
          <SobreMi />
        </DraggableWin>
      )}

      {visibleItems["Curriculum"] && (
        <DraggableWin title="Curriculum" close={handleClose}>
          <Curriculum />
        </DraggableWin>
      )}

      {visibleItems["Proyectos"] && (
        <DraggableWin title="Proyectos" close={handleClose}>
          <main className="h-full overflow-y-auto px-4 py-4 text-black">
            {featured.length > 0 && (
              <>
                <SectionLabel>★ Destacados</SectionLabel>
                <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {featured.map((el) => (
                    <FeaturedCard
                      {...el}
                      key={el.title}
                      onOpen={() =>
                        handleOpen({ target: { title: el.title } })
                      }
                    />
                  ))}
                </div>
              </>
            )}
            <SectionLabel>Más proyectos</SectionLabel>
            <div className="folderIcons">
              {rest.map((el) => (
                <ProjectItem
                  key={el.title}
                  title={el.title}
                  icon={el.icon}
                  url={el.url}
                />
              ))}
            </div>
          </main>
        </DraggableWin>
      )}

      {visibleItems["Sociales"] && (
        <DraggableWin title="Sociales" close={handleClose}>
          <main className="h-full overflow-y-auto px-4 py-4 text-black">
            <div className="folderIcons" style={{ columnGap: "2rem" }}>
              {socials.items.map((el) => (
                <ProjectItem
                  key={el.title}
                  title={el.title}
                  icon={el.icon}
                  href={el.href}
                />
              ))}
            </div>
          </main>
        </DraggableWin>
      )}

      {visibleItems["Tecnologías"] && (
        <DraggableWin title="Tecnologías" close={handleClose}>
          <main className="h-full overflow-y-auto px-4 py-4 text-black">
            <div className="folderIcons" style={{ columnGap: "2rem" }}>
              {techs.map((el) => (
                <ProjectItem
                  key={el.url}
                  title={el.title}
                  icon={`/static/icons/techs/${el.icon}`}
                  url={el.url}
                />
              ))}
            </div>
          </main>
        </DraggableWin>
      )}

      {visibleItems["Terminal"] && (
        <DraggableWin title="Terminal" close={handleClose}>
          <Terminal onClose={() => handleClose({ target: { title: "Terminal" } })} />
        </DraggableWin>
      )}

      {/* Ficha de cada proyecto destacado: vive en su propia ventana, así los
          que no tienen demo pública igual se pueden abrir. El alto se estima
          desde la cantidad de bullets para que no quede contenido cortado. */}
      {proyects.map((project) =>
        visibleItems[project.title] ? (
          <DraggableWin
            key={project.title}
            title={project.title}
            icon={project.icon}
            defaultSize={{
              width: 660,
              height: Math.min(580, 300 + (project.details?.length ?? 0) * 62),
            }}
            close={handleClose}
          >
            <ProjectDetail project={project} />
          </DraggableWin>
        ) : null
      )}
    </>
  );
};

export default WindowsContainer;

const ProjectItem = ({ url, href, title, icon }: ProjectItemProps) => {
  const link = url ?? href;
  return (
    <a
      className="flex h-16 w-fit flex-col items-center justify-between rounded-sm p-1 text-center text-black xp-select md:h-28 md:w-28"
      href={link}
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

const FeaturedCard = ({
  icon,
  title,
  description,
  stack,
  url,
  badge,
  onOpen,
}: Project & { onOpen: () => void }) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full gap-3 rounded-md border border-slate-300 bg-slate-50 p-2 text-left transition-colors hover:border-luna-selection hover:bg-luna-menuRight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-luna-selection"
    >
      <div
        className="h-16 w-24 flex-none rounded bg-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${icon})` }}
      ></div>
      <div className="min-w-0">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-black">
          <span className="truncate">{title}</span>
          {badge && (
            <span className="flex-none rounded-full border border-slate-300 bg-white px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-slate-500">
              {badge}
            </span>
          )}
        </h4>
        {description && (
          <p className="text-xs text-slate-600">{description}</p>
        )}
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
        <span className="mt-1 inline-block text-[10px] font-semibold text-luna-selection">
          Ver ficha{url ? " y sitio ↗" : ""}
        </span>
      </div>
    </button>
  );
};

const ProjectDetail = ({ project }: { project: Project }) => {
  const { title, icon, description, details, stack, url, badge, noDemoNote } =
    project;

  // Default neutro: no promete detalles internos de productos que no son míos.
  const sinDemo =
    noDemoNote ??
    "No hay demo pública de este proyecto. Si querés, escribime y te cuento cuál fue mi parte.";

  return (
    <main className="h-full overflow-y-auto bg-white px-5 py-4 text-black">
      <div className="flex items-start gap-3">
        <div
          className="h-20 w-28 flex-none rounded border border-slate-300 bg-slate-100 bg-cover bg-center"
          style={{ backgroundImage: `url(${icon})` }}
          role="img"
          aria-label={`Captura de ${title}`}
        ></div>
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold leading-tight">
            {title}
            {badge && (
              <span className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {badge}
              </span>
            )}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          )}
        </div>
      </div>

      {details && details.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-slate-200 pt-3">
          {details.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-700">
              <span aria-hidden className="text-luna-selection">
                ▸
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {stack && stack.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-window-brand">
            Stack
          </div>
          <div className="flex flex-wrap gap-1">
            {stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-800"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded border border-slate-400 bg-gradient-to-b from-white to-slate-200 px-3 py-1 text-sm font-semibold hover:brightness-105"
          >
            Abrir sitio ↗
          </a>
        ) : (
          <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {sinDemo}
          </p>
        )}
      </div>
    </main>
  );
};
