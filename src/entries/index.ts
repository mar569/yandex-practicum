import "../styles/main.scss";
import { router } from "@/core/Router";
import { auth } from "@/utils/auth";
import { mountLoginPage } from "@/entries/login";
import { mountRegisterPage } from "@/entries/register";
import { mountChatsPage } from "@/entries/chats";
import { mountProfilePage } from "@/entries/profile";
import { mountProfileEditPage } from "@/entries/profile-edit";
import { mountProfilePasswordPage } from "@/entries/profile-password";
import { mountNotFoundPage } from "@/entries/not-found";
import { mountServerErrorPage } from "@/entries/server-error";

const app = document.getElementById("app");
if (!app) throw new Error("Нет контейнера #app");

async function bootstrap(): Promise<void> {
  await auth.check();

  router
    .use("/", mountLoginPage, { auth: "guest" })
    .use("/sign-up", mountRegisterPage, { auth: "guest" })
    .use("/messenger", mountChatsPage, { auth: "private" })
    .use("/settings", mountProfilePage, { auth: "private" })
    .use("/settings/edit", mountProfileEditPage, { auth: "private" })
    .use("/settings/password", mountProfilePasswordPage, { auth: "private" })
    .use("/404", mountNotFoundPage)
    .use("/500", mountServerErrorPage);

  router.start();
}

void bootstrap();
