import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/404.hbs?raw";
import { renderHandlebarsFragment } from "@/utils/dom";

export function mountNotFoundPage(root: HTMLElement): void {
  renderHandlebarsFragment(root, Handlebars.compile(tpl)({}));
}

const notFoundRoot = document.getElementById("app");
if (notFoundRoot && window.location.pathname === "/404") {
  mountNotFoundPage(notFoundRoot);
}
