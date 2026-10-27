import { afterEach, describe, expect, it } from "vitest";
import { globalChatSocket } from "@app/global-chat/global-chat.socket";
import { ListMessagesHandler } from "@app/global-chat/list-messages/list-messages.handler";
import { SendMessageHandler } from "@app/global-chat/send-message/send-message.handler";
import { ListPostsHandler } from "@app/live-posts/list-posts/list-posts.handler";
import { livePostsSocket } from "@app/live-posts/live-posts.socket";
import { PublishPostHandler } from "@app/live-posts/publish-post/publish-post.handler";
import { realtimeRouter } from "@app/realtime/realtime.router";
import { MemoryChatStore } from "@infra/bloc/chat.store";
import { ClientHub } from "@infra/bloc/client.hub";
import { MemoryPostStore } from "@infra/bloc/post.store";
import { serve, until } from "../../support/serve";

const running: Array<() => void> = [];
afterEach(() => running.splice(0).forEach((stop) => stop()));

// The real handlers and stores behind a real server, so the test covers the upgrade and the JSON handling too.
const start = async () => {
  const hub = new ClientHub();
  const clock = { now: () => new Date(2026, 9, 26, 9, 30) };
  let counter = 0;
  const ids = { next: () => `id-${++counter}` };
  const postStore = new MemoryPostStore();
  const chatStore = new MemoryChatStore();
  const postsSocket = livePostsSocket({
    publish: new PublishPostHandler(postStore, ids, clock),
    list: new ListPostsHandler(postStore),
    hub,
  });
  const chatSocket = globalChatSocket({
    send: new SendMessageHandler(chatStore, ids, clock),
    list: new ListMessagesHandler(chatStore),
    hub,
  });
  const app = await serve(() => {});
  realtimeRouter(app.server, postsSocket, chatSocket);
  running.push(app.stop);
  return app;
};

// A browser-like client: every message it gets is kept, parsed.
const connect = async (wsUrl: string) => {
  const ws = new WebSocket(`${wsUrl}/ws`);
  const inbox: any[] = [];
  ws.onmessage = (event) => inbox.push(JSON.parse(String(event.data)));
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("could not connect"));
  });
  running.push(() => ws.close());
  return { ws, inbox, send: (body: unknown) => ws.send(typeof body === "string" ? body : JSON.stringify(body)) };
};

const post = (text: string) => ({ type: "post", name: "Ana", text });
const chat = (text: string) => ({ type: "chat", name: "Ana", text });

describe("realtime router", () => {
  it("greets a new connection with the post history and the chat history", async () => {
    const app = await start();
    const first = await connect(app.wsUrl);
    await until(() => first.inbox.length >= 2);
    first.send(post("Hello"));
    first.send(chat("Hi"));
    await until(() => first.inbox.length >= 4);

    const late = await connect(app.wsUrl);
    await until(() => late.inbox.length >= 2);

    const types = late.inbox.map((message) => message.type).sort();
    expect(types).toEqual(["chat-history", "history"]);
    expect(late.inbox.find((m) => m.type === "history").posts).toHaveLength(1);
    expect(late.inbox.find((m) => m.type === "chat-history").messages).toHaveLength(1);
  });

  it("broadcasts a published post to every client, the sender included", async () => {
    const app = await start();
    const a = await connect(app.wsUrl);
    const b = await connect(app.wsUrl);
    await until(() => a.inbox.length >= 2 && b.inbox.length >= 2);

    a.send(post("Hello everyone"));

    await until(() => [a, b].every((c) => c.inbox.some((m) => m.type === "post")));
    for (const client of [a, b]) {
      const received = client.inbox.find((m) => m.type === "post");
      expect(received.post).toMatchObject({ author: "Ana", content: "Hello everyone", time: "09:30 AM" });
      expect(received.post.id).toEqual(expect.any(String));
    }
  });

  it("routes a chat message to the chat, not to the posts", async () => {
    const app = await start();
    const a = await connect(app.wsUrl);
    const b = await connect(app.wsUrl);
    await until(() => a.inbox.length >= 2 && b.inbox.length >= 2);

    a.send(chat("Hello chat"));

    await until(() => b.inbox.some((m) => m.type === "chat"));
    expect(b.inbox.find((m) => m.type === "chat").message).toMatchObject({ author: "Ana", text: "Hello chat" });
    expect(b.inbox.some((m) => m.type === "post")).toBe(false);
  });

  it("answers an error to the sender of text that is not JSON, keeps the connection and tells nobody else", async () => {
    const app = await start();
    const sender = await connect(app.wsUrl);
    const other = await connect(app.wsUrl);
    await until(() => sender.inbox.length >= 2 && other.inbox.length >= 2);

    sender.send("this is not json");

    await until(() => sender.inbox.some((m) => m.type === "error"));
    expect(sender.inbox.find((m) => m.type === "error")).toEqual({ type: "error", reason: "invalid" });
    expect(sender.ws.readyState).toBe(WebSocket.OPEN);

    sender.send(post("Still here"));
    await until(() => other.inbox.some((m) => m.type === "post"));
    expect(other.inbox.filter((m) => m.type === "error")).toEqual([]);
  });

  it("answers an error for a message the schema rejects", async () => {
    const app = await start();
    const sender = await connect(app.wsUrl);
    await until(() => sender.inbox.length >= 2);

    sender.send({ type: "post", name: "Ana", text: 5 });
    sender.send({ type: "chat" });

    await until(() => sender.inbox.some((m) => m.type === "error") && sender.inbox.some((m) => m.type === "chat-error"));
  });

  it("keeps serving the others after a client leaves", async () => {
    const app = await start();
    const leaving = await connect(app.wsUrl);
    const staying = await connect(app.wsUrl);
    await until(() => leaving.inbox.length >= 2 && staying.inbox.length >= 2);

    leaving.ws.close();
    await until(() => leaving.ws.readyState === WebSocket.CLOSED);
    staying.send(post("Anyone there?"));

    await until(() => staying.inbox.some((m) => m.type === "post"));
  });

  it("refuses a connection to any path other than /ws", async () => {
    const app = await start();
    const ws = new WebSocket(`${app.wsUrl}/nope`);

    const outcome = await new Promise((resolve) => {
      ws.onopen = () => resolve("opened");
      ws.onerror = () => resolve("refused");
    });

    expect(outcome).toBe("refused");
  });
});
