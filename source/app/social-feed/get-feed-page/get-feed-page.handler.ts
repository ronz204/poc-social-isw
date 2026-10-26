import type { IFeedReader } from "@core/social-feed";
import type { FeedPost, GetFeedPageInput, GetFeedPageOutput } from "./get-feed-page.schema";

export const PAGE_SIZE = 10;

// One page of posts joined to their authors; an API failure becomes `unavailable`, never an exception.
export class GetFeedPageHandler {
  constructor(private readonly reader: IFeedReader) {}

  async execute({ page }: GetFeedPageInput): Promise<GetFeedPageOutput> {
    try {
      const { posts, users } = await this.reader.read();
      const names = new Map(users.map((user) => [user.id, user.name]));

      // A post whose author is unknown is left out.
      const joined: FeedPost[] = [];
      for (const post of posts) {
        const author = names.get(post.userId);
        if (author !== undefined) joined.push({ id: post.id, title: post.title, content: post.content, author });
      }

      // An invalid page number means the first page.
      const number = Number.isInteger(page) && page >= 1 ? page : 1;
      const start = (number - 1) * PAGE_SIZE;
      return {
        status: "ok",
        posts: joined.slice(start, start + PAGE_SIZE),
        hasMore: joined.length > start + PAGE_SIZE,
      };
    } catch {
      return { status: "unavailable" };
    }
  }
}
