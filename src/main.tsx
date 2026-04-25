import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/main.scss";

const el = document.getElementById("root");
if (!el) throw new Error("Нет контейнера #root");

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
