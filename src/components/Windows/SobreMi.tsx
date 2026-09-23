import profile from "src/lists/profile.json";
import { useI18n } from "src/i18n";
import useWindows from "src/hooks/useWindow";

const { name, role, tagline, location, bio, stack, current, links } = profile;

/**
 * Ventana "Sobre mí": el pitch que antes no existía en ningún lado visible.
 * Los links salen de src/lists/profile.json para no duplicar datos.
 */
const SobreMi = () => {
  const { t, alternateHref } = useI18n();
  const { handleOpen } = useWindows();

  return (
    <main className="h-full overflow-y-auto bg-white px-5 py-4 text-black">
      <div className="flex items-center gap-3">
        <img
          src="/kirby.webp"
          alt=""
          width={56}
          height={56}
          className="flex-none rounded-md border border-slate-300 bg-slate-100"
        />
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-tight">{name}</h2>
          <p className="text-sm text-window-brand">{role}</p>
          {tagline && <p className="text-xs text-slate-500">{t(tagline)}</p>}
          <p className="text-xs text-slate-500">{location}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
        {bio.map((paragraph) => (
          <p key={paragraph.en} className="text-sm leading-relaxed text-slate-700">
            {t(paragraph)}
          </p>
        ))}
      </div>

      {current && (
        <p className="mt-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">{t("sobre.now")}</span>
          {t(current)}
        </p>
      )}

      <div className="mt-3">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-window-brand">
          {t("sobre.stack")}
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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleOpen({ target: { title: "Proyectos" } })}
          className="rounded border border-slate-400 bg-gradient-to-b from-white to-slate-200 px-3 py-1 text-sm font-semibold hover:brightness-105 active:brightness-95"
        >
          {t("sobre.projects")}
        </button>
        <button
          type="button"
          onClick={() => handleOpen({ target: { title: "Curriculum" } })}
          className="rounded border border-slate-400 bg-gradient-to-b from-white to-slate-200 px-3 py-1 text-sm font-semibold hover:brightness-105 active:brightness-95"
        >
          {t("sobre.cv")}
        </button>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-3">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-window-brand">
          {t("sobre.contact")}
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="xp-select flex items-center gap-2 rounded-sm px-1 py-0.5 text-sm"
              >
                <img src={link.icon} alt="" width={20} height={20} />
                {t(link.title)}
              </a>
            </li>
          ))}
          <li>
            <a
              href={alternateHref}
              className="xp-select flex items-center gap-2 rounded-sm px-1 py-0.5 text-sm"
            >
              🌐 {t("sobre.lang")}
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default SobreMi;
