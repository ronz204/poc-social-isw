import { ofetch } from "ofetch";
import { z } from "zod";
import { FeedError, type FeedData, type IFeedReader } from "@core/social-feed";

export type Fetcher = (url: string, options: { timeout: number }) => Promise<unknown>;

const BASE_URL = "https://jsonplaceholder.typicode.com";
const TIMEOUT_MS = 3000;

const postsSchema = z.array(
  z.object({ id: z.number(), userId: z.number(), title: z.string(), body: z.string() }),
);
const usersSchema = z.array(z.object({ id: z.number(), name: z.string() }));

// Reads posts and users from the fake-data API with GET only; every failure is a FeedError.
export class HttpFeedAdapter implements IFeedReader {
  constructor(private readonly fetcher: Fetcher = ofetch) {}

  async read(): Promise<FeedData> {
    try {
      const [posts, users] = await Promise.all([
        this.fetcher(`${BASE_URL}/posts`, { timeout: TIMEOUT_MS }),
        this.fetcher(`${BASE_URL}/users`, { timeout: TIMEOUT_MS }),
      ]);
      return {
        posts: postsSchema
          .parse(posts)
          .map(({ id, userId, title, body }) => ({ id, userId, title, content: body })),
        users: usersSchema.parse(users).map(({ id, name }) => ({ id, name })),
      };
    } catch {
      throw new FeedError("feed_unavailable");
    }
  }
}
