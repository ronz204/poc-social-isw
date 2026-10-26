import type { ClientLimiter } from "@app/realtime/realtime.contracts";

// Sliding window per connection: at most `limit` messages in the last `windowMs`.
export class SlidingWindowLimiter implements ClientLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  allow(clientId: string): boolean {
    const now = this.now();
    const recent = (this.hits.get(clientId) ?? []).filter((at) => now - at < this.windowMs);
    const allowed = recent.length < this.limit;
    if (allowed) recent.push(now);
    this.hits.set(clientId, recent);
    return allowed;
  }

  // A closed connection leaves no entry behind.
  forget(clientId: string): void {
    this.hits.delete(clientId);
  }
}
