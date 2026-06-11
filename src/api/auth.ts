import { http } from "@/api/http";
import { normalizeUser } from "@/api/adapters";
import type { User } from "@/utils/auth";

export interface SignInPayload {
  login: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  login: string;
  first_name: string;
  second_name: string;
  phone: string;
  password: string;
}

export const authApi = {
  async signIn(data: SignInPayload): Promise<User> {
    // signIn just sets the cookie, returns "OK"
    await http.post<unknown>("/auth/signin", {
      data,
      credentials: true,
    });
    // After successful login, fetch the user data
    return this.getUser();
  },

  async signUp(data: SignUpPayload): Promise<User> {
    // signUp just creates the user and sets cookie, returns "OK"
    await http.post<unknown>("/auth/signup", {
      data,
      credentials: true,
    });
    // After successful registration, fetch the user data
    return this.getUser();
  },

  async getUser(): Promise<User> {
    const response = await http.get<unknown>("/auth/user", {
      credentials: true,
    });
    return normalizeUser(response);
  },

  async logout(): Promise<void> {
    await http.post<void>("/auth/logout", { credentials: true });
  },
};
