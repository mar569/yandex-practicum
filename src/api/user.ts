import { http } from "@/api/http";
import { normalizeUser, normalizeUsers } from "@/api/adapters";
import type { User } from "@/utils/auth";

export interface UpdateProfilePayload {
  email?: string;
  login?: string;
  first_name?: string;
  second_name?: string;
  display_name?: string;
  phone?: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const userApi = {
  async updateProfile(data: UpdateProfilePayload): Promise<User> {
    const payload = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== undefined && value !== null,
      ),
    );
    const response = await http.put<unknown>("/user/profile", {
      data: payload,
      credentials: true,
    });
    return normalizeUser(response);
  },

  async updateAvatar(data: FormData): Promise<User> {
    const response = await http.put<unknown>("/user/profile/avatar", {
      data,
      credentials: true,
    });
    return normalizeUser(response);
  },

  async updatePassword(data: UpdatePasswordPayload): Promise<void> {
    await http.put<void>("/user/password", {
      data: {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
      credentials: true,
    });
  },

  async search(login: string): Promise<User[]> {
    const response = await http.post<unknown>("/user/search", {
      data: { login },
      credentials: true,
    });
    return normalizeUsers(response);
  },
};
