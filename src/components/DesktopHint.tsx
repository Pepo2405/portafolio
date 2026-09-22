interface Props {
  onDismiss: () => void;
}

/**
 * Globo de ayuda estilo XP. El escritorio no tiene ninguna pista de que los
 * íconos se abren con doble clic, así que la primera visita lo explica.
 */
const DesktopHint = ({ onDismiss }: Props) => {
  return (
    <div
      role="status"
      className="xp-hint absolute bottom-2 right-2 z-20 hidden w-72 rounded-lg border border-[#9a9a9a] bg-[#ffffe1] p-3 text-[13px] text-black shadow-[3px_3px_8px_rgba(0,0,0,0.35)] md:block"
    >
      {/* Cola del globo apuntando a la bandeja, como los balloons de XP. */}
      <span
        aria-hidden
        className="absolute -bottom-[7px] right-10 h-3 w-3 rotate-45 border-b border-r border-[#9a9a9a] bg-[#ffffe1]"
      />
      <div className="flex items-start gap-2">
        <img src="/kirby.webp" alt="" width={28} height={28} className="flex-none" />
        <div>
          <p className="font-bold">¿Cómo se abre esto?</p>
          <p className="mt-0.5 leading-snug">
            Doble clic en un ícono para abrirlo. Podés arrastrarlos para
            acomodarlos.
          </p>
          <p className="mt-1 leading-snug text-slate-600">
            Si te gustan las terminales, abrí{" "}
            <span className="font-semibold">Terminal</span> y escribí{" "}
            <code className="rounded bg-black/10 px-1">help</code>.
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-2 rounded border border-[#9a9a9a] bg-gradient-to-b from-white to-[#e3e3d4] px-2 py-0.5 text-xs font-semibold hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#316ac5]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopHint;
