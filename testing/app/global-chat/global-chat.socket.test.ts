import { describe, expect, it } from "vitest";
import { globalChatSocket } from "@app/global-chat/global-chat.socket";
import { ListMessagesHandler } from "@app/global-chat/list-messages/list-messages.handler";
import { SendMessageHandler } from "@app/global-chat/send-message/send-message.handler";
import { MAX_CHAT_TEXT } from "@app/global-chat/send-message/send-message.schema";
import { ListPostsHandler } from "@app/live-posts/list-posts/list-posts.handler";
import { livePostsSocket, type SocketClient } from "@app/live-posts/live-posts.socket";
import { PublishPostHandler } from "@app/live-posts/publish-post/publish-post.handler";
import { ClientHub } from "@infra/bloc/client.hub";
import { SlidingWindowLimiter } from "@infra/bloc/rate-limiter";
import { MemoryChatStore } from "@infra/store/chat.memory-store";
import { MemoryPostStore } from "@infra/store/post.memory-store";

// A connection that records every text sent to it.
const makeClient = (id: string): SocketClient & { received: any[] } => {
  const received: any[] = [];
  return { id, received, send: (text) => void received.push(JSON.parse(text)) };
};

const makeChat = (options: { max?: number; limit?: number } = {}) => {
  const chatStore = new MemoryChatStore(options.max);
  const postStore = new MemoryPostStore();
  const hub = new ClientHub();
  let chatCounter = 0;
  let postCounter = 0;
  const clock = { now: () => new Date(2026, 9, 26, 9, 30) };
  const chat = globalChatSocket({
    send: new SendMessageHandler(chatStore, { next: () => `m-${++chatCounter}` }, clock),
    list: new ListMessagesHandler(chatStore),
    limiter: new SlidingWindowLimiter(options.limit ?? 1000, 10_000),
    hub,
  });
  const posts = livePostsSocket({
    publish: new PublishPostHandler(postStore, { next: () => `p-${++postCounter}` }, clock),
    list: new ListPostsHandler(postStore),
    limiter: new SlidingWindowLimiter(1000, 10_000),
    hub,
  });
  // The endpoint registers the connection in the hub, then both sockets greet it.
  const connect = (client: SocketClient) => {
    posts.open(client);
    chat.open(client);
  };
  return { chat, posts, connect, chatStore, postStore };
};

const msg = (text: string, extra: object = {}) => ({ type: "chat", name: "Ana", text, ...extra });
const stored = { id: "m-1", author: "Ana", text: "Hello", time: "09:30 AM" };

describe("globalChatSocket", () => {
  it("broadcasts a valid message to every client, the sender included", () => {
    const { chat, connect, chatStore } = makeChat();
    const a = makeClient("a");
    const b = makeClient("b");
    connect(a);
    connect(b);

    chat.message(a, msg("Hello"));

    const expected = { type: "chat", message: stored };
    expect(a.received.at(-1)).toEqual(expected);
    expect(b.received.at(-1)).toEqual(expected);
    expect(chatStore.list()).toEqual([stored]);
  });

  it("sends the stored messages to a client that connects afterwards", () => {
    const { chat, connect } = makeChat();
    const a = makeClient("a");
    connect(a);
    chat.message(a, msg("Hello"));

    const late = makeClient("late");
    connect(late);

    expect(late.received).toContainEqual({ type: "chat-history", messages: [stored] });
  });

  it("uses the server's id and time when the message carries its own", () => {
    const { chat, connect } = makeChat();
    const a = makeClient("a");
    connect(a);

    chat.message(a, msg("Hello", { id: "evil", time: "00:00" }));

    expect(a.received.at(-1).message).toMatchObject({ id: "m-1", time: "09:30 AM" });
  });

  it("gives every stored message a different id", () => {
    const { chat, connect, chatStore } = makeChat();
    const a = makeClient("a");
    connect(a);

    chat.message(a, msg("one"));
    chat.message(a, msg("two"));

    const ids = chatStore.list().map((m) => m.id);
    expect(new Set(ids).size).toBe(2);
  });

  it.each([
    ["an unparseable text", "not an object"],
    ["a wrong type", { type: "post", name: "Ana", text: "Hi" }],
    ["a missing field", { type: "chat", name: "Ana" }],
    ["a name that is not a string", { type: "chat", name: 5, text: "Hi" }],
    ["an empty name after trimming", { type: "chat", name: "   ", text: "Hi" }],
    ["an empty text", msg("")],
    ["a text of only spaces", msg("   ")],
    ["a name over the maximum", { type: "chat", name: "n".repeat(31), text: "Hi" }],
    ["a text one character over the maximum", msg("x".repeat(MAX_CHAT_TEXT + 1))],
  ])("rejects %s: error to the sender only, nothing stored or broadcast", (_, data) => {
    const { chat, connect, chatStore } = makeChat();
    const sender = makeClient("a");
    const other = makeClient("b");
    connect(sender);
    connect(other);
    const before = other.received.length;

    chat.message(sender, data);

    expect(sender.received.at(-1)).toEqual({ type: "chat-error", reason: "invalid" });
    expect(other.received).toHaveLength(before);
    expect(chatStore.list()).toHaveLength(0);
  });

  it("accepts a text exactly at the maximum, trimmed", () => {
    const { chat, connect } = makeChat();
    const a = makeClient("a");
    connect(a);

    chat.message(a, msg(`  ${"x".repeat(MAX_CHAT_TEXT)}  `));

    expect(a.received.at(-1).message.text).toBe("x".repeat(MAX_CHAT_TEXT));
  });

  it("keeps only the most recent messages and drops the oldest", () => {
    const { chat, connect, chatStore } = makeChat({ max: 3 });
    const a = makeClient("a");
    connect(a);

    ["1", "2", "3", "4"].forEach((text) => chat.message(a, msg(text)));

    expect(chatStore.list().map((m) => m.text)).toEqual(["2", "3", "4"]);
  });

  it("rejects a message over the rate limit and leaves the other clients unaffected", () => {
    const { chat, connect, chatStore } = makeChat({ limit: 2 });
    const fast = makeClient("fast");
    const other = makeClient("other");
    connect(fast);
    connect(other);
    chat.message(fast, msg("one"));
    chat.message(fast, msg("two"));
    const before = other.received.length;

    chat.message(fast, msg("three"));

    expect(fast.received.at(-1)).toEqual({ type: "chat-error", reason: "rate_limited" });
    expect(other.received).toHaveLength(before);
    expect(chatStore.list()).toHaveLength(2);

    chat.message(other, msg("mine"));
    expect(other.received.at(-1).type).toBe("chat");
  });

  it("keeps the broadcast working after a client sends a malformed message", () => {
    const { chat, connect } = makeChat();
    const bad = makeClient("bad");
    const good = makeClient("good");
    connect(bad);
    connect(good);

    chat.message(bad, { nonsense: true });
    chat.message(good, msg("still works"));

    expect(bad.received.at(-1).message.text).toBe("still works");
    expect(good.received.at(-1).message.text).toBe("still works");
  });

  it("keeps chat and posts apart in both directions", () => {
    const { chat, posts, connect, chatStore, postStore } = makeChat();
    const a = makeClient("a");
    connect(a);

    chat.message(a, msg("a chat message"));
    expect(postStore.list()).toHaveLength(0);

    posts.message(a, { type: "post", name: "Ana", text: "a post" });
    expect(chatStore.list()).toHaveLength(1);
    expect(postStore.list()).toHaveLength(1);
  });

  it("counts chat messages apart from posts in the rate limits", () => {
    const { chat, posts, connect } = makeChat({ limit: 1 });
    const a = makeClient("a");
    connect(a);
    chat.message(a, msg("one"));

    // The chat allowance is used up, but the posts limiter (a separate one) still lets a post through.
    posts.message(a, { type: "post", name: "Ana", text: "a post" });
    chat.message(a, msg("two"));

    expect(a.received.some((m) => m.type === "post")).toBe(true);
    expect(a.received.at(-1)).toEqual({ type: "chat-error", reason: "rate_limited" });
  });
});
