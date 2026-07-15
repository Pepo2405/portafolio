type DesktopIconProps = {
  icon: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
};

const DesktopIcon = ({ icon, label, selected, onSelect, onOpen }: DesktopIconProps) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      aria-pressed={selected}
      className={`flex w-24 flex-col items-center gap-1 rounded-sm p-2 text-center ${
        selected ? "xp-icon-selected" : ""
      }`}
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
