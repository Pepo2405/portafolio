import type { StringKey } from "src/i18n/es";
import { useT } from "src/i18n";
import { View } from "./index";

type Dialog = "cd" | "radio";

interface Props {
  view: View;
  onSelectView: (v: View) => void;
  onOpenDialog: (d: Dialog) => void;
}

type Item =
  | { kind: "view"; view: View; label: StringKey }
  | { kind: "dialog"; dialog: Dialog; label: StringKey };

const ITEMS: Item[] = [
  { kind: "view", view: "nowplaying", label: "wmp.now" },
  { kind: "view", view: "guide", label: "wmp.guide" },
  { kind: "view", view: "library", label: "wmp.library" },
  { kind: "dialog", dialog: "cd", label: "wmp.copyCd" },
  { kind: "dialog", dialog: "radio", label: "wmp.radio" },
  { kind: "view", view: "visualizations", label: "wmp.visualizations" },
];

export default function NavPanel({ view, onSelectView, onOpenDialog }: Props) {
  const t = useT();
  return (
    <nav className="wmp-nav flex w-40 shrink-0 flex-col overflow-y-auto py-1 text-[13px]">
      {ITEMS.map((item) => {
        const active = item.kind === "view" && item.view === view;
        return (
          <button
            key={item.kind === "view" ? item.view : item.dialog}
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
            {t(item.label)}
          </button>
        );
      })}
    </nav>
  );
}
