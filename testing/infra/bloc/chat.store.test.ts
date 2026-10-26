import { describe, expect, it } from "vitest";
import { MemoryChatStore } from "@infra/bloc/chat.store";

const message = (id: string) => ({ id, author: "Ana", text: id, time: "09:30 AM" });

describe("MemoryChatStore", () => {
  it("drops the oldest message when it is full", () => {
    const store = new MemoryChatStore(3);
    ["1", "2", "3", "4"].forEach((id) => store.add(message(id)));

    expect(store.list().map((m) => m.id)).toEqual(["2", "3", "4"]);
  });
});
