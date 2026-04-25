import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/profile-edit.hbs?raw";
import { registerFieldPartial } from "../utils/partials";
import { renderHandlebarsFragment, clearText, setText } from "../utils/dom";
import { auth } from "../utils/auth";
import { validateForm, validators } from "../utils/validation";
import { staticHtml } from "../utils/staticHtmlUrl";

registerFieldPartial();

const app = document.getElementById("app");
if (!app) throw new Error("Нет контейнера #app");

const me = auth.current();
if (!me) {
  window.location.assign(staticHtml("login.html"));
} else {
  renderHandlebarsFragment(
    app,
    Handlebars.compile(tpl)({
      email: me.email,
      login: me.login,
      first_name: me.first_name,
      second_name: me.second_name,
      display_name: me.display_name,
      phone: me.phone,
    }),
  );

  const fields = ["email", "login", "first_name", "second_name", "display_name", "phone"] as const;

  const form = document.getElementById("edit-form") as HTMLFormElement | null;
  form?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();
    for (const f of fields) clearText(`err-${f}`);
    clearText("form-error");

    const formEl = e.currentTarget as HTMLFormElement;
    const data = Object.fromEntries(new FormData(formEl).entries()) as Record<string, string>;
    const errs = validateForm(data, {
      email: validators.email,
      login: validators.login,
      first_name: validators.name,
      second_name: validators.name,
      display_name: validators.name,
      phone: validators.phone,
    });
    for (const k of Object.keys(errs)) {
      setText(`err-${k}`, errs[k] ?? "");
    }
    if (Object.keys(errs).length) return;

    try {
      auth.update({
        email: data.email,
        login: data.login,
        first_name: data.first_name,
        second_name: data.second_name,
        phone: data.phone,
        display_name: data.display_name,
      });
      window.location.assign(staticHtml("profile.html"));
    } catch (err) {
      setText("form-error", (err as Error).message);
    }
  });
}
