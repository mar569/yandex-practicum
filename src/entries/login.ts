import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/login.hbs?raw";
import { renderHandlebarsFragment } from "@/utils/dom";
import { AuthController } from "@/controllers/AuthController";
import { Button } from "@/components/Button";
import { Form } from "@/components/Form";
import { Input } from "@/components/Input";

export async function mountLoginPage(root: HTMLElement): Promise<void> {
  renderHandlebarsFragment(root, Handlebars.compile(tpl)({}));

  const formContainer = document.getElementById("login-form-container");
  if (!formContainer) throw new Error("Нет контейнера формы входа");

  const loginForm = new Form({
    id: "login-form",
    ariaLabel: "Форма входа",
    className: "auth__form",
    children: [
      new Input({
        id: "login",
        name: "login",
        label: "Логин",
        type: "text",
        placeholder: "Введите логин",
      }).getContent(),
      new Input({
        id: "password",
        name: "password",
        label: "Пароль",
        type: "password",
        placeholder: "Введите пароль",
      }).getContent(),
      (() => {
        const error = document.createElement("div");
        error.className = "field__error field__error--form";
        error.id = "form-error";
        error.setAttribute("role", "alert");
        return error;
      })(),
      new Button({
        type: "submit",
        label: "Войти",
        className: "btn",
      }).getContent(),
    ],
    onSubmit: () => {
      // Form submission is handled by AuthController
    },
  });

  formContainer.appendChild(loginForm.getContent());

  const authController = new AuthController();
  const loginElement = document.getElementById(
    "login-form",
  ) as HTMLFormElement | null;
  if (loginElement) {
    authController.initLogin(loginElement);
  }
}

const loginRoot = document.getElementById("app");
if (loginRoot && document.getElementById("login-form-container")) {
  void mountLoginPage(loginRoot);
}
