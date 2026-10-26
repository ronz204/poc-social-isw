import { token, type Module } from "dockdi";
import { ListPostsHandler } from "@app/live-posts/list-posts/list-posts.handler";
import { PublishPostHandler } from "@app/live-posts/publish-post/publish-post.handler";
import type { IClock, ILivePostRepository, IPostIdIssuer } from "@core/live-posts";
import { MemoryPostStore } from "../store/post.memory-store";
import { ClientHub } from "./client.hub";
import { SlidingWindowLimiter } from "./rate-limiter";

// Five messages every ten seconds per connection.
const PUBLISH_LIMIT = 5;
const PUBLISH_WINDOW_MS = 10_000;

export const LivePostRepositoryToken = token<ILivePostRepository>("LivePostRepository");
export const PostIdIssuerToken = token<IPostIdIssuer>("PostIdIssuer");
export const ClockToken = token<IClock>("Clock");
export const ClientHubToken = token<ClientHub>("ClientHub");
export const PublishLimiterToken = token<SlidingWindowLimiter>("PublishLimiter");
export const PublishPostHandlerToken = token<PublishPostHandler>("PublishPostHandler");
export const ListPostsHandlerToken = token<ListPostsHandler>("ListPostsHandler");

export const livePostsDock: Module = (container) => {
  // Store, hub and limiter are one instance for the whole process: a second one would keep its own state.
  container.bind(LivePostRepositoryToken).toFactory(() => new MemoryPostStore()).inSingleton();
  container.bind(ClientHubToken).toFactory(() => new ClientHub()).inSingleton();
  container
    .bind(PublishLimiterToken)
    .toFactory(() => new SlidingWindowLimiter(PUBLISH_LIMIT, PUBLISH_WINDOW_MS))
    .inSingleton();
  container.bind(PostIdIssuerToken).toValue({ next: () => crypto.randomUUID() });
  container.bind(ClockToken).toValue({ now: () => new Date() });
  container
    .bind(PublishPostHandlerToken)
    .toClass(PublishPostHandler, [LivePostRepositoryToken, PostIdIssuerToken, ClockToken]);
  container.bind(ListPostsHandlerToken).toClass(ListPostsHandler, [LivePostRepositoryToken]);
};
