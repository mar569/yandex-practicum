import { Block } from "@/core/Block";
import type { Chat } from "@/utils/chats";

export interface ChatItemProps {
  chat: Chat;
  active: boolean;
  onSelect: (chatId: string) => void;
}

export class ChatItem extends Block<ChatItemProps> {
  protected render(): HTMLElement {
    const li = this.createElement("li", [
      "chat-item",
      this.props.active ? "chat-item--active" : "",
    ]);
    li.addEventListener("click", () => this.props.onSelect(this.props.chat.id));

    if (this.props.chat.avatar) {
      const img = this.createElement("img", [
        "chat-item__avatar",
      ]) as HTMLImageElement;
      img.src = this.props.chat.avatar;
      img.alt = "";
      li.appendChild(img);
    } else {
      const avatar = this.createElement("span", ["chat-item__avatar"]);
      avatar.setAttribute("aria-hidden", "true");
      li.appendChild(avatar);
    }

    const body = this.createElement("div", ["chat-item__body"]);
    const name = this.createElement("div", ["chat-item__name"]);
    name.textContent = this.props.chat.title;
    const last = this.createElement("div", ["chat-item__last"]);
    const messages = this.props.chat.messages || [];
    const lastMessage =
      messages.length > 0 ? messages[messages.length - 1] : null;
    last.textContent = lastMessage
      ? `${lastMessage.authorName}: ${lastMessage.text}`
      : "Нет сообщений";

    body.appendChild(name);
    body.appendChild(last);
    li.appendChild(body);

    const meta = this.createElement("div", ["chat-item__meta"]);
    const time = this.createElement("span", ["chat-item__time"]);
    if (lastMessage) {
      const timestamp =
        typeof lastMessage.ts === "number"
          ? new Date(lastMessage.ts)
          : new Date(lastMessage.ts as unknown as string);
      time.textContent = timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    meta.appendChild(time);
    li.appendChild(meta);

    return li;
  }
}
