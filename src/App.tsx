import Amongus from "src/components/Amongus";
import Proyects from "src/components/Folder";
import FullScreenButton from "src/components/FullScreenButton";
import Socials from "src/components/Socials";
import TaskBar from "src/components/TaskBar";
import Techs from "src/components/Techs";
import WindowsContainer from "src/components/Windows/WindowsContainer";
import { BG } from "src/images";

export default function App() {
  return (
    <div
      style={{ background: BG, backgroundSize: "cover" }}
      className="h-screen w-screen overflow-hidden flex flex-col relative"
    >
      <section className="folderIcons !overflow-hidden ">
        <a href="/static/Cv Ignacio Iglesias.pdf" target="_blank">
          <div className="bg-white-400/50 w-24 h-24 pt-2 px-8 flex-col text-center flex hover:bg-blue-500/50 items-center  justify-end text-black/80">
            <div
              className="grow w-11"
              style={{
                backgroundImage: "url(/static/icons/chrome.svg)",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
            <span className="font-bold text-sm text-white shadowText">
              Curriculum
            </span>
          </div>
        </a>
        <Amongus />
        <Proyects title="Proyectos" />
        <Socials title="Redes sociales" />
        <Techs title="Tecnologías" />
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
