import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/chats.hbs?raw";
import { renderHandlebarsFragment } from "@/utils/dom";
import { ChatController } from "@/controllers/ChatController";
import { auth } from "@/utils/auth";
import { router } from "@/core/Router";

export async function mountChatsPage(root: HTMLElement): Promise<void> {
  if (!auth.current()) {
    router.go("/");
    return;
  }

  renderHandlebarsFragment(root, Handlebars.compile(tpl)({}));

  const listEl = document.getElementById(
    "chat-list",
  ) as HTMLUListElement | null;
  const emptyEl = document.getElementById("chat-list-empty");
  const placeholder = document.getElementById("conversation-placeholder");
  const activeWrap = document.getElementById("conversation-active");
  const titleEl = document.getElementById("chat-title");
  const membersEl = document.getElementById("chat-members-count");
  const avatarSlot = document.getElementById("chat-avatar-slot");
  const messageList = document.getElementById("message-list");
  const msgError = document.getElementById("msg-error");
  const menuEl = document.getElementById("chat-menu");

  const controller = new ChatController({
    list: listEl as HTMLUListElement,
    empty: emptyEl as HTMLElement,
    placeholder: placeholder as HTMLElement,
    activeWrap: activeWrap as HTMLElement,
    title: titleEl as HTMLElement,
    members: membersEl as HTMLElement,
    avatarSlot: avatarSlot as HTMLElement,
    messageList: messageList as HTMLElement,
    menu: menuEl as HTMLElement,
    msgError: msgError as HTMLElement,
  });

  await controller.init();

  document.getElementById("search-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  document.getElementById("chat-search")?.addEventListener("input", (e) => {
    controller.updateSearch((e.target as HTMLInputElement).value);
  });

  document.getElementById("btn-new-chat")?.addEventListener("click", () => {
    const dialog = document.getElementById(
      "dlg-create",
    ) as HTMLDialogElement | null;
    if (dialog) {
      dialog.showModal();
    }
  });

  document
    .getElementById("dlg-create-cancel")
    ?.addEventListener("click", () => {
      const dialog = document.getElementById(
        "dlg-create",
      ) as HTMLDialogElement | null;
      if (dialog) {
        dialog.close();
      }
    });

  document
    .getElementById("form-create-chat")
    ?.addEventListener("submit", async (e: SubmitEvent) => {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement | null;
      if (!form) return;
      const errEl = document.getElementById("err-create");
      if (errEl) errEl.textContent = "";
      const fd = new FormData(form);
      const title = (fd.get("title") as string) ?? "";
      try {
        await controller.createChat(title);
        if (!document.getElementById("err-create")?.textContent) {
          form.reset();
          const dialog = document.getElementById(
            "dlg-create",
          ) as HTMLDialogElement | null;
          if (dialog) {
            dialog.close();
          }
        }
      } catch (err) {
        const errEl = document.getElementById("err-create");
        if (errEl) {
          errEl.textContent = err instanceof Error ? err.message : String(err);
        }
      }
    });

  document.getElementById("btn-chat-menu")?.addEventListener("click", () => {
    controller.toggleMenu();
  });

  document.getElementById("btn-add-user")?.addEventListener("click", () => {
    const menu = document.getElementById("chat-menu");
    if (menu) {
      menu.hidden = true;
    }
    const dialog = document.getElementById(
      "dlg-add-user",
    ) as HTMLDialogElement | null;
    if (dialog) {
      dialog.showModal();
    }
  });

  document.getElementById("btn-remove-user")?.addEventListener("click", () => {
    const menu = document.getElementById("chat-menu");
    if (menu) {
      menu.hidden = true;
    }
    const dialog = document.getElementById(
      "dlg-remove-user",
    ) as HTMLDialogElement | null;
    if (dialog) {
      dialog.showModal();
    }
  });

  document.getElementById("dlg-add-cancel")?.addEventListener("click", () => {
    const dialog = document.getElementById(
      "dlg-add-user",
    ) as HTMLDialogElement | null;
    if (dialog) {
      dialog.close();
    }
  });

  document
    .getElementById("dlg-remove-cancel")
    ?.addEventListener("click", () => {
      const dialog = document.getElementById(
        "dlg-remove-user",
      ) as HTMLDialogElement | null;
      if (dialog) {
        dialog.close();
      }
    });

  document
    .getElementById("form-add-user")
    ?.addEventListener("submit", async (e: SubmitEvent) => {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement | null;
      if (!form) return;
      const errEl = document.getElementById("err-add-user");
      if (errEl) errEl.textContent = "";
      const fd = new FormData(form);
      const login = ((fd.get("login") as string) ?? "").trim();
      try {
        await controller.addMember(login);
        form.reset();
        const dialog = document.getElementById(
          "dlg-add-user",
        ) as HTMLDialogElement | null;
        if (dialog) {
          dialog.close();
        }
      } catch (err) {
        if (errEl) errEl.textContent = (err as Error).message;
      }
    });

  document
    .getElementById("form-remove-user")
    ?.addEventListener("submit", async (e: SubmitEvent) => {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement | null;
      if (!form) return;
      const errEl = document.getElementById("err-remove-user");
      if (errEl) errEl.textContent = "";
      const fd = new FormData(form);
      const login = ((fd.get("login") as string) ?? "").trim();
      try {
        await controller.removeMember(login);
        form.reset();
        const dialog = document.getElementById(
          "dlg-remove-user",
        ) as HTMLDialogElement | null;
        if (dialog) {
          dialog.close();
        }
      } catch (err) {
        if (errEl) errEl.textContent = (err as Error).message;
      }
    });

  document
    .getElementById("btn-delete-chat")
    ?.addEventListener("click", async () => {
      await controller.deleteChat();
    });

  document
    .getElementById("chat-avatar-input")
    ?.addEventListener("change", (e) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      void controller.updateAvatar(file);
      input.value = "";
    });

  document
    .getElementById("message-form")
    ?.addEventListener("submit", (e: SubmitEvent) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      const text = (fd.get("message") as string) ?? "";
      controller.sendMessage(text);
      (e.currentTarget as HTMLFormElement).reset();
    });
}

const chatsRoot = document.getElementById("app");
if (chatsRoot && document.getElementById("chat-list")) {
  void mountChatsPage(chatsRoot);
}
