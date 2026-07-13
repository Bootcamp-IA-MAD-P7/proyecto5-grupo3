import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import ChurnApp from "./ChurnApp.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChurnApp />
  </StrictMode>,
);
