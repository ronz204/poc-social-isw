// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Html } from "@elysia/html";
import { Header } from "@infra/views/components/header.component";
import { LivePosts } from "@infra/views/components/live-posts.component";

const nameInput = () => document.getElementById("visitor-name") as HTMLInputElement;
const avatars = () => Array.from(document.querySelectorAll<HTMLElement>("[data-visitor-avatar]"));
const initialsOf = (avatar: HTMLElement) => avatar.querySelector("[data-initials]") as HTMLElement;
const iconOf = (avatar: HTMLElement) => avatar.querySelector("svg") as SVGElement;
const type = (text: string) => {
  nameInput().value = text;
  nameInput().dispatchEvent(new Event("input", { bubbles: true }));
};
const load = async () => (await import("@infra/client/page-shell/visitor-name")).visitor;

beforeEach(async () => {
  localStorage.clear();
  vi.resetModules();
  document.body.innerHTML = await (
    <div>
      <Header connection />
      <LivePosts />
    </div>
  );
});

describe("the visitor name", () => {
  it("shows a plain user icon in every avatar while there is no name", async () => {
    const visitor = await load();

    expect(visitor.name()).toBe("");
    expect(avatars()).toHaveLength(2);
    for (const avatar of avatars()) {
      expect(avatar.className).toContain("bg-neutral-bg");
      expect(iconOf(avatar).hasAttribute("hidden")).toBe(false);
      expect(initialsOf(avatar).hasAttribute("hidden")).toBe(true);
    }
  });

  it("prefills the field from the saved name and paints the initials", async () => {
    localStorage.setItem("visitor-name", "Ana Vega");

    const visitor = await load();

    expect(visitor.name()).toBe("Ana Vega");
    expect(nameInput().value).toBe("Ana Vega");
    for (const avatar of avatars()) {
      expect(initialsOf(avatar).textContent).toBe("AV");
      expect(initialsOf(avatar).hasAttribute("hidden")).toBe(false);
      expect(iconOf(avatar).hasAttribute("hidden")).toBe(true);
      expect(avatar.className).not.toContain("bg-neutral-bg");
      expect(avatar.className).toMatch(/bg-av[1-4]-bg/);
    }
  });

  it("saves what is typed, repaints the avatars and tells its listeners", async () => {
    const visitor = await load();
    const changed = vi.fn();
    visitor.onChange(changed);

    type("Luis Mora");

    expect(localStorage.getItem("visitor-name")).toBe("Luis Mora");
    expect(visitor.name()).toBe("Luis Mora");
    expect(initialsOf(avatars()[0]!).textContent).toBe("LM");
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it("goes back to the plain icon when the name is cleared, and trims what it reports", async () => {
    const visitor = await load();

    type("  Ana  ");
    expect(visitor.name()).toBe("Ana");

    type("   ");
    expect(visitor.name()).toBe("");
    expect(avatars()[0]!.className).toContain("bg-neutral-bg");
    expect(iconOf(avatars()[0]!).hasAttribute("hidden")).toBe(false);
  });

  it("leaves the field when Enter is pressed, so it folds back into the chip", async () => {
    await load();
    nameInput().focus();
    expect(document.activeElement).toBe(nameInput());

    nameInput().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(document.activeElement).not.toBe(nameInput());
  });

  it("works when the browser cannot store the name", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const visitor = await load();

    expect(() => type("Ana")).not.toThrow();
    expect(visitor.name()).toBe("Ana");
    vi.restoreAllMocks();
  });
});
