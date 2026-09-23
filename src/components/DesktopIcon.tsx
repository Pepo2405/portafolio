import { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useT } from "src/i18n";

type DragHandlers = {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
  onPointerCancel: () => void;
}

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
  const t = useT();
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
      onKeyDown={(e) => {
        // En el escritorio se abre con doble clic; con teclado, Enter alcanza.
        if (e.key === "Enter") {
          e.stopPropagation();
          onOpen();
        }
      }}
      aria-label={label || t("icon.fallback")}
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
