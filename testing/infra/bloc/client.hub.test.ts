import { describe, expect, it } from "vitest";
import { ClientHub } from "@infra/bloc/client.hub";

describe("ClientHub", () => {
  it("delivers a broadcast to every client even when one send fails", () => {
    const hub = new ClientHub();
    const received: string[] = [];
    hub.add({
      id: "broken",
      send: () => {
        throw new Error("closed");
      },
    });
    hub.add({ id: "good", send: (text) => received.push(text) });

    hub.broadcast("hello");

    expect(received).toEqual(["hello"]);
  });

  it("stops delivering to a removed client", () => {
    const hub = new ClientHub();
    const received: string[] = [];
    const client = { id: "a", send: (text: string) => void received.push(text) };
    hub.add(client);
    hub.remove(client);

    hub.broadcast("hello");

    expect(received).toEqual([]);
  });
});
