import profile from "src/lists/profile.json";

const CVS = [
  {
    lang: "Español",
    note: "Versión principal",
    href: "/static/Cv Ignacio Iglesias.pdf",
  },
  {
    lang: "English",
    note: "English version",
    href: "/static/Cv Ignacio Iglesias (EN).pdf",
  },
];

/**
 * Ventana "Curriculum": el CV viene en dos idiomas, así que en vez de linkear
 * a un PDF fijo el ícono abre este selector.
 */
const Curriculum = () => {
  return (
    <main className="h-full overflow-y-auto bg-white px-5 py-4 text-black">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <img src="/static/icons/cv.svg" alt="" width={40} height={40} />
        <div>
          <h2 className="text-base font-bold leading-tight">
            {profile.name}
          </h2>
          <p className="text-sm text-window-brand">{profile.role}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        CV en PDF, formato ATS-friendly. Elegí el idioma:
      </p>

      <div className="mt-3 grid gap-2">
        {CVS.map((cv) => (
          <a
            key={cv.lang}
            href={cv.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded border border-slate-300 bg-slate-50 px-3 py-2 transition-colors hover:border-luna-selection hover:bg-luna-menuRight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-luna-selection"
          >
            <img src="/static/icons/cv.svg" alt="" width={28} height={28} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{cv.lang}</span>
              <span className="block text-xs text-slate-500">{cv.note}</span>
            </span>
            <span aria-hidden className="text-xs font-semibold text-luna-selection">
              Abrir ↗
            </span>
          </a>
        ))}
      </div>

      <p className="mt-4 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        ¿Preferís ver el trabajo antes que el PDF? Abrí{" "}
        <span className="font-semibold">Proyectos</span> en el escritorio.
      </p>
    </main>
  );
};

export default Curriculum;
