import { token, type Module } from "dockdi";
import { GetFeedPageHandler } from "@app/social-feed/get-feed-page/get-feed-page.handler";
import type { IFeedReader } from "@core/social-feed";
import { CachedFeedAdapter } from "./feed.cache.adapter";
import { HttpFeedAdapter } from "./feed.http.adapter";

const FEED_TTL_MS = 5 * 60 * 1000;

export class FeedDock {
  // tokens
  static readonly feedReader = token<IFeedReader>("FeedDock.feedReader");
  static readonly getFeedPage = token<GetFeedPageHandler>("FeedDock.getFeedPage");

  // module
  static readonly module: Module = (container) => {
    container
      .bind(FeedDock.feedReader)
      .toFactory(() => new CachedFeedAdapter(new HttpFeedAdapter(), FEED_TTL_MS))
      .inSingleton();
    container.bind(FeedDock.getFeedPage).toClass(GetFeedPageHandler, [FeedDock.feedReader]);
  };
}
