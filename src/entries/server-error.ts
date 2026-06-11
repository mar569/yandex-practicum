import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/500.hbs?raw";
import { renderHandlebarsFragment } from "@/utils/dom";

export function mountServerErrorPage(root: HTMLElement): void {
  renderHandlebarsFragment(root, Handlebars.compile(tpl)({}));
}

const serverErrorRoot = document.getElementById("app");
if (serverErrorRoot && window.location.pathname === "/500") {
  mountServerErrorPage(serverErrorRoot);
}
