import { View } from "./index";

type Dialog = "cd" | "radio";

interface Props {
  view: View;
  onSelectView: (v: View) => void;
  onOpenDialog: (d: Dialog) => void;
}

type Item =
  | { kind: "view"; view: View; label: string }
  | { kind: "dialog"; dialog: Dialog; label: string };

const ITEMS: Item[] = [
  { kind: "view", view: "nowplaying", label: "Reproducción en curso" },
  { kind: "view", view: "guide", label: "Guía multimedia" },
  { kind: "view", view: "library", label: "Biblioteca multimedia" },
  { kind: "dialog", dialog: "cd", label: "Copiar desde CD" },
  { kind: "dialog", dialog: "radio", label: "Radio" },
  { kind: "view", view: "visualizations", label: "Visualizaciones" },
];

export default function NavPanel({ view, onSelectView, onOpenDialog }: Props) {
  return (
    <nav className="wmp-nav flex w-40 shrink-0 flex-col overflow-y-auto py-1 text-[13px]">
      {ITEMS.map((item) => {
        const active = item.kind === "view" && item.view === view;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() =>
              item.kind === "view"
                ? onSelectView(item.view)
                : onOpenDialog(item.dialog)
            }
            className={`wmp-nav-item px-3 py-1.5 text-left ${
              active ? "wmp-nav-item--active" : ""
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
