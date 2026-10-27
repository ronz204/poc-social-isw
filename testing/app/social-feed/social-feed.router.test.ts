import { afterEach, describe, expect, it, vi } from "vitest";
import type { GetFeedPageHandler } from "@app/social-feed/get-feed-page/get-feed-page.handler";
import type { GetFeedPageOutput } from "@app/social-feed/get-feed-page/get-feed-page.schema";
import { socialFeedRouter } from "@app/social-feed/social-feed.router";
import { serve } from "../../support/serve";

const running: Array<() => void> = [];
afterEach(() => running.splice(0).forEach((stop) => stop()));

const request = async (execute: (input: { page: number }) => Promise<GetFeedPageOutput>, query: string) => {
  const handler = { execute } as unknown as GetFeedPageHandler;
  const app = await serve((app) => app.use(socialFeedRouter(handler)));
  running.push(app.stop);
  const response = await fetch(`${app.url}/feed${query}`);
  return { status: response.status, json: await response.json() };
};

const OK: GetFeedPageOutput = {
  status: "ok",
  posts: [{ id: 1, title: "A title", content: "A body", author: "Ana Mora" }],
  hasMore: true,
};

describe("social feed router", () => {
  it("answers the cards as HTML and whether more pages remain", async () => {
    const { status, json } = await request(async () => OK, "?page=2");

    expect(status).toBe(200);
    expect(json.hasMore).toBe(true);
    expect(json.html).toContain("<article");
    expect(json.html).toContain("A title");
  });

  it("escapes the post text inside the cards", async () => {
    const evil = "<script>alert(1)</script>";
    const feed: GetFeedPageOutput = { status: "ok", posts: [{ id: 1, title: evil, content: evil, author: evil }], hasMore: false };

    const { json } = await request(async () => feed, "");

    expect(json.html).not.toContain("<script>");
    expect(json.html).toContain("&lt;script&gt;");
  });

  it("hands the page number to the handler, and NaN when it cannot be read", async () => {
    const execute = vi.fn(async (_input: { page: number }) => OK);

    await request(execute, "?page=3");
    await request(execute, "?page=abc");
    await request(execute, "");

    expect(execute.mock.calls.map(([input]) => input.page)).toEqual([3, NaN, NaN]);
  });

  it("answers 503 with an empty fragment when the feed is unavailable", async () => {
    const { status, json } = await request(async () => ({ status: "unavailable" }), "?page=2");

    expect(status).toBe(503);
    expect(json).toEqual({ html: "", hasMore: false });
  });
});
