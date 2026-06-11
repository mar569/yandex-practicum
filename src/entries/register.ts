import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/register.hbs?raw";
import { renderHandlebarsFragment } from "@/utils/dom";
import { AuthController } from "@/controllers/AuthController";
import { Button } from "@/components/Button";
import { Form } from "@/components/Form";
import { Input } from "@/components/Input";

export async function mountRegisterPage(root: HTMLElement): Promise<void> {
  renderHandlebarsFragment(root, Handlebars.compile(tpl)({}));

  const formContainer = document.getElementById("register-form-container");
  if (!formContainer) throw new Error("Нет контейнера формы регистрации");

  const registerForm = new Form({
    id: "register-form",
    ariaLabel: "Форма регистрации",
    className: "auth__form",
    children: [
      new Input({
        id: "email",
        name: "email",
        label: "Почта",
        type: "email",
        placeholder: "Введите почту",
      }).getContent(),
      new Input({
        id: "login",
        name: "login",
        label: "Логин",
        type: "text",
        placeholder: "Введите логин",
      }).getContent(),
      new Input({
        id: "first_name",
        name: "first_name",
        label: "Имя",
        type: "text",
        placeholder: "Введите имя",
      }).getContent(),
      new Input({
        id: "second_name",
        name: "second_name",
        label: "Фамилия",
        type: "text",
        placeholder: "Введите фамилию",
      }).getContent(),
      new Input({
        id: "phone",
        name: "phone",
        label: "Телефон",
        type: "tel",
        placeholder: "+70000000000",
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
        label: "Зарегистрироваться",
        className: "btn",
      }).getContent(),
    ],
    onSubmit: () => {
      // Submission is handled by the controller
    },
  });

  formContainer.appendChild(registerForm.getContent());

  const authController = new AuthController();
  const registerElement = document.getElementById(
    "register-form",
  ) as HTMLFormElement | null;
  if (registerElement) {
    authController.initRegister(registerElement);
  }
}

const registerRoot = document.getElementById("app");
if (registerRoot && document.getElementById("register-form-container")) {
  void mountRegisterPage(registerRoot);
}
