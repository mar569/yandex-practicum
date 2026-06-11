import { describe, it, expect, beforeEach } from "vitest";
import { auth } from "./auth";

const sample = {
  login: "ivan_99",
  email: "ivan@test.io",
  first_name: "Иван",
  second_name: "Иванов",
  phone: "+79991234567",
  password: "Password1",
};

beforeEach(() => localStorage.clear());

describe("auth", () => {
  it("регистрирует и авторизует пользователя", async () => {
    const u = await auth.register(sample);
    expect(u.id).toBeTruthy();
    expect(auth.current()?.login).toBe("ivan_99");
  });

  it("не позволяет зарегистрировать дубль логина", async () => {
    await auth.register(sample);
    await auth.logout();
    await expect(auth.register({ ...sample, email: "x@y.z" })).rejects.toThrow(
      /Логин/,
    );
  });

  it("логинит существующего пользователя", async () => {
    await auth.register(sample);
    await auth.logout();
    const u = await auth.login("ivan_99", "Password1");
    expect(u.login).toBe("ivan_99");
  });

  it("ошибается при неверном пароле", async () => {
    await auth.register(sample);
    await auth.logout();
    await expect(auth.login("ivan_99", "wrong")).rejects.toThrow(/пароль/i);
  });

  it("обновляет данные профиля", async () => {
    await auth.register(sample);
    const u = await auth.update({ display_name: "Vanya" });
    expect(u.display_name).toBe("Vanya");
  });

  it("меняет пароль", async () => {
    await auth.register(sample);
    await auth.changePassword("Password1", "Newpass2");
    expect(auth.current()?.password).toBe("Newpass2");
  });

  it("logout сбрасывает сессию", async () => {
    await auth.register(sample);
    await auth.logout();
    expect(auth.current()).toBeNull();
  });
});
