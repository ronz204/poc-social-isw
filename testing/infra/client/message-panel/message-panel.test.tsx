// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Html } from "@elysia/html";
import { Chat } from "@infra/views/components/chat.component";
import { Header } from "@infra/views/components/header.component";
import { LivePosts } from "@infra/views/components/live-posts.component";

// The scripts talk to the page only through this connection, so the test plays the server.
type Listener = (data: any) => void;
const listeners: Record<string, Listener[]> = {};
const send = vi.fn();
const fakeConnection = {
  send,
  onOpen: (listener: Listener) => (listeners.open = [...(listeners.open ?? []), listener]),
  onClose: (listener: Listener) => (listeners.close = [...(listeners.close ?? []), listener]),
  onPosts: (listener: Listener) => (listeners.posts = [...(listeners.posts ?? []), listener]),
  onChat: (listener: Listener) => (listeners.chat = [...(listeners.chat ?? []), listener]),
};
vi.mock("@infra/client/page-shell/socket", () => ({ connection: fakeConnection }));

const emit = (kind: string, data?: unknown) => listeners[kind]?.forEach((listener) => listener(data));
const value = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
const type = (id: string, text: string) => ((document.getElementById(id) as HTMLInputElement).value = text);
const setName = (text: string) => {
  type("visitor-name", text);
  document.getElementById("visitor-name")!.dispatchEvent(new Event("input", { bubbles: true }));
};
const submit = (id: string) => (document.getElementById(id) as HTMLFormElement).requestSubmit();
const texts = (id: string) => Array.from(document.querySelectorAll(`#${id} > *`)).map((item) => item.textContent);

beforeEach(async () => {
  for (const key of Object.keys(listeners)) delete listeners[key];
  send.mockClear();
  localStorage.clear();
  vi.resetModules();
  document.body.innerHTML = await (
    <div>
      <Header connection />
      <LivePosts />
      <Chat />
    </div>
  );
  await import("@infra/client/live-posts/live-posts");
  await import("@infra/client/global-chat/global-chat");
  emit("open");
  setName("Ana");
});

describe("sending from a form", () => {
  it("sends its own message type with the header name and the text, then clears only the text", () => {
    type("live-text", "hello");
    submit("live-form");

    expect(send).toHaveBeenCalledWith(JSON.stringify({ type: "post", name: "Ana", text: "hello" }));
    expect(value("live-text")).toBe("");
    expect(value("visitor-name")).toBe("Ana");

    type("chat-text", "hi");
    submit("chat-form");

    expect(send).toHaveBeenLastCalledWith(JSON.stringify({ type: "chat", name: "Ana", text: "hi" }));
  });

  it("sends the name as it is when the visitor changes it, and the trimmed form of it", () => {
    setName("  Luis  ");
    type("chat-text", "hi");
    submit("chat-form");

    expect(send).toHaveBeenCalledWith(JSON.stringify({ type: "chat", name: "Luis", text: "hi" }));
  });
});

describe("a rejected message", () => {
  it("shows the wording of its own panel, and the next send clears it", () => {
    emit("posts", { type: "error", reason: "invalid" });
    emit("chat", { type: "chat-error", reason: "invalid" });

    expect(document.getElementById("live-error")!.textContent).toContain("280 characters");
    expect(document.getElementById("chat-error")!.textContent).toContain("200 characters");

    type("live-text", "ok");
    submit("live-form");

    expect(document.getElementById("live-error")!.textContent).toBe("");
    expect(document.getElementById("chat-error")!.textContent).toContain("200 characters");
  });
});

describe("the order of each list", () => {
  const item = (id: string) => ({ id, author: "Ana", content: `item ${id}`, text: `item ${id}`, time: "09:30 AM" });

  it("puts the newest live post on top and the newest chat message at the bottom", () => {
    emit("posts", { type: "history", posts: [item("1"), item("2")] });
    emit("chat", { type: "chat-history", messages: [item("1"), item("2")] });

    expect(texts("live-list").join("|")).toMatch(/item 2.*\|.*item 1/);
    expect(texts("chat-list").join("|")).toMatch(/item 1.*\|.*item 2/);

    emit("posts", { type: "post", post: item("3") });
    emit("chat", { type: "chat", message: item("3") });

    expect(texts("live-list")[0]).toContain("item 3");
    expect(texts("chat-list")[2]).toContain("item 3");
  });
});
