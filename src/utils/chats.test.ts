import { describe, it, expect, beforeEach } from "vitest";
import { auth } from "./auth";
import { chats } from "./chats";

const userA = {
  login: "alice",
  email: "a@a.io",
  first_name: "Алиса",
  second_name: "Аа",
  phone: "+79990001100",
  password: "Password1",
};
const userB = {
  login: "bob",
  email: "b@b.io",
  first_name: "Боб",
  second_name: "Бб",
  phone: "+79990001101",
  password: "Password1",
};

beforeEach(() => {
  localStorage.clear();
  auth.register(userA);
  auth.logout();
  auth.register(userB);
  auth.logout();
  auth.login("alice", "Password1");
});

describe("chats", () => {
  it("создаёт чат", () => {
    const c = chats.create("Test");
    expect(c.title).toBe("Test");
    expect(chats.forCurrent()).toHaveLength(1);
  });

  it("находит чат по названию", () => {
    chats.create("Friends");
    chats.create("Work");
    expect(chats.search("fri")).toHaveLength(1);
  });

  it("отправляет сообщение", () => {
    const c = chats.create("Test");
    chats.sendMessage(c.id, "hello");
    expect(chats.get(c.id)?.messages[0].text).toBe("hello");
  });

  it("ищет по тексту сообщений", () => {
    const c = chats.create("Test");
    chats.sendMessage(c.id, "уникальное_слово");
    expect(chats.search("уникальное")).toHaveLength(1);
  });

  it("добавляет и удаляет участников", () => {
    const c = chats.create("Test");
    chats.addMember(c.id, "bob");
    expect(chats.get(c.id)?.memberIds).toHaveLength(2);
    chats.removeMember(c.id, "bob");
    expect(chats.get(c.id)?.memberIds).toHaveLength(1);
  });

  it("не добавляет несуществующего", () => {
    const c = chats.create("Test");
    expect(() => chats.addMember(c.id, "ghost")).toThrow();
  });

  it("устанавливает аватар чата", () => {
    const c = chats.create("Test");
    chats.setAvatar(c.id, "data:image/png;base64,xxx");
    expect(chats.get(c.id)?.avatar).toContain("data:");
  });

  it("удаляет чат только владельцем", () => {
    const c = chats.create("Test");
    chats.remove(c.id);
    expect(chats.get(c.id)).toBeUndefined();
  });

  it("чужой не видит чат", () => {
    chats.create("Mine");
    auth.logout();
    auth.login("bob", "Password1");
    expect(chats.forCurrent()).toHaveLength(0);
  });
});
