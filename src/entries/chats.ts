import "../styles/main.scss";
import Handlebars from "handlebars";
import tpl from "../pages/chats.hbs?raw";
import { renderHandlebarsFragment } from "../utils/dom";
import { auth } from "../utils/auth";
import { chats as chatsApi, type Chat, type Message } from "../utils/chats";
import { validators } from "../utils/validation";
import { staticHtml } from "../utils/staticHtmlUrl";

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const app = document.getElementById("app");
if (!app) throw new Error("Нет контейнера #app");

if (!auth.current()) {
  window.location.assign(staticHtml("login.html"));
} else {
  renderHandlebarsFragment(app, Handlebars.compile(tpl)({}));

  let activeId: string | null = null;
  let query = "";

  const listEl = document.getElementById("chat-list") as HTMLUListElement | null;
  const emptyEl = document.getElementById("chat-list-empty");
  const placeholder = document.getElementById("conversation-placeholder");
  const activeWrap = document.getElementById("conversation-active");
  const titleEl = document.getElementById("chat-title");
  const membersEl = document.getElementById("chat-members-count");
  const avatarSlot = document.getElementById("chat-avatar-slot");
  const messageList = document.getElementById("message-list");
  const msgError = document.getElementById("msg-error");
  const menuEl = document.getElementById("chat-menu");
  const avatarInput = document.getElementById("chat-avatar-input") as HTMLInputElement | null;

  const dlgCreate = document.getElementById("dlg-create") as HTMLDialogElement | null;
  const dlgAdd = document.getElementById("dlg-add-user") as HTMLDialogElement | null;
  const dlgRemove = document.getElementById("dlg-remove-user") as HTMLDialogElement | null;

  const setMsgErr = (t: string) => {
    if (msgError) msgError.textContent = t;
  };

  const renderMessages = (c: Chat, meId: string) => {
    if (!messageList) return;
    messageList.replaceChildren();
    if (c.messages.length === 0) {
      const hint = document.createElement("div");
      hint.className = "conversation__date";
      hint.textContent = "Начните диалог";
      messageList.appendChild(hint);
      return;
    }
    for (const m of c.messages) {
      const row = document.createElement("div");
      row.className = `message ${m.authorId === meId ? "message--out" : "message--in"}`;
      if (m.authorId !== meId) {
        const author = document.createElement("div");
        author.className = "message__author";
        author.textContent = m.authorName;
        row.appendChild(author);
      }
      const text = document.createElement("span");
      text.textContent = m.text;
      row.appendChild(text);
      const time = document.createElement("span");
      time.className = "message__time";
      time.textContent = formatTime(m.ts);
      row.appendChild(time);
      messageList.appendChild(row);
    }
    messageList.scrollTop = messageList.scrollHeight;
  };

  const renderHeader = (c: Chat) => {
    if (titleEl) titleEl.textContent = c.title;
    if (membersEl) membersEl.textContent = `${c.memberIds.length} уч.`;
    if (avatarSlot) {
      avatarSlot.replaceChildren();
      if (c.avatar) {
        const img = document.createElement("img");
        img.className = "conversation__header-avatar";
        img.src = c.avatar;
        img.alt = "";
        avatarSlot.appendChild(img);
      } else {
        const span = document.createElement("span");
        span.className = "conversation__header-avatar";
        span.setAttribute("aria-hidden", "true");
        avatarSlot.appendChild(span);
      }
    }
  };

  const renderConversation = () => {
    const me = auth.current();
    if (!me || !placeholder || !activeWrap || !messageList) return;
    const c = activeId ? chatsApi.get(activeId) : undefined;
    if (!c) {
      placeholder.hidden = false;
      activeWrap.hidden = true;
      if (menuEl) menuEl.hidden = true;
      return;
    }
    placeholder.hidden = true;
    activeWrap.hidden = false;
    if (menuEl) menuEl.hidden = true;
    renderHeader(c);
    renderMessages(c, me.id);
  };

  const renderList = () => {
    if (!listEl || !emptyEl) return;
    const items = chatsApi.search(query);
    listEl.replaceChildren();
    if (items.length === 0) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    for (const c of items) {
      const li = document.createElement("li");
      li.className = `chat-item${c.id === activeId ? " chat-item--active" : ""}`;
      li.addEventListener("click", () => {
        activeId = c.id;
        renderList();
        renderConversation();
      });

      if (c.avatar) {
        const img = document.createElement("img");
        img.className = "chat-item__avatar";
        img.src = c.avatar;
        img.alt = "";
        li.appendChild(img);
      } else {
        const av = document.createElement("span");
        av.className = "chat-item__avatar";
        av.setAttribute("aria-hidden", "true");
        li.appendChild(av);
      }

      const body = document.createElement("div");
      body.className = "chat-item__body";
      const name = document.createElement("div");
      name.className = "chat-item__name";
      name.textContent = c.title;
      const last = document.createElement("div");
      last.className = "chat-item__last";
      const lastMsg: Message | undefined = c.messages[c.messages.length - 1];
      last.textContent = lastMsg ? `${lastMsg.authorName}: ${lastMsg.text}` : "Нет сообщений";
      body.appendChild(name);
      body.appendChild(last);
      li.appendChild(body);

      const meta = document.createElement("div");
      meta.className = "chat-item__meta";
      const time = document.createElement("span");
      time.className = "chat-item__time";
      time.textContent = lastMsg ? formatTime(lastMsg.ts) : "";
      meta.appendChild(time);
      li.appendChild(meta);

      listEl.appendChild(li);
    }
  };

  const fullRefresh = () => {
    renderList();
    renderConversation();
  };

  document.getElementById("search-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  document.getElementById("chat-search")?.addEventListener("input", (e) => {
    query = (e.target as HTMLInputElement).value;
    fullRefresh();
  });

  document.getElementById("btn-new-chat")?.addEventListener("click", () => {
    dlgCreate?.showModal();
  });

  document.getElementById("dlg-create-cancel")?.addEventListener("click", () => {
    dlgCreate?.close();
  });

  document.getElementById("form-create-chat")?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();
    const errEl = document.getElementById("err-create");
    if (errEl) errEl.textContent = "";
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const title = (fd.get("title") as string) ?? "";
    const err = validators.chatTitle(title);
    if (err) {
      if (errEl) errEl.textContent = err;
      return;
    }
    const c = chatsApi.create(title.trim());
    activeId = c.id;
    dlgCreate?.close();
    (e.currentTarget as HTMLFormElement).reset();
    fullRefresh();
  });

  document.getElementById("btn-chat-menu")?.addEventListener("click", () => {
    if (!menuEl) return;
    menuEl.hidden = !menuEl.hidden;
  });

  document.getElementById("btn-add-user")?.addEventListener("click", () => {
    if (menuEl) menuEl.hidden = true;
    dlgAdd?.showModal();
  });

  document.getElementById("btn-remove-user")?.addEventListener("click", () => {
    if (menuEl) menuEl.hidden = true;
    dlgRemove?.showModal();
  });

  document.getElementById("dlg-add-cancel")?.addEventListener("click", () => dlgAdd?.close());
  document.getElementById("dlg-remove-cancel")?.addEventListener("click", () => dlgRemove?.close());

  document.getElementById("form-add-user")?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();
    const errEl = document.getElementById("err-add-user");
    if (errEl) errEl.textContent = "";
    if (!activeId) return;
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const login = ((fd.get("login") as string) ?? "").trim();
    try {
      chatsApi.addMember(activeId, login);
      dlgAdd?.close();
      (e.currentTarget as HTMLFormElement).reset();
      fullRefresh();
    } catch (err) {
      if (errEl) errEl.textContent = (err as Error).message;
    }
  });

  document.getElementById("form-remove-user")?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();
    const errEl = document.getElementById("err-remove-user");
    if (errEl) errEl.textContent = "";
    if (!activeId) return;
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const login = ((fd.get("login") as string) ?? "").trim();
    try {
      chatsApi.removeMember(activeId, login);
      dlgRemove?.close();
      (e.currentTarget as HTMLFormElement).reset();
      fullRefresh();
    } catch (err) {
      if (errEl) errEl.textContent = (err as Error).message;
    }
  });

  document.getElementById("btn-delete-chat")?.addEventListener("click", () => {
    if (!activeId) return;
    const c = chatsApi.get(activeId);
    if (!c) return;
    if (!window.confirm(`Удалить чат "${c.title}"?`)) return;
    try {
      chatsApi.remove(activeId);
      activeId = null;
      if (menuEl) menuEl.hidden = true;
      fullRefresh();
    } catch (err) {
      window.alert((err as Error).message);
    }
  });

  avatarInput?.addEventListener("change", () => {
    if (!activeId || !avatarInput.files?.[0]) return;
    const file = avatarInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      chatsApi.setAvatar(activeId!, reader.result as string);
      avatarInput.value = "";
      fullRefresh();
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("message-form")?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();
    setMsgErr("");
    if (!activeId) return;
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const text = (fd.get("message") as string) ?? "";
    const err = validators.message(text);
    if (err) {
      setMsgErr(err);
      return;
    }
    chatsApi.sendMessage(activeId, text.trim());
    (e.currentTarget as HTMLFormElement).reset();
    fullRefresh();
  });

  fullRefresh();
}
