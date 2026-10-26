import { token, type Module } from "dockdi";
import { GetFeedPageHandler } from "@app/social-feed/get-feed-page/get-feed-page.handler";
import type { IFeedReader } from "@core/social-feed";
import { CachedFeedAdapter } from "./feed.cache.adapter";
import { HttpFeedAdapter } from "./feed.http.adapter";

const FEED_TTL_MS = 5 * 60 * 1000;

export const FeedReaderToken = token<IFeedReader>("FeedReader");
export const GetFeedPageHandlerToken = token<GetFeedPageHandler>("GetFeedPageHandler");

export const feedDock: Module = (container) => {
  // One cache instance for the whole process, so every visit shares it.
  container
    .bind(FeedReaderToken)
    .toFactory(() => new CachedFeedAdapter(new HttpFeedAdapter(), FEED_TTL_MS))
    .inSingleton();
  container.bind(GetFeedPageHandlerToken).toClass(GetFeedPageHandler, [FeedReaderToken]);
};
