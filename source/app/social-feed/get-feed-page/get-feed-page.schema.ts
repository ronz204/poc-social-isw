import { z } from "zod";

// `page` is whatever number the entry could read; the handler decides if it is valid.
export const getFeedPageInput = z.object({ page: z.number() });
export type GetFeedPageInput = z.infer<typeof getFeedPageInput>;

const feedPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  author: z.string(),
});
export type FeedPost = z.infer<typeof feedPostSchema>;

export const getFeedPageOutput = z.discriminatedUnion("status", [
  z.object({ status: z.literal("ok"), posts: z.array(feedPostSchema), hasMore: z.boolean() }),
  z.object({ status: z.literal("unavailable") }),
]);
export type GetFeedPageOutput = z.infer<typeof getFeedPageOutput>;
