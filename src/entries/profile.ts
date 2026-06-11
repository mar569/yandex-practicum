import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/profile.hbs?raw";
import { renderHandlebarsFragment } from "@/utils/dom";
import { auth } from "@/utils/auth";
import { ProfileController } from "@/controllers/ProfileController";
import { router } from "@/core/Router";

export async function mountProfilePage(root: HTMLElement): Promise<void> {
  const me = auth.current();
  if (!me) {
    router.go("/");
    return;
  }

  const { password: _pw, ...ctx } = me;
  void _pw;
  renderHandlebarsFragment(root, Handlebars.compile(tpl)(ctx));

  const profileController = new ProfileController();
  profileController.initProfilePage();
}

const profileRoot = document.getElementById("app");
if (profileRoot && document.getElementById("logout-btn")) {
  void mountProfilePage(profileRoot);
}
