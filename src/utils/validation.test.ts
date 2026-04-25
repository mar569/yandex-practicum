import { describe, it, expect } from "vitest";
import { validators, validateForm } from "./validation";

describe("validators.login", () => {
  it("отклоняет пустое значение", () => expect(validators.login("")).toMatch(/Введите/));
  it("отклоняет короткий логин", () => expect(validators.login("ab")).toBeTruthy());
  it("отклоняет только цифры", () => expect(validators.login("12345")).toBeTruthy());
  it("отклоняет пробелы", () => expect(validators.login("hi there")).toBeTruthy());
  it("принимает валидный", () => expect(validators.login("ivan_99")).toBeNull());
});

describe("validators.password", () => {
  it("требует длину 8+", () => expect(validators.password("Aa1")).toBeTruthy());
  it("требует заглавную", () => expect(validators.password("password1")).toBeTruthy());
  it("требует цифру", () => expect(validators.password("Password")).toBeTruthy());
  it("принимает валидный", () => expect(validators.password("Password1")).toBeNull());
});

describe("validators.email", () => {
  it("отклоняет без @", () => expect(validators.email("foo")).toBeTruthy());
  it("принимает корректный", () => expect(validators.email("a@b.co")).toBeNull());
});

describe("validators.name", () => {
  it("требует заглавную", () => expect(validators.name("иван")).toBeTruthy());
  it("отклоняет цифры", () => expect(validators.name("Ivan1")).toBeTruthy());
  it("принимает русское имя", () => expect(validators.name("Иван")).toBeNull());
  it("принимает имя с дефисом", () => expect(validators.name("Анна-Мария")).toBeNull());
});

describe("validators.phone", () => {
  it("отклоняет короткий", () => expect(validators.phone("123")).toBeTruthy());
  it("принимает с +", () => expect(validators.phone("+79991234567")).toBeNull());
});

describe("validators.message", () => {
  it("отклоняет пустое", () => expect(validators.message("   ")).toBeTruthy());
  it("принимает текст", () => expect(validators.message("hi")).toBeNull());
});

describe("validateForm", () => {
  it("возвращает ошибки только по схеме", () => {
    const errs = validateForm(
      { login: "", password: "Password1" },
      { login: validators.login, password: validators.password },
    );
    expect(errs).toHaveProperty("login");
    expect(errs).not.toHaveProperty("password");
  });
});
