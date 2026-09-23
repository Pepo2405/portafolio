import { CSSProperties, PointerEvent as ReactPointerEvent, useState } from "react";
import { Howl } from "howler";
import { AmogusIcon, DeadIcon } from "src/images";
import { useT } from "src/i18n";

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
  const t = useT();
  const [dead, setDead] = useState(false);
  const [clickCount, setCount] = useState(0);

  const handleClick = () => {
    onSelect();
    setCount((prev) => prev + 1);
    setDead(true);
    if (clickCount > 9) return alert(t("amongus.alert"));
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
      aria-label={t("amongus.label")}
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
