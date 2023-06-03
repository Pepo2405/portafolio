import { WindowsProvider } from 'src/context/WindowsContext';
import App from './app';


export default function Index() {
  return (
    <WindowsProvider>
      <App />
    </WindowsProvider>
  )
}
