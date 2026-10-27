import { describe, expect, it } from "vitest";
import { avatarTone, initials } from "@infra/avatar";

describe("initials", () => {
  it("takes the first letter of the first two words, uppercased", () => {
    expect(initials("maria solis vega")).toBe("MS");
    expect(initials("Ana")).toBe("A");
  });
});

describe("avatarTone", () => {
  it("gives one author the same color pair every time", () => {
    expect(avatarTone("Ana Vega")).toBe(avatarTone("Ana Vega"));
  });

  it("always answers one of the four design pairs", () => {
    for (const name of ["", "Ana Vega", "Luis Mora", "x", "<b>Ana</b>"]) {
      expect(avatarTone(name)).toMatch(/^bg-av[1-4]-bg text-av[1-4]-fg$/);
    }
  });
});
