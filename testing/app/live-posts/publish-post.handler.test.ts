import { describe, expect, it } from "vitest";
import { PublishPostHandler } from "@app/live-posts/publish-post/publish-post.handler";
import { publishPostInput } from "@app/live-posts/publish-post/publish-post.schema";
import { MemoryPostStore } from "@infra/store/post.memory-store";

const makeHandler = () => {
  const store = new MemoryPostStore();
  let counter = 0;
  const handler = new PublishPostHandler(
    store,
    { next: () => `id-${++counter}` },
    { now: () => new Date(2026, 9, 26, 14, 5) },
  );
  return { handler, store };
};

describe("PublishPostHandler", () => {
  it("builds the post with the server's id and formatted time and stores it", () => {
    const { handler, store } = makeHandler();

    const post = handler.execute({ name: "Ana", text: "Hello" });

    expect(post).toEqual({ id: "id-1", author: "Ana", content: "Hello", time: "02:05 PM" });
    expect(store.list()).toEqual([post]);
  });

  it("gives every stored post a different id", () => {
    const { handler } = makeHandler();

    const ids = [1, 2, 3].map(() => handler.execute({ name: "Ana", text: "Hi" }).id);

    expect(new Set(ids).size).toBe(3);
  });

  it("never takes the id or the time from the client message", () => {
    const { handler } = makeHandler();
    const parsed = publishPostInput.parse({ name: "Ana", text: "Hi", id: "evil", time: "00:00" });

    const post = handler.execute(parsed);

    expect(post.id).toBe("id-1");
    expect(post.time).toBe("02:05 PM");
  });
});
