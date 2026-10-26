import type { FeedData, IFeedReader } from "@core/social-feed";

// Remembers the feed data; it leaves only by expiry and failures are never stored.
export class CachedFeedAdapter implements IFeedReader {
  private entry: { data: FeedData; storedAt: number } | null = null;

  constructor(
    private readonly inner: IFeedReader,
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  async read(): Promise<FeedData> {
    if (this.entry && this.now() - this.entry.storedAt < this.ttlMs) return this.entry.data;

    const data = await this.inner.read();
    this.entry = { data, storedAt: this.now() };
    return data;
  }
}
