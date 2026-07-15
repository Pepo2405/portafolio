import { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

type DragHandlers = {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
};

type DesktopIconProps = {
  icon: string;
  label: string;
  selected: boolean;
  dragging: boolean;
  style: CSSProperties;
  handlers: DragHandlers;
  onSelect: () => void;
  onOpen: () => void;
};

const DesktopIcon = ({
  icon,
  label,
  selected,
  dragging,
  style,
  handlers,
  onSelect,
  onOpen,
}: DesktopIconProps) => {
  return (
    <button
      type="button"
      style={style}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      aria-pressed={selected}
      className={`xp-icon flex w-24 flex-col items-center gap-1 rounded-sm p-2 text-center ${
        selected ? "xp-icon-selected" : ""
      } ${dragging ? "xp-icon-dragging" : ""}`}
    >
      <div
        className="xp-icon-thumb h-12 w-12 rounded-sm"
        style={{
          backgroundImage: `url(${icon})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <span className="xp-icon-label shadowText rounded-sm px-1 text-sm font-bold text-white">
        {label}
      </span>
    </button>
  );
};

export default DesktopIcon;
