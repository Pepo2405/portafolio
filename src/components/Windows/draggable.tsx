import gsap from "gsap";
import { Resizable } from "re-resizable";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { BsSquare } from "react-icons/bs";
import { GiCancel } from "react-icons/gi";
import { MdOutlineMinimize } from "react-icons/md";
import useWindow from "src/hooks/useWindow";
import { idGen } from "src/utils/utils";

interface Props {
  children?: any;
  close?: any;
  title?: string;
}

export default function DraggableWin({ children, close, title }: Props) {
  const ref = useRef(null);
  const [full, setFull] = useState(false);
  const { current: id } = useRef(idGen());
  const { handleMinimize } = useWindow();
  const handleDrag = (e: any, ui: any) => {
    const { x, y } = deltaPosition;
    setDeltaPosition({
      x: x + ui.deltaX,
      y: y + ui.deltaY,
    });
  };

  const [deltaPosition, setDeltaPosition] = useState({ x: 50, y: 50 });
  const handleClose = () => {
    close({ target: { title } });
  };

  const handleFullScreen = () => {
    if (!ref.current) return;
    setFull(!full);
  };

  const minimize = (e: any) => {
    if (!e || !handleMinimize || !title) return;
    handleMinimize({ target: { title } } as any);
  };

  const FullWindow = () => {
    const idRef = useRef(idGen());
    const id = idRef.current;

    useEffect(() => {
      gsap.fromTo(`.${id}`, { scale: 0 }, { scale: 1, duration: 0.2 });
    }, []);

    return (
      <article
        className={`bg-white overflow-hidden w-screen h-screen absolute  z-[11] full ${id}`}
        ref={ref}
      >
        <div className="handle w-full bg-[#045aa5] flex text-white gap-2 p-1 px-2 justify-start">
          <div className="font-semibold ">{title || "Titulo"}</div>
          <section className="flex px-2 gap-2 min-w-fit justify-self-end grow justify-end">
            <div
              onTouchStart={minimize}
              title={title}
              onClick={minimize}
              className="cursor-pointer  px-2 bg-blue-500 hover:bg-blue-500/50 w-3 md:w-8 rounded-sm  text-white text-sm flex items-center justify-center min-w-fit"
            >
              <MdOutlineMinimize />
            </div>
            <div
              onTouchStart={handleFullScreen}
              onClick={handleFullScreen}
              className="cursor-pointer px-2 text-sm bg-blue-500 hover:bg-blue-500/50 w-3 md:w-8 rounded-sm  text-white text-md flex items-center min-w-fit justify-center"
            >
              <BsSquare />
            </div>
            <div
              onTouchStart={handleClose}
              onClick={handleClose}
              className="bg-red-600 cursor-pointer px-2 hover:bg-red-700/90 min-w-fit w-3 md:w-8 rounded-sm text-white text-xl flex items-center justify-center  border-white/60 border"
              title={title}
            >
              <GiCancel />
            </div>
          </section>
        </div>
        {children}
      </article>
    );
  };

  useEffect(() => {
    gsap.fromTo(`.${id}`, { scale: 0 }, { scale: 1, duration: 0.2 });
  }, []);

  return (
    <>
      {full ? (
        <FullWindow></FullWindow>
      ) : (
        <Draggable
          handle=".handle"
          defaultPosition={deltaPosition}
          scale={1}
          onDrag={handleDrag}
          defaultClassName={`z-10 ${id}`}
          bounds={"body"}
        >
          <Resizable
            defaultSize={{ width: 600, height: 430 }}
            className="bg-white rounded-t-md overflow-hidden "
            minHeight={!full ? 300 : "98vh"}
            bounds={"window"}
            maxWidth={"min(900px,80vw)"}
            minWidth={!full ? 240 : "100vw"}
            ref={ref}
          >
            <div className="handle w-full bg-[#045aa5] flex text-white gap-2 p-1 px-2 justify-between rounded-t-md">
              <div>{title || "Titulo"}</div>
              <section className="flex grow justify-end text-center px-2 gap-2 min-w-fit">
                <div
                  onTouchStart={minimize}
                  title={title}
                  onClick={minimize}
                  className="cursor-pointer  px-2 bg-blue-500 hover:bg-blue-500/50 w-3 md:w-8 rounded-sm  text-white text-sm flex items-center justify-center min-w-fit"
                >
                  <MdOutlineMinimize />
                </div>
                <div
                  onTouchStart={handleFullScreen}
                  onClick={handleFullScreen}
                  className="cursor-pointer px-2 text-sm bg-blue-500 hover:bg-blue-500/50 w-3 md:w-8 rounded-sm  text-white text-md flex items-center min-w-fit justify-center"
                >
                  <BsSquare />
                </div>
                <div
                  onTouchStart={handleClose}
                  onClick={handleClose}
                  className="bg-red-600 cursor-pointer px-2 hover:bg-red-700/90 min-w-fit w-3 md:w-8 rounded-sm text-white text-xl flex items-center justify-center  border-white/60 border"
                  title={title}
                >
                  <GiCancel />
                </div>
              </section>
            </div>
            {children}
          </Resizable>
        </Draggable>
      )}
    </>
  );
}
