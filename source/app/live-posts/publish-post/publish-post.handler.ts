import type { IClock, ILivePostRepository, IPostIdIssuer } from "@core/live-posts";
import type { PublishPostInput, PublishPostOutput } from "./publish-post.schema";

// Builds the post with the server's own id and time and stores it; the history keeps its bound in the repository.
export class PublishPostHandler {
  constructor(
    private readonly posts: ILivePostRepository,
    private readonly ids: IPostIdIssuer,
    private readonly clock: IClock,
  ) {}

  execute({ name, text }: PublishPostInput): PublishPostOutput {
    const post = {
      id: this.ids.next(),
      author: name,
      content: text,
      time: this.clock.now().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    this.posts.add(post);
    return post;
  }
}
