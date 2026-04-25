import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/profile-password.hbs?raw";
import { renderHandlebarsFragment, clearText, setText } from "../utils/dom";
import { auth } from "../utils/auth";
import { validators } from "../utils/validation";
import { staticHtml } from "../utils/staticHtmlUrl";

const app = document.getElementById("app");
if (!app) throw new Error("Нет контейнера #app");

if (!auth.current()) {
  window.location.assign(staticHtml("login.html"));
} else {
  renderHandlebarsFragment(app, Handlebars.compile(tpl)({}));

  const form = document.getElementById("password-form") as HTMLFormElement | null;
  form?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();
    clearText("err-old_password");
    clearText("err-new_password");
    clearText("form-error");
    clearText("form-success");

    const formEl = e.currentTarget as HTMLFormElement;
    const data = Object.fromEntries(new FormData(formEl).entries()) as Record<string, string>;
    const errs: Record<string, string> = {};
    if (!data.old_password?.trim()) errs.old_password = "Введите старый пароль";
    const np = validators.password(data.new_password ?? "");
    if (np) errs.new_password = np;
    if (errs.old_password) setText("err-old_password", errs.old_password);
    if (errs.new_password) setText("err-new_password", errs.new_password);
    if (Object.keys(errs).length) return;

    try {
      auth.changePassword(data.old_password, data.new_password);
      setText("form-success", "Пароль обновлён");
      form.reset();
    } catch (err) {
      setText("form-error", (err as Error).message);
    }
  });
}
