import { http } from "@/api/http";
import { normalizeChat, normalizeChats } from "@/api/adapters";
import type { Chat } from "@/utils/chats";

export interface CreateChatPayload {
  title: string;
}

export interface ChatTokenResponse {
  token: string;
}

export const chatsApi = {
  async getChats(): Promise<Chat[]> {
    const response = await http.get<unknown>("/chats", { credentials: true });
    return normalizeChats(response);
  },

  async createChat(title: string): Promise<Chat> {
    const response = await http.post<unknown>("/chats", {
      data: { title },
      credentials: true,
    });
    return normalizeChat(response);
  },

  async deleteChat(chatId: number | string): Promise<void> {
    await http.delete<void>("/chats", {
      data: { chatId },
      credentials: true,
    });
  },

  async getUsers(chatId: number | string): Promise<unknown[]> {
    return http.get<unknown[]>(`/chats/${chatId}/users`, { credentials: true });
  },

  async getNewMessagesCount(chatId: number | string): Promise<unknown> {
    return http.get<unknown>(`/chats/new/${chatId}`, { credentials: true });
  },

  async updateAvatar(chatId: number | string, data: FormData): Promise<void> {
    const payload = new FormData();
    payload.append("chatId", String(chatId));
    payload.append("avatar", data.get("avatar") as File);
    await http.put<void>("/chats/avatar", { data: payload, credentials: true });
  },

  async addUsers(chatId: number | string, users: number[]): Promise<void> {
    await http.put<void>("/chats/users", {
      data: { chatId, users },
      credentials: true,
    });
  },

  async removeUsers(chatId: number | string, users: number[]): Promise<void> {
    await http.delete<void>("/chats/users", {
      data: { chatId, users },
      credentials: true,
    });
  },

  async getToken(chatId: number | string): Promise<ChatTokenResponse> {
    const response = await http.post<unknown>(`/chats/token/${chatId}`, {
      credentials: true,
    });
    console.log("chatsApi.getToken: Raw response:", response);
    const obj = response as Record<string, unknown>;
    const token = obj && typeof obj === "object" && (obj.token ?? obj.access_token)
      ? String((obj.token ?? obj.access_token))
      : "";
    if (!token) {
      console.error("chatsApi.getToken: missing token in response", response);
      throw new Error("Missing token in getToken response");
    }
    console.log("chatsApi.getToken: Token retrieved successfully");
    return { token };
  },
};
