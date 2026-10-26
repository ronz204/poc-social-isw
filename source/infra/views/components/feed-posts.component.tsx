import { Html } from "@elysia/html";
import type { FeedPost, GetFeedPageOutput } from "@app/social-feed/get-feed-page/get-feed-page.schema";

// Two initials drawn from the author name; decoration only.
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

// `safe` escapes every API text, which is third-party data.
export const PostCards = ({ posts }: { posts: FeedPost[] }) => (
  <>
    {posts.map((post) => (
      <article class="rounded-2xl bg-white p-4 shadow-sm">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-xs font-bold" safe>
            {initials(post.author)}
          </span>
          <span class="text-sm font-medium" safe>
            {post.author}
          </span>
        </div>
        <h3 class="mt-2 text-lg font-bold" safe>
          {post.title}
        </h3>
        <p class="mt-1 text-slate-700" safe>
          {post.content}
        </p>
      </article>
    ))}
  </>
);

// The API posts area: the first page and the status row the client script drives.
export const FeedPosts = ({ feed }: { feed: GetFeedPageOutput }) => {
  if (feed.status === "unavailable") {
    return (
      <div class="rounded-2xl bg-slate-200 p-6 text-slate-600">
        <p>Posts are not available right now</p>
      </div>
    );
  }
  if (feed.posts.length === 0) {
    return (
      <div class="rounded-2xl bg-slate-200 p-6 text-slate-600">
        <p>No posts to show</p>
      </div>
    );
  }
  return (
    <section class="space-y-3">
      <div id="feed-posts" class="space-y-3">
        <PostCards posts={feed.posts} />
      </div>
      <p id="feed-status" class="text-center text-sm text-slate-500" data-has-more={String(feed.hasMore)}>
        {feed.hasMore ? "" : "No more posts"}
      </p>
    </section>
  );
};
