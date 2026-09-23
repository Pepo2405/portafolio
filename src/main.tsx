import React from "react";
import ReactDOM from "react-dom/client";
import { I18nProvider } from "src/i18n";
import { WindowsProvider } from "src/context/WindowsContext";
import { alternateHref, parseRoute } from "src/routes";
import App from "src/App";
import "src/styles/globals.css";

const { locale, initialWindows } = parseRoute(window.location.pathname);

const app = (
  <React.StrictMode>
    <I18nProvider
      locale={locale}
      alternateHref={alternateHref(window.location.pathname)}
    >
      <WindowsProvider initialWindows={initialWindows}>
        <App />
      </WindowsProvider>
    </I18nProvider>
  </React.StrictMode>
);

const root = document.getElementById("root")!;
// En dev no hay HTML prerenderizado: render normal. En prod se hidrata el
// markup que generó scripts/prerender.tsx.
if (import.meta.env.DEV) {
  ReactDOM.createRoot(root).render(app);
} else {
  ReactDOM.hydrateRoot(root, app);
}
