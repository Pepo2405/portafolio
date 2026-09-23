import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

type Flags = Record<string, boolean>;
type WinEvent = { target: { title: string } };

export interface WindowsContextValue {
  visibleItems: Flags;
  minimizedItems: Flags;
  setVisibleItems: Dispatch<SetStateAction<Flags>>;
  setMinimizedItems: Dispatch<SetStateAction<Flags>>;
  handleClose: (e: WinEvent) => void;
  handleOpen: (e: WinEvent) => void;
  handleMaximize: (e: WinEvent) => void;
  handleMinimize: (e: WinEvent) => void;
  closeAll: () => void;
  focused: string | null;
  focusWindow: (title: string) => void;
  zIndexOf: (title: string) => number;
}

const noop = () => {};
const Z_BASE = 10;

const WindowsContext = createContext<WindowsContextValue>({
  visibleItems: {},
  minimizedItems: {},
  setVisibleItems: noop,
  setMinimizedItems: noop,
  handleClose: noop,
  handleOpen: noop,
  handleMaximize: noop,
  handleMinimize: noop,
  closeAll: noop,
  focused: null,
  focusWindow: noop,
  zIndexOf: () => Z_BASE,
});

interface Props {
  children: ReactNode;
  /** Ventanas abiertas al arrancar (vienen de la URL). Default: ["Sobre mí"]. */
  initialWindows?: string[];
}

function flagsFor(titles: string[]): Flags {
  const flags: Flags = {};
  for (const title of titles) flags[title] = true;
  return flags;
}

export const WindowsProvider: FC<Props> = ({
  children,
  initialWindows = ["Sobre mí"],
}) => {
  // El seed viene de la URL: /proyectos/<slug>/ arranca con "Proyectos" + la
  // ficha abierta; el resto del comportamiento no cambia.
  const [visibleItems, setVisibleItems] = useState<Flags>(() =>
    flagsFor(initialWindows)
  );
  // Ojo: acá "minimized" significa "está abierta" (vive en la taskbar), no minimizada.
  const [minimizedItems, setMinimizedItems] = useState<Flags>(() =>
    flagsFor(initialWindows)
  );
  // Stacking order, last entry is topmost.
  const [order, setOrder] = useState<string[]>([]);
  const [focused, setFocused] = useState<string | null>(null);

  const focusWindow = useCallback((title: string) => {
    setOrder((prev) =>
      prev[prev.length - 1] === title
        ? prev
        : [...prev.filter((t) => t !== title), title]
    );
    setFocused(title);
  }, []);

  const zIndexOf = useCallback(
    (title: string) => {
      const i = order.indexOf(title);
      return Z_BASE + (i < 0 ? 0 : i);
    },
    [order]
  );

  const handleClose = useCallback(({ target }: WinEvent) => {
    const { title } = target;
    setVisibleItems((p) => ({ ...p, [title]: false }));
    setMinimizedItems((p) => ({ ...p, [title]: false }));
    setOrder((prev) => prev.filter((t) => t !== title));
    setFocused((f) => (f === title ? null : f));
  }, []);

  const handleOpen = useCallback(
    ({ target }: WinEvent) => {
      const { title } = target;
      setVisibleItems((p) => ({ ...p, [title]: true }));
      setMinimizedItems((p) => ({ ...p, [title]: true }));
      focusWindow(title);
    },
    [focusWindow]
  );

  const handleMinimize = useCallback(({ target }: WinEvent) => {
    const { title } = target;
    setVisibleItems((p) => ({ ...p, [title]: false }));
    setMinimizedItems((p) => ({ ...p, [title]: true }));
    setFocused((f) => (f === title ? null : f));
  }, []);

  const handleMaximize = useCallback(
    ({ target }: WinEvent) => {
      const { title } = target;
      setVisibleItems((p) => ({ ...p, [title]: true }));
      focusWindow(title);
    },
    [focusWindow]
  );

  // "Cerrar sesión" y "Apagar" dejan el escritorio limpio.
  const closeAll = useCallback(() => {
    setVisibleItems({});
    setMinimizedItems({});
    setOrder([]);
    setFocused(null);
  }, []);

  const value = useMemo<WindowsContextValue>(
    () => ({
      visibleItems,
      minimizedItems,
      setVisibleItems,
      setMinimizedItems,
      handleClose,
      handleOpen,
      handleMaximize,
      handleMinimize,
      closeAll,
      focused,
      focusWindow,
      zIndexOf,
    }),
    [
      visibleItems,
      minimizedItems,
      focused,
      handleClose,
      handleOpen,
      handleMaximize,
      handleMinimize,
      closeAll,
      focusWindow,
      zIndexOf,
    ]
  );

  return (
    <WindowsContext.Provider value={value}>{children}</WindowsContext.Provider>
  );
};

export default WindowsContext;
