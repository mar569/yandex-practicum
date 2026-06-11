import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/profile-password.hbs?raw";
import { renderHandlebarsFragment } from "@/utils/dom";
import { ProfileController } from "@/controllers/ProfileController";
import { auth } from "@/utils/auth";
import { router } from "@/core/Router";

export async function mountProfilePasswordPage(
  root: HTMLElement,
): Promise<void> {
  if (!auth.current()) {
    router.go("/");
    return;
  }

  renderHandlebarsFragment(root, Handlebars.compile(tpl)({}));

  const profileController = new ProfileController();
  const passwordForm = document.getElementById(
    "password-form",
  ) as HTMLFormElement | null;
  if (passwordForm) {
    profileController.initPasswordPage(passwordForm);
  }
}

const profilePasswordRoot = document.getElementById("app");
if (profilePasswordRoot && document.getElementById("password-form")) {
  void mountProfilePasswordPage(profilePasswordRoot);
}
