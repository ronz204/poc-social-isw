import { describe, expect, it } from "vitest";
import { GetFeedPageHandler, PAGE_SIZE } from "@app/social-feed/get-feed-page/get-feed-page.handler";
import { FeedError, type FeedData, type IFeedReader, type Post, type User } from "@core/social-feed";

const makeUsers = (count: number): User[] =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));

// Posts are spread over the first `users` users in turn.
const makePosts = (count: number, users = 10): Post[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    userId: (i % users) + 1,
    title: `Title ${i + 1}`,
    content: `Content ${i + 1}`,
  }));

const handlerFor = (data: FeedData | (() => Promise<FeedData>)) => {
  const reader: IFeedReader = { read: typeof data === "function" ? data : async () => data };
  return new GetFeedPageHandler(reader);
};

const full = { posts: makePosts(100), users: makeUsers(10) };

const okPage = async (handler: GetFeedPageHandler, page: number) => {
  const result = await handler.execute({ page });
  if (result.status !== "ok") throw new Error("expected an ok page");
  return result;
};

describe("GetFeedPageHandler", () => {
  it("returns the first page with title, content and author name", async () => {
    const result = await okPage(handlerFor(full), 1);

    expect(result.posts).toHaveLength(PAGE_SIZE);
    expect(result.posts[0]).toEqual({ id: 1, title: "Title 1", content: "Content 1", author: "User 1" });
    for (const post of result.posts) {
      expect(post.title).not.toBe("");
      expect(post.content).not.toBe("");
      expect(post.author).not.toBe("");
    }
  });

  it("leaves out a post whose user is unknown and keeps the rest", async () => {
    const posts = makePosts(3);
    posts[1] = { ...posts[1]!, userId: 999 };

    const result = await okPage(handlerFor({ posts, users: makeUsers(10) }), 1);

    expect(result.posts.map((post) => post.id)).toEqual([1, 3]);
  });

  it("returns an unavailable result when the reader fails", async () => {
    const handler = handlerFor(async () => {
      throw new FeedError("feed_unavailable");
    });

    await expect(handler.execute({ page: 1 })).resolves.toEqual({ status: "unavailable" });
  });

  it("returns at most a page of posts in the API order", async () => {
    const result = await okPage(handlerFor(full), 2);

    expect(result.posts.map((post) => post.id)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it.each([NaN, 0, -1, 1.5, Infinity])("returns the first page for the invalid page %s", async (page) => {
    const result = await okPage(handlerFor(full), page);

    expect(result.posts[0]?.id).toBe(1);
  });

  it("returns no posts and has-more false past the last page", async () => {
    const result = await okPage(handlerFor(full), 11);

    expect(result).toEqual({ status: "ok", posts: [], hasMore: false });
  });

  it("reports has-more false on the last page and true before it", async () => {
    const handler = handlerFor(full);

    const last = await okPage(handler, 10);
    const before = await okPage(handler, 9);

    expect(last.posts).toHaveLength(PAGE_SIZE);
    expect(last.hasMore).toBe(false);
    expect(before.hasMore).toBe(true);
  });
});
