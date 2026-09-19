import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App.tsx";
import { initializeClientEnvironment } from "@adaptive-ai/sdk/client";
import { RootErrorBoundary } from "@/components/error-boundary";

initializeClientEnvironment({
  appId: import.meta.env.VITE_APP_ID,
  rootUrl: import.meta.env.VITE_ROOT_URL,
  baseUrl: import.meta.env.VITE_BASE_URL,
  isTesting: !import.meta.env.PROD,
  realtimeDomain: import.meta.env.VITE_REALTIME_DOMAIN,
  boxId: import.meta.env.VITE_BOX_ID,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
