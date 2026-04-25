import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/login.hbs?raw";
import { registerFieldPartial } from "../utils/partials";
import { renderHandlebarsFragment, clearText, setText } from "../utils/dom";
import { auth } from "../utils/auth";
import { validateForm, validators } from "../utils/validation";
import { staticHtml } from "../utils/staticHtmlUrl";

registerFieldPartial();

const app = document.getElementById("app");
if (!app) throw new Error("Нет контейнера #app");

if (auth.current()) {
  window.location.assign(staticHtml("chats.html"));
} else {
  renderHandlebarsFragment(app, Handlebars.compile(tpl)({}));

  const form = document.getElementById("login-form") as HTMLFormElement | null;
  form?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();
    clearText("err-login");
    clearText("err-password");
    clearText("form-error");

    const formEl = e.currentTarget as HTMLFormElement;
    const data = Object.fromEntries(new FormData(formEl).entries()) as Record<string, string>;
    const errs = validateForm(data, { login: validators.login, password: validators.password });
    for (const k of Object.keys(errs)) {
      setText(`err-${k}`, errs[k] ?? "");
    }
    if (Object.keys(errs).length) return;

    try {
      auth.login(data.login, data.password);
      window.location.assign(staticHtml("chats.html"));
    } catch (err) {
      setText("form-error", (err as Error).message);
    }
  });
}
