import type { Post } from "../post/post.vos";
import type { User } from "../user/user.vos";

export interface FeedData {
  readonly posts: readonly Post[];
  readonly users: readonly User[];
}

// Reads every post and user, in the API order; fails only with a FeedError.
export interface IFeedReader {
  read(): Promise<FeedData>;
}
