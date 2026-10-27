// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";

type Listener = () => void;
const listeners: Record<string, Listener[]> = {};
const fakeConnection = {
  send: vi.fn(),
  onOpen: (listener: Listener) => (listeners.open = [...(listeners.open ?? []), listener]),
  onClose: (listener: Listener) => (listeners.close = [...(listeners.close ?? []), listener]),
  onPosts: vi.fn(),
  onChat: vi.fn(),
};
vi.mock("@infra/client/socket", () => ({ connection: fakeConnection }));

const emit = (kind: string) => listeners[kind]?.forEach((listener) => listener());
const statusText = () => document.querySelector("#connection-status")!.textContent;

beforeEach(async () => {
  for (const key of Object.keys(listeners)) delete listeners[key];
  vi.resetModules();
  document.body.innerHTML = '<span id="connection-status">Connecting</span>';
  await import("@infra/client/app");
});

describe("header connection status", () => {
  it("follows the connection", () => {
    expect(statusText()).toBe("Connecting");

    emit("open");
    expect(statusText()).toBe("Connected");

    emit("close");
    expect(statusText()).toBe("Offline, retrying");
  });
});
