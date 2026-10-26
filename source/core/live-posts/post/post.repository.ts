import type { LivePost } from "./post.vos";

// The posts the process keeps in memory, oldest first; it holds only the most recent ones.
export interface ILivePostRepository {
  add(post: LivePost): void;
  list(): readonly LivePost[];
}
