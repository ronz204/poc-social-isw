import { Html } from "@elysia/html";
import type { GetFeedPageOutput, FeedPost } from "@app/social-feed/get-feed-page/get-feed-page.schema";
import { avatarTone, initials } from "@infra/avatar";
import { FriendlyMessage } from "./friendly-message.component";

// `safe` escapes every API text, which is third-party data.
export const PostCards = ({ posts }: { posts: FeedPost[] }) => (
  <>
    {posts.map((post) => (
      <article class="flex flex-col gap-2.5 rounded-panel border border-border bg-surface p-[18px]">
        <div class="flex items-center gap-2.5">
          <span
            class={`flex size-9 items-center justify-center rounded-full font-display text-sm font-semibold ${avatarTone(post.author)}`}
            safe
          >
            {initials(post.author)}
          </span>
          <span class="text-sm font-extrabold" safe>
            {post.author}
          </span>
        </div>
        <h3 class="font-display text-[17px] leading-tight font-semibold" safe>
          {post.title}
        </h3>
        <p class="text-sm leading-normal text-text-secondary" safe>
          {post.content}
        </p>
      </article>
    ))}
  </>
);

// The API posts area: the first page and the status row the client script drives.
export const FeedPosts = ({ feed }: { feed: GetFeedPageOutput }) => {
  if (feed.status === "unavailable") {
    return <FriendlyMessage icon="cloud-off" text="Posts are not available right now" />;
  }
  if (feed.posts.length === 0) {
    return <FriendlyMessage icon="sparkles" text="No posts to show" />;
  }
  return (
    <section class="flex flex-col gap-3.5">
      <div id="feed-posts" class="flex flex-col gap-3.5">
        <PostCards posts={feed.posts} />
      </div>
      <p id="feed-status" class="py-3.5 text-center text-[13px] font-bold text-muted" data-has-more={String(feed.hasMore)}>
        {feed.hasMore ? "" : "No more posts"}
      </p>
    </section>
  );
};
