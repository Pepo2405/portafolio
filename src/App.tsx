import { useCallback, useRef, useState } from "react";
import Amongus from "src/components/Amongus";
import DesktopIcon from "src/components/DesktopIcon";
import DesktopContextMenu from "src/components/DesktopContextMenu";
import DesktopHint from "src/components/DesktopHint";
import FullScreenButton from "src/components/FullScreenButton";
import ShutdownScreen from "src/components/ShutdownScreen";
import TaskBar from "src/components/TaskBar";
import MediaPlayer from "src/components/Windows/MediaPlayer";
import WindowsContainer from "src/components/Windows/WindowsContainer";
import useDesktopIcons from "src/hooks/useDesktopIcons";
import useWindow from "src/hooks/useWindow";
import { DESKTOP_ICONS, DesktopIconDef } from "src/lists/desktopIcons";
import { BG } from "src/images";

const HINT_KEY = "xp-hint-seen@1";

function readHintSeen(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return true;
  }
}

export default function App() {
  const { handleOpen, visibleItems, minimizedItems, handleClose, closeAll } =
    useWindow();
  const containerRef = useRef<HTMLElement>(null);
  const desktop = useDesktopIcons(containerRef);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [poweredOff, setPoweredOff] = useState(false);
  const [hintSeen, setHintSeen] = useState(readHintSeen);

  const dismissHint = useCallback(() => {
    setHintSeen(true);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      // storage no disponible: el hint se vuelve a mostrar la próxima visita
    }
  }, []);

  // Cerrar sesión: se cierra todo y el escritorio vuelve a su layout original.
  const logOff = useCallback(() => {
    closeAll();
    desktop.resetLayout();
    handleOpen({ target: { title: "Sobre mí" } });
  }, [closeAll, desktop, handleOpen]);

  const activate = (def: DesktopIconDef) => {
    dismissHint();
    switch (def.kind.type) {
      case "open-window":
        handleOpen({ target: { title: def.kind.title } });
        break;
      case "open-url":
        window.open(def.kind.href, "_blank");
        break;
      case "easter-egg":
        break; // el easter-egg se maneja dentro de <Amongus/>
    }
  };

  if (poweredOff) {
    return <ShutdownScreen onWake={() => setPoweredOff(false)} />;
  }

  return (
    <div
      style={{ background: BG, backgroundSize: "cover" }}
      className="font-xp relative flex h-screen w-screen flex-col overflow-hidden"
      onClick={desktop.clearSelection}
    >
      <section
        ref={containerRef}
        className="xp-desktop"
        onClick={desktop.clearSelection}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        {DESKTOP_ICONS.map((def) => {
          const pos = desktop.getPos(def.id);
          const style = { left: pos.x, top: pos.y };
          const handlers = desktop.dragHandlers(def.id);
          const dragging = desktop.dragId === def.id;
          if (def.kind.type === "easter-egg") {
            return (
              <Amongus
                key={def.id}
                style={style}
                dragging={dragging}
                handlers={handlers}
                onSelect={() => desktop.select(def.id)}
              />
            );
          }
          return (
            <DesktopIcon
              key={def.id}
              icon={def.icon}
              label={def.label}
              selected={desktop.selected === def.id}
              dragging={dragging}
              style={style}
              handlers={handlers}
              onSelect={() => desktop.select(def.id)}
              onOpen={() => activate(def)}
            />
          );
        })}
        {!hintSeen && <DesktopHint onDismiss={dismissHint} />}
      </section>
      <main>
        <h1
          className="select-none 
             md:text-4xl shadowText 
             absolute top-1/2 left-1/2
             -translate-x-1/2
             -translate-y-1/2
             whitespace-nowrap opacity-80 
             text-white text-2xl
             "
        >
          Iglesias Ignacio
        </h1>
        <FullScreenButton />
        <WindowsContainer />
        {(visibleItems["Reproductor"] || minimizedItems["Reproductor"]) && (
          <MediaPlayer
            close={handleClose}
            hidden={!visibleItems["Reproductor"]}
          />
        )}
      </main>
      <TaskBar
        onLogOff={logOff}
        onShutdown={() => setPoweredOff(true)}
      />
      {menu && (
        <DesktopContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            { type: "disabled", label: "Ver" },
            { type: "separator" },
            { type: "action", label: "Organizar íconos", onSelect: desktop.resetLayout },
            { type: "action", label: "Actualizar", onSelect: desktop.clearSelection },
            { type: "separator" },
            { type: "disabled", label: "Propiedades" },
          ]}
        />
      )}
    </div>
  );
}
