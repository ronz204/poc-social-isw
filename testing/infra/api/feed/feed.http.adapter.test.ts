import { describe, expect, it } from "vitest";
import { HttpFeedAdapter, type Fetcher } from "@infra/api/feed/feed.http.adapter";
import { FeedError } from "@core/social-feed";

const posts = [{ userId: 1, id: 1, title: "t", body: "b", extra: "ignored" }];
const users = [{ id: 1, name: "Ana", email: "ignored" }];

// Answers each endpoint from the given functions, which may throw.
const fetcherFor = (answers: { posts: () => unknown; users: () => unknown }) => {
  const calls: { url: string; options: object }[] = [];
  const fetcher: Fetcher = async (url, options) => {
    calls.push({ url, options });
    return url.endsWith("/posts") ? answers.posts() : answers.users();
  };
  return { fetcher, calls };
};

describe("HttpFeedAdapter", () => {
  it("maps the API shapes to posts and users", async () => {
    const { fetcher } = fetcherFor({ posts: () => posts, users: () => users });

    const result = await new HttpFeedAdapter(fetcher).read();

    expect(result.posts).toEqual([{ id: 1, userId: 1, title: "t", content: "b" }]);
    expect(result.users).toEqual([{ id: 1, name: "Ana" }]);
  });

  it("fails with a feed error when the API call fails", async () => {
    const { fetcher } = fetcherFor({
      posts: () => {
        throw new Error("500");
      },
      users: () => users,
    });

    await expect(new HttpFeedAdapter(fetcher).read()).rejects.toBeInstanceOf(FeedError);
  });

  it("fails with a feed error when a response does not match its schema", async () => {
    const { fetcher } = fetcherFor({ posts: () => [{ id: 1, title: 5 }], users: () => users });

    await expect(new HttpFeedAdapter(fetcher).read()).rejects.toBeInstanceOf(FeedError);
  });

  it("fails with a feed error when a response is not JSON data", async () => {
    const { fetcher } = fetcherFor({ posts: () => "<html>", users: () => users });

    await expect(new HttpFeedAdapter(fetcher).read()).rejects.toBeInstanceOf(FeedError);
  });

  it("only reads posts and users and sends nothing", async () => {
    const { fetcher, calls } = fetcherFor({ posts: () => posts, users: () => users });

    await new HttpFeedAdapter(fetcher).read();

    expect(calls.map((call) => call.url.split("/").pop()).sort()).toEqual(["posts", "users"]);
    for (const { options } of calls) expect(Object.keys(options)).toEqual(["timeout"]);
  });
});
