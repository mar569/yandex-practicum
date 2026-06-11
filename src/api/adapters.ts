/**
 * Адаптеры для преобразования данных из API в локальные типы
 */
import type { User } from "@/utils/auth";
import type { Chat, Message } from "@/utils/chats";

/** Нормализует пользователя из API */
export function normalizeUser(data: unknown): User {
  const obj = data as Record<string, unknown>;
  const login = String(obj.login ?? obj.username ?? "");
  const displayName = obj.display_name || obj.displayName || login;

  return {
    id: String(obj.id ?? ""),
    login,
    email: String(obj.email ?? ""),
    first_name: String(obj.first_name ?? obj.firstName ?? ""),
    second_name: String(obj.second_name ?? obj.secondName ?? ""),
    display_name: String(displayName),
    phone: String(obj.phone ?? ""),
    avatar: obj.avatar ? String(obj.avatar) : undefined,
    password: obj.password ? String(obj.password) : undefined,
  };
}

/** Нормализует чат из API */
export function normalizeChat(data: unknown): Chat {
  const obj = data as Record<string, unknown>;
  return {
    id: String(obj.id ?? ""),
    title: String(obj.title ?? "Без названия"),
    avatar: obj.avatar ? String(obj.avatar) : undefined,
    ownerId: String(obj.owner_id ?? obj.ownerId ?? ""),
    memberIds: Array.isArray(obj.members)
      ? obj.members.map((m) => String((m as Record<string, unknown>).id ?? m))
      : [],
    messages: Array.isArray(obj.messages)
      ? obj.messages.map(normalizeMessage)
      : [],
  };
}

/** Нормализует сообщение из API */
export function normalizeMessage(data: unknown): Message {
  const obj = data as Record<string, unknown>;
  return {
    id: String(obj.id ?? ""),
    authorId: String(obj.user_id ?? obj.authorId ?? ""),
    authorName: String(obj.author_name ?? obj.authorName ?? "Unknown"),
    text: String(obj.content ?? obj.text ?? ""),
    ts:
      typeof obj.time === "number"
        ? obj.time
        : Date.parse(String(obj.time ?? 0)) || Date.now(),
  };
}

/** Нормализует массив чатов */
export function normalizeChats(data: unknown): Chat[] {
  return Array.isArray(data) ? data.map(normalizeChat) : [];
}

/** Нормализует массив пользователей */
export function normalizeUsers(data: unknown): User[] {
  return Array.isArray(data) ? data.map(normalizeUser) : [];
}
