import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createConnection, reconnectDelay } from "@infra/client/connection";

// Just what the connection uses of a WebSocket; the test drives its events by hand.
class FakeSocket {
  static all: FakeSocket[] = [];
  sent: string[] = [];
  private listeners = new Map<string, Array<(event: any) => void>>();
  constructor(readonly url: string) {
    FakeSocket.all.push(this);
  }
  addEventListener(type: string, listener: (event: any) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  send(text: string) {
    this.sent.push(text);
  }
  emit(type: string, event: object = {}) {
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }
}

const connect = () => createConnection("ws://localhost/ws", FakeSocket as unknown as typeof WebSocket);
const latest = () => FakeSocket.all[FakeSocket.all.length - 1]!;

beforeEach(() => {
  FakeSocket.all = [];
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("reconnectDelay", () => {
  it("grows with each attempt and stops at the cap", () => {
    expect([0, 1, 2, 3, 4, 5].map(reconnectDelay)).toEqual([1000, 2000, 4000, 8000, 10000, 10000]);
  });
});

describe("connection", () => {
  it("opens one socket per page at the given address", () => {
    connect();

    expect(FakeSocket.all).toHaveLength(1);
    expect(latest().url).toBe("ws://localhost/ws");
  });

  it("retries with a growing wait after an unexpected close, until it reconnects", () => {
    connect();

    latest().emit("close");
    vi.advanceTimersByTime(999);
    expect(FakeSocket.all).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(FakeSocket.all).toHaveLength(2);

    // The second attempt fails too: it waits longer.
    latest().emit("close");
    vi.advanceTimersByTime(1999);
    expect(FakeSocket.all).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeSocket.all).toHaveLength(3);

    // Once open again, the wait starts over.
    latest().emit("open");
    latest().emit("close");
    vi.advanceTimersByTime(1000);
    expect(FakeSocket.all).toHaveLength(4);
  });

  it("tells its listeners about each close and each reopening", () => {
    const connection = connect();
    const opened = vi.fn();
    const closed = vi.fn();
    connection.onOpen(opened);
    connection.onClose(closed);

    latest().emit("open");
    latest().emit("close");
    vi.advanceTimersByTime(1000);
    latest().emit("open");

    expect(opened).toHaveBeenCalledTimes(2);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("routes each message to exactly one of the posts or the chat listener", () => {
    const connection = connect();
    const posts = vi.fn();
    const chat = vi.fn();
    connection.onPosts(posts);
    connection.onChat(chat);

    for (const type of ["history", "post", "error"]) latest().emit("message", { data: JSON.stringify({ type }) });
    for (const type of ["chat-history", "chat", "chat-error"]) latest().emit("message", { data: JSON.stringify({ type }) });

    expect(posts.mock.calls.map(([data]) => data.type)).toEqual(["history", "post", "error"]);
    expect(chat.mock.calls.map(([data]) => data.type)).toEqual(["chat-history", "chat", "chat-error"]);
  });

  it("ignores a message of unknown type, or one that is not JSON, without an error", () => {
    const connection = connect();
    const posts = vi.fn();
    const chat = vi.fn();
    connection.onPosts(posts);
    connection.onChat(chat);

    expect(() => {
      latest().emit("message", { data: JSON.stringify({ type: "mystery" }) });
      latest().emit("message", { data: "not json" });
      latest().emit("message", { data: "null" });
    }).not.toThrow();
    expect(posts).not.toHaveBeenCalled();
    expect(chat).not.toHaveBeenCalled();
  });

  it("sends through the current socket, also after a reconnect", () => {
    const connection = connect();
    latest().emit("close");
    vi.advanceTimersByTime(1000);

    connection.send("hello");

    expect(latest().sent).toEqual(["hello"]);
    expect(FakeSocket.all[0]!.sent).toEqual([]);
  });
});
