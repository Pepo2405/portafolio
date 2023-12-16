import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from "react";

interface ContextType {
  visibleItems: any;
  minimizedItems: any;
  setVisibleItems?: Dispatch<SetStateAction<any>>;
  setMinimizedItems?: Dispatch<SetStateAction<any>>;
  handleClose?: Dispatch<SetStateAction<boolean>>;
  handleOpen?: Dispatch<SetStateAction<boolean>>;
  handleMaximize?: Dispatch<SetStateAction<boolean>>;
  handleMinimize?: Dispatch<SetStateAction<boolean>>;
}
const WindowsContext = createContext<ContextType>({
  minimizedItems: {},
  visibleItems: {},
  setVisibleItems: () => {},
  handleClose: () => {},
  handleOpen: () => {},
  handleMaximize: () => {},
  handleMinimize: () => {},
});

interface Props {
  children: ReactNode;
}

export const WindowsProvider: FC<Props> = ({ children }) => {
  const [visibleItems, setVisibleItems] = useState({
    Proyectos: false,
    Mochify: true,
  });
  const [minimizedItems, setMinimizedItems] = useState({
    Proyectos: false,
    "Mochi Draw": false,
    Mochify: true,
  });
  const handleClose = ({ target }: any) => {
    const { title } = target;
    setVisibleItems((prev) => ({ ...prev, [title]: false }));
    setMinimizedItems((prev) => ({ ...prev, [title]: false }));
  };
  const handleOpen = ({ target }: any) => {
    const { title } = target;
    setVisibleItems((prev) => ({ ...prev, [title]: true }));
    setMinimizedItems((prev) => ({ ...prev, [title]: true }));
  };

  const handleMinimize = ({ target }: any) => {
    const { title } = target;
    setVisibleItems((prev) => ({ ...prev, [title]: false }));
    setMinimizedItems((prev) => ({ ...prev, [title]: true }));
  };

  const handleMaximize = ({ target }: any) => {
    const { title } = target;
    setVisibleItems((prev) => ({ ...prev, [title]: true }));
  };

  return (
    <WindowsContext.Provider
      value={{
        minimizedItems,
        visibleItems,
        setVisibleItems,
        handleClose,
        handleOpen,
        setMinimizedItems,
        handleMaximize,
        handleMinimize,
      }}
    >
      {children}
    </WindowsContext.Provider>
  );
};

export default WindowsContext;
