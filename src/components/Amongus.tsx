import { CSSProperties, PointerEvent as ReactPointerEvent, useState } from "react";
import { Howl } from "howler";
import { AmogusIcon, DeadIcon } from "src/images";

type DragHandlers = {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
  onPointerCancel: () => void;
}

type AmongusProps = {
  style: CSSProperties;
  dragging: boolean;
  handlers: DragHandlers;
  onSelect: () => void;
};

const Amongus = ({ style, dragging, handlers, onSelect }: AmongusProps) => {
  const [dead, setDead] = useState(false);
  const [clickCount, setCount] = useState(0);

  const handleClick = () => {
    onSelect();
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
    <button
      type="button"
      style={style}
      {...handlers}
      aria-label="Amogus (easter egg): clic para lastimarlo"
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      className={`xp-icon flex h-24 w-24 items-center justify-center ${
        dragging ? "xp-icon-dragging" : ""
      }`}
    >
      <div
        className="h-20 w-20"
        style={{
          backgroundImage: `${dead ? DeadIcon : AmogusIcon}`,
          backgroundSize: "5rem",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </button>
  );
};

export default Amongus;
