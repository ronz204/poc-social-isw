const messages = {
  feed_unavailable: "The feed could not be obtained",
} as const;

export type FeedErrorCode = keyof typeof messages;

export class FeedError extends Error {
  constructor(readonly code: FeedErrorCode) {
    super(messages[code]);
    this.name = "FeedError";
  }
}
