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
  it("регистрирует и авторизует пользователя", () => {
    const u = auth.register(sample);
    expect(u.id).toBeTruthy();
    expect(auth.current()?.login).toBe("ivan_99");
  });

  it("не позволяет зарегистрировать дубль логина", () => {
    auth.register(sample);
    auth.logout();
    expect(() => auth.register({ ...sample, email: "x@y.z" })).toThrow(/Логин/);
  });

  it("логинит существующего пользователя", () => {
    auth.register(sample);
    auth.logout();
    const u = auth.login("ivan_99", "Password1");
    expect(u.login).toBe("ivan_99");
  });

  it("ошибается при неверном пароле", () => {
    auth.register(sample);
    auth.logout();
    expect(() => auth.login("ivan_99", "wrong")).toThrow(/пароль/i);
  });

  it("обновляет данные профиля", () => {
    auth.register(sample);
    const u = auth.update({ display_name: "Vanya" });
    expect(u.display_name).toBe("Vanya");
  });

  it("меняет пароль", () => {
    auth.register(sample);
    auth.changePassword("Password1", "Newpass2");
    expect(auth.current()?.password).toBe("Newpass2");
  });

  it("logout сбрасывает сессию", () => {
    auth.register(sample);
    auth.logout();
    expect(auth.current()).toBeNull();
  });
});
