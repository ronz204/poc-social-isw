import { describe, expect, it } from "vitest";
import { SlidingWindowLimiter } from "@infra/bloc/sliding-window.limiter";

describe("SlidingWindowLimiter", () => {
  it("allows up to the limit inside the window and then refuses", () => {
    const limiter = new SlidingWindowLimiter(2, 1000, () => 0);

    expect([limiter.allow("a"), limiter.allow("a"), limiter.allow("a")]).toEqual([true, true, false]);
  });

  it("counts each connection on its own", () => {
    const limiter = new SlidingWindowLimiter(1, 1000, () => 0);
    limiter.allow("a");

    expect(limiter.allow("b")).toBe(true);
  });

  it("allows again once the window has passed", () => {
    let now = 0;
    const limiter = new SlidingWindowLimiter(1, 1000, () => now);
    limiter.allow("a");
    now = 1000;

    expect(limiter.allow("a")).toBe(true);
  });

  it("forgets a connection that closed", () => {
    const limiter = new SlidingWindowLimiter(1, 1000, () => 0);
    limiter.allow("a");
    limiter.forget("a");

    expect(limiter.allow("a")).toBe(true);
  });
});
