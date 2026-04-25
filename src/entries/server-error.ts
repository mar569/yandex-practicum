import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/500.hbs?raw";
import { renderHandlebarsFragment } from "../utils/dom";

const app = document.getElementById("app");
if (!app) throw new Error("Нет контейнера #app");

renderHandlebarsFragment(app, Handlebars.compile(tpl)({}));
