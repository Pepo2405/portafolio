import React, { useState } from "react";
import { Howl } from "howler";
import { AmogusIcon, DeadIcon } from "src/images";


const Amongus = ( ) => {
  const [dead, setDead] = useState(false);
  const [clickCount, setCount] = useState(0);
  const handleCLick = () => {
    setCount((prev) => prev + 1);
    setDead(true);
    if (clickCount > 9) return alert("Para emocion ya lo hiciste pelota");
    const sound = new Howl({
      src: ["/static/sounds/killSoundEffect.mp3"],
      html5: true,
      volume: 0.1,
    });
    sound.play();
  };

  return (
    <div className="w-20 h-20 flex justify-center items-center mt-3 absolute bottom-16 left-2">
      <div
        onClick={handleCLick}
        className="w-20 h-20"
        style={{
          width: "96px",
          height: "96px",
          backgroundImage: `${dead ? DeadIcon : AmogusIcon}`,
          backgroundSize: "5rem",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
    </div>
  );
};

export default Amongus;
