import type { ILivePostRepository, LivePost } from "@core/live-posts";

export const HISTORY_SIZE = 100;

// Keeps the most recent posts in memory; the oldest is dropped first.
export class MemoryPostStore implements ILivePostRepository {
  private readonly posts: LivePost[] = [];

  constructor(private readonly max = HISTORY_SIZE) {}

  add(post: LivePost): void {
    this.posts.push(post);
    if (this.posts.length > this.max) this.posts.shift();
  }

  list(): readonly LivePost[] {
    return this.posts;
  }
}
