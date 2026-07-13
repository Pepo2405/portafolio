import React from 'react'
import ReactDOM from 'react-dom/client'
import { WindowsProvider } from 'src/context/WindowsContext'
import App from 'src/App'
import 'src/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WindowsProvider>
      <App />
    </WindowsProvider>
  </React.StrictMode>,
)
