import profile from "src/lists/profile.json";

interface Props {
  onWake: () => void;
}

/**
 * Pantalla de "Apagar": en vez de dejar los botones decorativos, cierra el
 * escritorio con la info de contacto a mano.
 */
const ShutdownScreen = ({ onWake }: Props) => {
  return (
    <div className="font-xp fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[#5a7edc] bg-gradient-to-b from-[#1d4bb0] via-[#3b6fd4] to-[#0f2f80] px-6 text-center text-white">
      <img
        src="/kirby.webp"
        alt=""
        width={72}
        height={72}
        className="rounded-lg border border-white/50 shadow-2xl"
      />

      <div>
        <h2 className="text-2xl font-bold [text-shadow:1px_2px_2px_rgba(0,0,0,0.5)]">
          Gracias por pasar
        </h2>
        <p className="mt-1 text-sm text-white/85">
          {profile.name} · {profile.role}
        </p>
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {profile.links.map((link) => (
          <li key={link.title}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded px-2 py-1 text-sm font-semibold underline-offset-4 hover:bg-white/15 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <img src={link.icon} alt="" width={20} height={20} />
              {link.title}
            </a>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onWake}
        className="mt-2 rounded border border-white/60 bg-white/15 px-4 py-1.5 text-sm font-bold hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        ⏻ Volver a encender
      </button>
    </div>
  );
};

export default ShutdownScreen;
