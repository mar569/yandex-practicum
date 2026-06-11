import { storage } from "./storage";
import { auth } from "./auth";

export interface Message {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  ts: number;
}

export interface Chat {
  id: string;
  title: string;
  avatar?: string;
  ownerId: string;
  memberIds: string[];
  messages: Message[];
}

const KEY = "chats";
const uid = () => Math.random().toString(36).slice(2, 10);

export const chats = {
  all(): Chat[] {
    return storage.get<Chat[]>(KEY, []);
  },
  saveAll(items: Chat[]) {
    storage.set(KEY, items);
  },
  forCurrent(): Chat[] {
    const me = auth.current();
    if (!me) return [];
    return this.all().filter((c) => c.memberIds.includes(me.id));
  },
  search(query: string): Chat[] {
    const q = query.trim().toLowerCase();
    const list = this.forCurrent();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.text.toLowerCase().includes(q)),
    );
  },
  get(id: string): Chat | undefined {
    return this.all().find((c) => c.id === id);
  },
  create(title: string): Chat {
    const me = auth.current();
    if (!me) throw new Error("Не авторизован");
    const chat: Chat = {
      id: uid(),
      title,
      ownerId: me.id,
      memberIds: [me.id],
      messages: [],
    };
    const items = this.all();
    items.unshift(chat);
    this.saveAll(items);
    return chat;
  },
  remove(id: string): void {
    const me = auth.current();
    if (!me) throw new Error("Не авторизован");
    const chat = this.get(id);
    if (!chat) throw new Error("Чат не найден");
    if (chat.ownerId !== me.id)
      throw new Error("Только владелец может удалить чат");
    this.saveAll(this.all().filter((c) => c.id !== id));
  },
  setAvatar(id: string, dataUrl: string): void {
    this.saveAll(
      this.all().map((c) => (c.id === id ? { ...c, avatar: dataUrl } : c)),
    );
  },
  addMember(id: string, login: string): void {
    const user = this.resolveMember(login);
    this.saveAll(
      this.all().map((c) => {
        if (c.id !== id) return c;
        if (c.memberIds.includes(user.id)) throw new Error("Уже в чате");
        return { ...c, memberIds: [...c.memberIds, user.id] };
      }),
    );
  },
  removeMember(id: string, login: string): void {
    const user = this.resolveMember(login);
    this.saveAll(
      this.all().map((c) =>
        c.id === id
          ? { ...c, memberIds: c.memberIds.filter((m) => m !== user.id) }
          : c,
      ),
    );
  },
  resolveMember(login: string) {
    const current = auth.current();
    if (current?.login === login) return current;
    return {
      id: `user_${login}`,
      login,
      email: `${login}@example.com`,
      first_name: login,
      second_name: login,
      display_name: login,
      phone: "",
    };
  },
  sendMessage(id: string, text: string): Message {
    const me = auth.current();
    if (!me) throw new Error("Не авторизован");
    const msg: Message = {
      id: uid(),
      authorId: me.id,
      authorName: me.display_name,
      text,
      ts: Date.now(),
    };
    this.saveAll(
      this.all().map((c) =>
        c.id === id ? { ...c, messages: [...c.messages, msg] } : c,
      ),
    );
    return msg;
  },
};
