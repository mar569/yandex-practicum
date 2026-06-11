import { authApi, type SignUpPayload } from "@/api/auth";
import { userApi } from "@/api/user";
import { store } from "@/core/Store";

export interface User {
  id: string;
  login: string;
  email: string;
  first_name: string;
  second_name: string;
  display_name: string;
  phone: string;
  avatar?: string;
  password?: string;
}

export const auth = {
  current(): User | null {
    return store.getState().user;
  },

  async check(): Promise<User | null> {
    try {
      const user = await authApi.getUser();
      store.setState({ user });
      // Save to localStorage as backup
      localStorage.setItem('chat_app:user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error(
        "Auth check failed:",
        error instanceof Error ? error.message : String(error),
      );
      // Try to restore from localStorage
      try {
        const cachedRaw = localStorage.getItem('chat_app:user');
        if (cachedRaw) {
          const cachedUser = JSON.parse(cachedRaw) as User;
          console.log('Restored user from localStorage');
          store.setState({ user: cachedUser });
          return cachedUser;
        }
      } catch {
        // Ignore parse errors
      }
      store.setState({ user: null });
      return null;
    }
  },

  async login(login: string, password: string): Promise<User> {
    try {
      const user = await authApi.signIn({ login, password });
      store.setState({ user });
      // Save to localStorage
      localStorage.setItem('chat_app:user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error(
        "Login failed:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async register(data: SignUpPayload): Promise<User> {
    try {
      const user = await authApi.signUp(data);
      store.setState({ user });
      // Save to localStorage
      localStorage.setItem('chat_app:user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error(
        "Registration failed:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout();
      store.setState({ user: null });
      // Clear localStorage
      localStorage.removeItem('chat_app:user');
    } catch (error) {
      console.error(
        "Logout failed:",
        error instanceof Error ? error.message : String(error),
      );
      // Still clear local state even if logout fails
      store.setState({ user: null });
      localStorage.removeItem('chat_app:user');
    }
  },

  async update(patch: Partial<User>): Promise<User> {
    try {
      const payload: Partial<User> = {};
      if (patch.email !== undefined) payload.email = patch.email;
      if (patch.login !== undefined) payload.login = patch.login;
      if (patch.first_name !== undefined) payload.first_name = patch.first_name;
      if (patch.second_name !== undefined)
        payload.second_name = patch.second_name;
      if (patch.display_name !== undefined)
        payload.display_name = patch.display_name;
      if (patch.phone !== undefined) payload.phone = patch.phone;

      const user = await userApi.updateProfile(payload);
      store.setState({ user });
      return user;
    } catch (error) {
      console.error(
        "Profile update failed:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await userApi.updatePassword({ oldPassword, newPassword });
    } catch (error) {
      console.error(
        "Password change failed:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },
};
