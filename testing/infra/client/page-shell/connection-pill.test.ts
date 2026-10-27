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
vi.mock("@infra/client/page-shell/socket", () => ({ connection: fakeConnection }));

const emit = (kind: string) => listeners[kind]?.forEach((listener) => listener());
const shown = () => [
  document.querySelector("#connection-status")!.textContent,
  document.querySelector<HTMLElement>("#connection")!.dataset.state,
];

beforeEach(async () => {
  for (const key of Object.keys(listeners)) delete listeners[key];
  vi.resetModules();
  document.body.innerHTML =
    '<div id="connection" data-state="connecting"><span id="connection-status">Connecting</span></div>';
  await import("@infra/client/page-shell/connection-pill");
});

describe("header connection pill", () => {
  it("shows the label and the state of the connection", () => {
    expect(shown()).toEqual(["Connecting", "connecting"]);

    emit("open");
    expect(shown()).toEqual(["Connected", "open"]);

    emit("close");
    expect(shown()).toEqual(["Offline, retrying", "closed"]);
  });
});
