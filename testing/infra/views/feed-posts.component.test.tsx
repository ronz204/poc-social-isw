import { describe, expect, it } from "vitest";
import { Html } from "@elysia/html";
import { PostCards } from "@infra/views/components/feed-posts.component";

describe("PostCards", () => {
  it("renders author name, title and content as escaped text", async () => {
    const markup = await (
      <PostCards
        posts={[{ id: 1, title: "<script>alert(1)</script>", content: "<b>c</b>", author: "<i>Ana</i>" }]}
      />
    );

    expect(markup).not.toContain("<script>");
    expect(markup).not.toContain("<b>c</b>");
    expect(markup).not.toContain("<i>Ana</i>");
    // The renderer escapes the opening `<`, which is enough to make the tag inert text.
    expect(markup).toContain("&lt;script>alert(1)&lt;/script>");
  });
});
