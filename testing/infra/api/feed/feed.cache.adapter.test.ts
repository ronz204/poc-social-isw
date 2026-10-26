import { describe, expect, it } from "vitest";
import { CachedFeedAdapter } from "@infra/api/feed/feed.cache.adapter";
import { FeedError, type FeedData, type IFeedReader } from "@core/social-feed";

const TTL = 5 * 60 * 1000;
const data: FeedData = { posts: [], users: [] };

const setup = (answer: () => Promise<FeedData> = async () => data) => {
  let calls = 0;
  let clock = 0;
  const inner: IFeedReader = {
    read: async () => {
      calls++;
      return answer();
    },
  };
  const cache = new CachedFeedAdapter(inner, TTL, () => clock);
  return { cache, calls: () => calls, advance: (ms: number) => (clock += ms) };
};

describe("CachedFeedAdapter", () => {
  it("reads once inside the TTL", async () => {
    const { cache, calls, advance } = setup();

    await cache.read();
    advance(TTL - 1);
    await cache.read();

    expect(calls()).toBe(1);
  });

  it("reads again after the TTL", async () => {
    const { cache, calls, advance } = setup();

    await cache.read();
    advance(TTL);
    await cache.read();

    expect(calls()).toBe(2);
  });

  it("does not cache a failure", async () => {
    let failing = true;
    const { cache, calls } = setup(async () => {
      if (failing) throw new FeedError("feed_unavailable");
      return data;
    });

    await expect(cache.read()).rejects.toBeInstanceOf(FeedError);
    failing = false;

    await expect(cache.read()).resolves.toEqual(data);
    expect(calls()).toBe(2);
  });
});
