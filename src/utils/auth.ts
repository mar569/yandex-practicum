import { storage } from "./storage";

export interface User {
  id: string;
  login: string;
  email: string;
  first_name: string;
  second_name: string;
  display_name: string;
  phone: string;
  password: string;
  avatar?: string;
}

const USERS_KEY = "users";
const SESSION_KEY = "session";

const uid = () => Math.random().toString(36).slice(2, 10);

export const auth = {
  list(): User[] {
    return storage.get<User[]>(USERS_KEY, []);
  },
  saveAll(users: User[]) {
    storage.set(USERS_KEY, users);
  },
  current(): User | null {
    const id = storage.get<string | null>(SESSION_KEY, null);
    if (!id) return null;
    return this.list().find((u) => u.id === id) ?? null;
  },
  register(
    data: Omit<User, "id" | "display_name" | "avatar"> & { display_name?: string },
  ): User {
    const users = this.list();
    if (users.some((u) => u.login === data.login)) {
      throw new Error("Логин уже занят");
    }
    if (users.some((u) => u.email === data.email)) {
      throw new Error("Почта уже зарегистрирована");
    }
    const user: User = {
      ...data,
      display_name: data.display_name || data.first_name,
      id: uid(),
    };
    users.push(user);
    this.saveAll(users);
    storage.set(SESSION_KEY, user.id);
    return user;
  },
  login(login: string, password: string): User {
    const user = this.list().find((u) => u.login === login);
    if (!user) throw new Error("Пользователь не найден");
    if (user.password !== password) throw new Error("Неверный пароль");
    storage.set(SESSION_KEY, user.id);
    return user;
  },
  logout() {
    storage.remove(SESSION_KEY);
  },
  update(patch: Partial<User>): User {
    const cur = this.current();
    if (!cur) throw new Error("Не авторизован");
    const users = this.list().map((u) => (u.id === cur.id ? { ...u, ...patch } : u));
    this.saveAll(users);
    return users.find((u) => u.id === cur.id)!;
  },
  changePassword(oldPwd: string, newPwd: string): void {
    const cur = this.current();
    if (!cur) throw new Error("Не авторизован");
    if (cur.password !== oldPwd) throw new Error("Старый пароль неверен");
    this.update({ password: newPwd });
  },
  findByLogin(login: string): User | undefined {
    return this.list().find((u) => u.login === login);
  },
};
