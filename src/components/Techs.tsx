import React, { useState } from "react";
import { FolderIcon, SocialsICon } from "src/images";
import { items as techs } from "src/lists/technologies.json";
import useWindow from "src/hooks/useWindow";

const Techs = (props: Folder) => {
  const { setVisibleItems, setMinimizedItems } = useWindow();
  const handleClick = (e: any) => {
    if (!setVisibleItems) return;
    if (!setMinimizedItems) return;
    const { title } = e.target;
    setVisibleItems((prev: any) => ({ ...prev, [title]: true }));
    setMinimizedItems((prev: any) => ({ ...prev, [title]: true }));
  };

  return (
    <>
      <section
        onClick={() => handleClick({ target: { title: "Tecnologías" } })}
        className="cursor-pointer bg-white-400/50 w-24 h-24 pt-2 px-8 flex-col text-center flex hover:bg-blue-500/50 items-center  justify-end text-black/80"
      >
        <div
          style={{
            backgroundImage: FolderIcon,
            backgroundSize: "48px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          className=" bg-white-400/50 w-24 h-24 pt-2 px-8 flex-col text-center flex  items-center  justify-end text-black/80"
        ></div>
        <span className="font-bold text-sm text-white shadowText whitespace-nowrap">
          {props.title}
        </span>
      </section>
    </>
  );
};

export default Techs;
