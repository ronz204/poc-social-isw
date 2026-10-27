// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Html } from "@elysia/html";
import { Chat } from "@infra/views/components/chat.component";
import { LivePosts } from "@infra/views/components/live-posts.component";

// The scripts talk to the page only through this connection, so the test plays the server.
type Listener = (data: any) => void;
const listeners: Record<string, Listener[]> = {};
const fakeConnection = {
  send: vi.fn(),
  onOpen: (listener: Listener) => (listeners.open = [...(listeners.open ?? []), listener]),
  onClose: (listener: Listener) => (listeners.close = [...(listeners.close ?? []), listener]),
  onPosts: (listener: Listener) => (listeners.posts = [...(listeners.posts ?? []), listener]),
  onChat: (listener: Listener) => (listeners.chat = [...(listeners.chat ?? []), listener]),
};
vi.mock("@infra/client/page-shell/socket", () => ({ connection: fakeConnection }));

const emit = (kind: string, data?: unknown) => listeners[kind]?.forEach((listener) => listener(data));
const post = (id: string) => ({ id, author: "Ana", content: `post ${id}`, time: "09:30 AM" });
const message = (id: string) => ({ id, author: "Ana", text: `message ${id}`, time: "09:30 AM" });

beforeEach(async () => {
  for (const key of Object.keys(listeners)) delete listeners[key];
  vi.resetModules();
  document.body.innerHTML = await (
    <div>
      <LivePosts />
      <Chat />
    </div>
  );
  await import("@infra/client/live-posts/live-posts");
  await import("@infra/client/global-chat/global-chat");
});

describe("history after a reconnect", () => {
  it("replaces the live posts instead of showing them twice", () => {
    emit("posts", { type: "history", posts: [post("1"), post("2")] });
    emit("posts", { type: "history", posts: [post("1"), post("2")] });

    expect(document.querySelectorAll("#live-list > *")).toHaveLength(2);
  });

  it("replaces the chat messages instead of showing them twice", () => {
    emit("chat", { type: "chat-history", messages: [message("1"), message("2")] });
    emit("chat", { type: "chat-history", messages: [message("1"), message("2")] });

    expect(document.querySelectorAll("#chat-list > *")).toHaveLength(2);
  });

  it("brings the empty notes back when the re-sent history is empty", () => {
    emit("posts", { type: "history", posts: [post("1")] });
    emit("chat", { type: "chat-history", messages: [message("1")] });
    expect(document.querySelector<HTMLElement>("#live-empty")!.hidden).toBe(true);
    expect(document.querySelector<HTMLElement>("#chat-empty")!.hidden).toBe(true);

    emit("posts", { type: "history", posts: [] });
    emit("chat", { type: "chat-history", messages: [] });

    expect(document.querySelector<HTMLElement>("#live-empty")!.hidden).toBe(false);
    expect(document.querySelector<HTMLElement>("#chat-empty")!.hidden).toBe(false);
    expect(document.querySelectorAll("#live-list > *, #chat-list > *")).toHaveLength(0);
  });
});

describe("forms follow the connection", () => {
  it("disables both forms while closed and enables them once open", () => {
    const controls = () => Array.from(document.querySelectorAll<HTMLInputElement | HTMLButtonElement>("form input, form button"));
    expect(controls().every((control) => control.disabled)).toBe(true);

    emit("open");
    expect(controls().every((control) => !control.disabled)).toBe(true);

    emit("close");
    expect(controls().every((control) => control.disabled)).toBe(true);
  });
});
