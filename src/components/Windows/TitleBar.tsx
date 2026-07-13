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
      className={`flex h-7 w-9 items-center justify-center rounded text-white/90 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/80 ${
        danger ? "hover:bg-red-600" : "hover:bg-white/25"
      }`}
    >
      {children}
    </button>
  );
}

interface Props {
  title: string;
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
        active ? "bg-window-bar" : "bg-window-barMuted"
      } ${
        !draggable ? "cursor-default" : dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <span className="truncate pl-1 text-sm font-medium">{title}</span>
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
