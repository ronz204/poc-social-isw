import { afterEach, describe, expect, it, vi } from "vitest";
import { chatItem } from "@infra/client/global-chat/global-chat.render";

// A minimal document: elements keep their text, and any markup assignment fails the test.
const makeElement = (tag: string) => {
  const element: any = { tag, className: "", textContent: "", children: [] as any[] };
  element.append = (...nodes: any[]) => element.children.push(...nodes);
  Object.defineProperty(element, "innerHTML", {
    set() {
      throw new Error("markup assigned");
    },
  });
  return element;
};

const allText = (element: any): string[] => [element.textContent, ...element.children.flatMap(allText)];

afterEach(() => vi.unstubAllGlobals());

describe("chatItem", () => {
  it("shows author name and text as text, never as markup", () => {
    vi.stubGlobal("document", { createElement: makeElement });

    const item = chatItem({ id: "1", author: "<b>Ana</b>", text: "<script>alert(1)</script>", time: "09:30 AM" });

    const texts = allText(item);
    expect(texts).toContain("<script>alert(1)</script>");
    expect(texts).toContain("<b>Ana</b>");
    expect(texts).toContain("09:30 AM");
  });
});
