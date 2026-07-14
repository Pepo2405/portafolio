import { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { TbCopy, TbMinus, TbSquare, TbX } from "react-icons/tb";

type DragHandlers = {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
};

interface WinBtnProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}

function WinBtn({ label, onClick, danger, children }: WinBtnProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onClick={onClick}
      className={`xp-caption flex h-[21px] w-[21px] items-center justify-center text-white outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/80 ${
        danger ? "xp-caption-close" : "xp-caption-blue"
      }`}
    >
      {children}
    </button>
  );
}

interface Props {
  title: string;
  icon?: string;
  active: boolean;
  dragging: boolean;
  draggable: boolean;
  full: boolean;
  showToggle: boolean;
  handlers: DragHandlers;
  onMinimize: () => void;
  onToggleFull: () => void;
  onClose: () => void;
}

export default function TitleBar({
  title,
  icon,
  active,
  dragging,
  draggable,
  full,
  showToggle,
  handlers,
  onMinimize,
  onToggleFull,
  onClose,
}: Props) {
  return (
    <div
      {...handlers}
      onDoubleClick={onToggleFull}
      style={{ touchAction: "none" }}
      className={`handle flex h-9 shrink-0 select-none items-center justify-between gap-2 px-2 text-white transition-colors ${
        active ? "xp-titlebar" : "xp-titlebar--inactive"
      } ${
        !draggable ? "cursor-default" : dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5 pl-1">
        {icon && <img src={icon} alt="" width={16} height={16} className="shrink-0" />}
        <span className="truncate text-sm font-bold [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <WinBtn label="Minimizar" onClick={onMinimize}>
          <TbMinus className="h-4 w-4" />
        </WinBtn>
        {showToggle && (
          <WinBtn
            label={full ? "Restaurar" : "Maximizar"}
            onClick={onToggleFull}
          >
            {full ? (
              <TbCopy className="h-3.5 w-3.5" />
            ) : (
              <TbSquare className="h-3.5 w-3.5" />
            )}
          </WinBtn>
        )}
        <WinBtn label="Cerrar" danger onClick={onClose}>
          <TbX className="h-4 w-4" />
        </WinBtn>
      </div>
    </div>
  );
}
