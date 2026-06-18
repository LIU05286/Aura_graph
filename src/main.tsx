import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "./styles/global.css";
import "./styles/auraGraph.css";
import "./styles/layout.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("缺少 #root 挂载点");

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
