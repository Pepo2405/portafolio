
import { Dispatch, SetStateAction, useContext } from 'react';
import WindowsContext from 'src/context/WindowsContext';


interface ContextType {
  visibleItems: any,
  minimizedItems: any,
  setVisibleItems?: Dispatch<SetStateAction<any>>,
  setMinimizedItems?: Dispatch<SetStateAction<any>>,
  handleClose?: Dispatch<SetStateAction<boolean>>,
  handleOpen?: Dispatch<SetStateAction<boolean>>,
  handleMaximize?: Dispatch<SetStateAction<boolean>>,
  handleMinimize?: Dispatch<SetStateAction<boolean>>,
}

const useWindow = () => {
  return useContext(WindowsContext) as ContextType
}

export default useWindow