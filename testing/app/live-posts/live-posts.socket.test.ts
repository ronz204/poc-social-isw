import { describe, expect, it } from "vitest";
import { ListPostsHandler } from "@app/live-posts/list-posts/list-posts.handler";
import { livePostsSocket, type SocketClient } from "@app/live-posts/live-posts.socket";
import { PublishPostHandler } from "@app/live-posts/publish-post/publish-post.handler";
import { MAX_TEXT } from "@app/live-posts/publish-post/publish-post.schema";
import { ClientHub } from "@infra/bloc/client.hub";
import { SlidingWindowLimiter } from "@infra/bloc/rate-limiter";
import { MemoryPostStore } from "@infra/store/post.memory-store";

// A connection that records every text sent to it.
const makeClient = (id: string, failing = false): SocketClient & { received: any[] } => {
  const received: any[] = [];
  return {
    id,
    received,
    send: (text) => {
      if (failing) throw new Error("closed");
      received.push(JSON.parse(text));
    },
  };
};

const makeSocket = (options: { max?: number; limit?: number } = {}) => {
  const store = new MemoryPostStore(options.max);
  let counter = 0;
  const socket = livePostsSocket({
    publish: new PublishPostHandler(store, { next: () => `id-${++counter}` }, { now: () => new Date(2026, 9, 26, 9, 30) }),
    list: new ListPostsHandler(store),
    limiter: new SlidingWindowLimiter(options.limit ?? 1000, 10_000),
    hub: new ClientHub(),
  });
  return { socket, store };
};

const post = (text: string, extra: object = {}) => ({ type: "post", name: "Ana", text, ...extra });

describe("livePostsSocket", () => {
  it("sends the stored posts to a client that connects", () => {
    const { socket } = makeSocket();
    const first = makeClient("a");
    socket.open(first);
    socket.message(first, post("Hello"));

    const third = makeClient("c");
    socket.open(third);

    expect(third.received[0]).toEqual({
      type: "history",
      posts: [{ id: "id-1", author: "Ana", content: "Hello", time: "09:30 AM" }],
    });
  });

  it("broadcasts a valid post to every client, the sender included", () => {
    const { socket, store } = makeSocket();
    const a = makeClient("a");
    const b = makeClient("b");
    socket.open(a);
    socket.open(b);

    socket.message(a, post("Hello"));

    const expected = { type: "post", post: { id: "id-1", author: "Ana", content: "Hello", time: "09:30 AM" } };
    expect(a.received.at(-1)).toEqual(expected);
    expect(b.received.at(-1)).toEqual(expected);
    expect(store.list()).toHaveLength(1);
  });

  it("uses the server's id and time when the message carries its own", () => {
    const { socket } = makeSocket();
    const a = makeClient("a");
    socket.open(a);

    socket.message(a, post("Hello", { id: "evil", time: "00:00" }));

    expect(a.received.at(-1).post).toMatchObject({ id: "id-1", time: "09:30 AM" });
  });

  it.each([
    ["an unparseable text", "not an object"],
    ["a wrong type", { type: "chat", name: "Ana", text: "Hi" }],
    ["a missing field", { type: "post", name: "Ana" }],
    ["a name that is not a string", { type: "post", name: 5, text: "Hi" }],
    ["an empty name after trimming", { type: "post", name: "   ", text: "Hi" }],
    ["an empty text", post("")],
    ["a text of only spaces", post("   ")],
    ["a name over the maximum", { type: "post", name: "n".repeat(31), text: "Hi" }],
    ["a text one character over the maximum", post("x".repeat(MAX_TEXT + 1))],
  ])("rejects %s: error to the sender only, nothing stored or broadcast", (_, data) => {
    const { socket, store } = makeSocket();
    const sender = makeClient("a");
    const other = makeClient("b");
    socket.open(sender);
    socket.open(other);
    const before = other.received.length;

    socket.message(sender, data);

    expect(sender.received.at(-1)).toEqual({ type: "error", reason: "invalid" });
    expect(other.received).toHaveLength(before);
    expect(store.list()).toHaveLength(0);
  });

  it("accepts a text exactly at the maximum, trimmed", () => {
    const { socket } = makeSocket();
    const a = makeClient("a");
    socket.open(a);

    socket.message(a, post(`  ${"x".repeat(MAX_TEXT)}  `));

    expect(a.received.at(-1).post.content).toBe("x".repeat(MAX_TEXT));
  });

  it("rejects a publish over the rate limit and leaves the other clients unaffected", () => {
    const { socket, store } = makeSocket({ limit: 2 });
    const fast = makeClient("fast");
    const other = makeClient("other");
    socket.open(fast);
    socket.open(other);
    socket.message(fast, post("one"));
    socket.message(fast, post("two"));
    const before = other.received.length;

    socket.message(fast, post("three"));

    expect(fast.received.at(-1)).toEqual({ type: "error", reason: "rate_limited" });
    expect(other.received).toHaveLength(before);
    expect(store.list()).toHaveLength(2);

    socket.message(other, post("mine"));
    expect(other.received.at(-1).type).toBe("post");
  });

  it("keeps the broadcast working when one client's connection fails", () => {
    const { socket } = makeSocket();
    const broken = makeClient("broken");
    const good = makeClient("good");
    socket.open(broken);
    socket.open(good);
    broken.send = () => {
      throw new Error("closed");
    };

    socket.message(good, { nonsense: true });
    socket.message(good, post("still works"));

    expect(good.received.at(-1).post.content).toBe("still works");
  });

  it("stops sending to a client that closed", () => {
    const { socket } = makeSocket();
    const a = makeClient("a");
    const b = makeClient("b");
    socket.open(a);
    socket.open(b);
    socket.close(b);
    const before = b.received.length;

    socket.message(a, post("Hi"));

    expect(b.received).toHaveLength(before);
  });
});
