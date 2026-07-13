import { useContext } from "react";
import WindowsContext, {
  WindowsContextValue,
} from "src/context/WindowsContext";

const useWindow = (): WindowsContextValue => useContext(WindowsContext);

export default useWindow;
