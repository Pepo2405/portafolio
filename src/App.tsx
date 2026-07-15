import { useState } from "react";
import Amongus from "src/components/Amongus";
import DesktopIcon from "src/components/DesktopIcon";
import FullScreenButton from "src/components/FullScreenButton";
import TaskBar from "src/components/TaskBar";
import WindowsContainer from "src/components/Windows/WindowsContainer";
import useWindow from "src/hooks/useWindow";
import { BG } from "src/images";

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);
  const { handleOpen } = useWindow();

  return (
    <div
      style={{ background: BG, backgroundSize: "cover" }}
      className="font-xp h-screen w-screen overflow-hidden flex flex-col relative"
      onClick={() => setSelected(null)}
    >
      <section
        className="folderIcons !overflow-hidden "
        onClick={() => setSelected(null)}
      >
        <DesktopIcon
          icon="/static/icons/chrome.svg"
          label="Curriculum"
          selected={selected === "cv"}
          onSelect={() => setSelected("cv")}
          onOpen={() => window.open("/static/Cv Ignacio Iglesias.pdf", "_blank")}
        />
        <DesktopIcon
          icon="/static/folderIcon.png"
          label="Proyectos"
          selected={selected === "Proyectos"}
          onSelect={() => setSelected("Proyectos")}
          onOpen={() => handleOpen({ target: { title: "Proyectos" } })}
        />
        <DesktopIcon
          icon="/static/icons/redes.webp"
          label="Redes sociales"
          selected={selected === "Sociales"}
          onSelect={() => setSelected("Sociales")}
          onOpen={() => handleOpen({ target: { title: "Sociales" } })}
        />
        <DesktopIcon
          icon="/static/folderIcon.png"
          label="Tecnologías"
          selected={selected === "Tecnologías"}
          onSelect={() => setSelected("Tecnologías")}
          onOpen={() => handleOpen({ target: { title: "Tecnologías" } })}
        />
        <Amongus />
      </section>
      <main>
        <h2
          unselectable="on"
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
        </h2>
        <FullScreenButton />
        <WindowsContainer />
      </main>
      <TaskBar />
    </div>
  );
}
