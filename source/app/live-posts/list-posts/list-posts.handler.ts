import type { ILivePostRepository } from "@core/live-posts";
import type { PublishPostOutput } from "../publish-post/publish-post.schema";

// The stored posts, oldest first, for a client that just connected.
export class ListPostsHandler {
  constructor(private readonly posts: ILivePostRepository) {}

  execute(): PublishPostOutput[] {
    return [...this.posts.list()];
  }
}
