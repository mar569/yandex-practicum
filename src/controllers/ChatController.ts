import { ChatItem } from "@/components/ChatItem";
import { ChatMessage } from "@/components/ChatMessage";
import { auth } from "@/utils/auth";
import { chatsApi } from "@/api/chats";
import { userApi } from "@/api/user";
import { validators } from "@/utils/validation";
import { router } from "@/core/Router";
import { ChatSocket, type ChatSocketMessage } from "@/services/ChatSocket";
import { store } from "@/core/Store";
import type { Message } from "@/utils/chats";

interface ChatControllerElements {
  list: HTMLUListElement;
  empty: HTMLElement;
  placeholder: HTMLElement;
  activeWrap: HTMLElement;
  title: HTMLElement;
  members: HTMLElement;
  avatarSlot: HTMLElement;
  messageList: HTMLElement;
  menu: HTMLElement;
  msgError: HTMLElement;
}

export class ChatController {
  private activeChatId: string | null = null;
  private searchQuery = "";
  private elements: ChatControllerElements;
  private socket: ChatSocket;
  private messages: Message[] = [];

  constructor(elements: ChatControllerElements) {
    this.elements = elements;
    this.socket = new ChatSocket(this.onSocketMessage.bind(this));
  }

  public async init(): Promise<void> {
    if (!auth.current()) {
      router.go("/");
      return;
    }

    await this.loadChats();
    this.renderList();
    this.renderConversation();
  }

  public async setActiveChat(chatId: string): Promise<void> {
    if (this.activeChatId === chatId) return;
    this.activeChatId = chatId;
    this.messages = [];
    await this.connectChat(chatId);
    await this.loadChatUsers(chatId);
    this.renderList();
    this.renderConversation();
  }

  public updateSearch(query: string): void {
    this.searchQuery = query;
    this.renderList();
  }

  public async createChat(title: string): Promise<void> {
    const trimmed = title.trim();
    const error = validators.chatTitle(trimmed);
    if (error) {
      this.setMessageError(error);
      return;
    }

    try {
      const created = await chatsApi.createChat(trimmed);
      store.set("chats", [created, ...store.getState().chats]);
      this.activeChatId = created.id;
      this.clearMessageError();
      await this.connectChat(created.id);
      this.renderList();
      this.renderConversation();
    } catch (error) {
      this.setMessageError(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  public async addMember(login: string): Promise<void> {
    if (!this.activeChatId) return;
    const trimmed = login.trim();
    if (!trimmed) return;

    const users = await userApi.search(trimmed);
    if (users.length === 0) {
      throw new Error("Пользователь не найден");
    }

    await chatsApi.addUsers(this.activeChatId, [Number(users[0].id)]);
    await this.loadChatUsers(this.activeChatId);
    this.renderList();
    this.renderConversation();
  }

  public async removeMember(login: string): Promise<void> {
    if (!this.activeChatId) return;
    const trimmed = login.trim();
    if (!trimmed) return;

    const users = await userApi.search(trimmed);
    if (users.length === 0) {
      throw new Error("Пользователь не найден");
    }

    await chatsApi.removeUsers(this.activeChatId, [Number(users[0].id)]);
    await this.loadChatUsers(this.activeChatId);
    this.renderList();
    this.renderConversation();
  }

  public async deleteChat(): Promise<void> {
    if (!this.activeChatId) return;
    const chat = store
      .getState()
      .chats.find((item) => item.id === this.activeChatId);
    if (!chat) return;
    if (!window.confirm(`Удалить чат "${chat.title}"?`)) return;

    await chatsApi.deleteChat(chat.id);
    store.set(
      "chats",
      store.getState().chats.filter((item) => item.id !== this.activeChatId),
    );
    this.activeChatId = null;
    this.elements.menu.hidden = true;
    this.renderList();
    this.renderConversation();
  }

  public async updateAvatar(file: File): Promise<void> {
    if (!this.activeChatId) return;
    const formData = new FormData();
    formData.append("chatId", this.activeChatId);
    formData.append("avatar", file);

    await chatsApi.updateAvatar(this.activeChatId, formData);
    await this.loadChats();
    this.renderConversation();
  }

  public sendMessage(text: string): void {
    this.setMessageError("");
    if (!this.activeChatId) return;
    const error = validators.message(text);
    if (error) {
      this.setMessageError(error);
      return;
    }
    this.socket.sendMessage(text.trim());
  }

  public toggleMenu(): void {
    this.elements.menu.hidden = !this.elements.menu.hidden;
  }

  private setMessageError(message: string): void {
    if (this.elements.msgError) {
      this.elements.msgError.textContent = message;
    }
  }

  private clearMessageError(): void {
    this.setMessageError("");
  }

  private async loadChats(): Promise<void> {
    try {
      const chats = await chatsApi.getChats();
      store.set("chats", chats);
    } catch (error) {
      console.error("Failed to load chats:", error);
      this.setMessageError(
        error instanceof Error ? error.message : "Failed to load chats",
      );
      store.set("chats", []);
    }
  }

  private async connectChat(chatId: string): Promise<void> {
    try {
      // Connect WebSocket for real-time messages and get old messages
      await this.socket.connect(chatId);
      // Request old messages via WebSocket after connection
      this.socket.getOldMessages("0");
    } catch {
      this.setMessageError("Не удалось подключиться к чату");
    }
  }

  private async loadChatUsers(chatId: string): Promise<void> {
    try {
      const users = await chatsApi.getUsers(chatId);
      if (Array.isArray(users)) {
        const chatUsers = (users as Array<Record<string, unknown>>).map((user) => ({
          id: String(user.id ?? ""),
          login: String(user.login ?? ""),
          email: String(user.email ?? ""),
          first_name: String(user.first_name ?? ""),
          second_name: String(user.second_name ?? ""),
          display_name: String(user.display_name ?? user.login ?? ""),
          phone: String(user.phone ?? ""),
          avatar: user.avatar ? String(user.avatar) : undefined,
        }));
        store.set("currentChatUsers", chatUsers);
      }
    } catch (error) {
      console.error("Error loading chat users:", error);
      store.set("currentChatUsers", []);
    }
  }

  private onSocketMessage(
    payload: ChatSocketMessage | ChatSocketMessage[],
  ): void {
    if (Array.isArray(payload)) {
      const messages = payload
        .map(this.normalizeSocketMessage)
        .filter((message): message is Message => message !== null)
        .reverse();
      this.messages = messages;
      this.renderConversation();
      return;
    }

    if (payload.type === "pong" || payload.type === "user connected") {
      return;
    }

    const message = this.normalizeSocketMessage(payload);
    if (message) {
      this.messages = [...this.messages, message];
      this.renderConversation();
    }
  }

  private normalizeSocketMessage(payload: ChatSocketMessage): Message | null {
    if (
      !payload.content ||
      !payload.user_id ||
      !payload.time ||
      !payload.type
    ) {
      return null;
    }

    return {
      id: payload.id ?? `${Date.now()}`,
      authorId: String(payload.user_id),
      authorName: String(payload.user_id),
      text: payload.content,
      ts: Date.parse(payload.time) || Date.now(),
    };
  }

  private renderList(): void {
    const query = this.searchQuery.trim().toLowerCase();
    const chats = store.getState().chats.filter((chat) => {
      if (!query) return true;
      const messages = chat.messages || [];
      return (
        chat.title.toLowerCase().includes(query) ||
        messages.some((message) => message.text.toLowerCase().includes(query))
      );
    });

    this.elements.list.replaceChildren();
    this.elements.empty.hidden = chats.length > 0;
    if (chats.length === 0) return;

    const currentUser = auth.current();
    if (!currentUser) return;

    chats.forEach((chat) => {
      const chatItem = new ChatItem({
        chat,
        active: chat.id === this.activeChatId,
        onSelect: (chatId) => void this.setActiveChat(chatId),
      });
      this.elements.list.appendChild(chatItem.getContent());
    });
  }

  private renderConversation(): void {
    const currentUser = auth.current();
    if (!currentUser) return;

    const chat = this.activeChatId
      ? store.getState().chats.find((item) => item.id === this.activeChatId)
      : undefined;
    if (!chat) {
      this.elements.placeholder.hidden = false;
      this.elements.activeWrap.hidden = true;
      this.elements.menu.hidden = true;
      return;
    }

    this.elements.placeholder.hidden = true;
    this.elements.activeWrap.hidden = false;
    this.elements.menu.hidden = true;
    this.elements.title.textContent = chat.title;
    const chatUsers = store.getState().currentChatUsers;
    this.elements.members.textContent = `${chatUsers.length || chat.memberIds.length} уч.`;

    this.elements.avatarSlot.replaceChildren();
    if (chat.avatar) {
      const img = document.createElement("img");
      img.className = "conversation__header-avatar";
      img.src = chat.avatar;
      img.alt = "";
      this.elements.avatarSlot.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.className = "conversation__header-avatar";
      span.setAttribute("aria-hidden", "true");
      this.elements.avatarSlot.appendChild(span);
    }

    this.elements.messageList.replaceChildren();
    const messages = this.messages.length > 0 ? this.messages : chat.messages;
    if (!messages || messages.length === 0) {
      const hint = document.createElement("div");
      hint.className = "conversation__date";
      hint.textContent = "Начните диалог";
      this.elements.messageList.appendChild(hint);
      return;
    }

    messages.forEach((message) => {
      const messageBlock = new ChatMessage({
        message,
        currentUserId: currentUser.id,
      });
      this.elements.messageList.appendChild(messageBlock.getContent());
    });
    this.elements.messageList.scrollTop =
      this.elements.messageList.scrollHeight;
  }
}
