import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/profile-edit.hbs?raw";
import { renderHandlebarsFragment } from "@/utils/dom";
import { ProfileController } from "@/controllers/ProfileController";
import { Button } from "@/components/Button";
import { Form } from "@/components/Form";
import { Input } from "@/components/Input";
import { auth } from "@/utils/auth";
import { router } from "@/core/Router";

export async function mountProfileEditPage(root: HTMLElement): Promise<void> {
  const me = auth.current();
  if (!me) {
    router.go("/");
    return;
  }

  renderHandlebarsFragment(
    root,
    Handlebars.compile(tpl)({
      email: me.email,
      login: me.login,
      first_name: me.first_name,
      second_name: me.second_name,
      display_name: me.display_name,
      phone: me.phone,
    }),
  );

  const formContainer = document.getElementById("edit-form-container");
  if (!formContainer)
    throw new Error("Нет контейнера формы редактирования профиля");

  const profileForm = new Form({
    id: "edit-form",
    ariaLabel: "Изменить данные",
    className: "profile__form",
    children: [
      new Input({
        id: "email",
        name: "email",
        label: "Почта",
        type: "email",
        value: me.email,
      }).getContent(),
      new Input({
        id: "login",
        name: "login",
        label: "Логин",
        type: "text",
        value: me.login,
      }).getContent(),
      new Input({
        id: "first_name",
        name: "first_name",
        label: "Имя",
        type: "text",
        value: me.first_name,
      }).getContent(),
      new Input({
        id: "second_name",
        name: "second_name",
        label: "Фамилия",
        type: "text",
        value: me.second_name,
      }).getContent(),
      new Input({
        id: "display_name",
        name: "display_name",
        label: "Имя в чате",
        type: "text",
        value: me.display_name,
      }).getContent(),
      new Input({
        id: "phone",
        name: "phone",
        label: "Телефон",
        type: "tel",
        value: me.phone,
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
        label: "Сохранить",
        className: "btn",
      }).getContent(),
    ],
    onSubmit: () => {
      // handled by controller
    },
  });

  formContainer.appendChild(profileForm.getContent());

  const profileController = new ProfileController();
  const editElement = document.getElementById(
    "edit-form",
  ) as HTMLFormElement | null;
  if (editElement) {
    profileController.initEditPage(editElement);
  }
}

const profileEditRoot = document.getElementById("app");
if (profileEditRoot && document.getElementById("edit-form-container")) {
  void mountProfileEditPage(profileEditRoot);
}
