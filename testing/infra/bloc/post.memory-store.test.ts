import { describe, expect, it } from "vitest";
import { HISTORY_SIZE, MemoryPostStore } from "@infra/bloc/post.memory-store";

const post = (n: number) => ({ id: `id-${n}`, author: "Ana", content: `Post ${n}`, time: "09:30 AM" });

describe("MemoryPostStore", () => {
  it("lists the posts oldest first", () => {
    const store = new MemoryPostStore();
    store.add(post(1));
    store.add(post(2));

    expect(store.list().map((p) => p.id)).toEqual(["id-1", "id-2"]);
  });

  it("drops the oldest post once the history is full", () => {
    const store = new MemoryPostStore();
    for (let n = 1; n <= HISTORY_SIZE; n++) store.add(post(n));

    store.add(post(HISTORY_SIZE + 1));

    expect(store.list()).toHaveLength(HISTORY_SIZE);
    expect(store.list()[0]?.id).toBe("id-2");
    expect(store.list().at(-1)?.id).toBe(`id-${HISTORY_SIZE + 1}`);
  });
});
