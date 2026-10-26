import { token, type Module } from "dockdi";
import { ListPostsHandler } from "./list-posts/list-posts.handler";
import { PublishPostHandler } from "./publish-post/publish-post.handler";
import type { IClock, ILivePostRepository, IPostIdIssuer } from "@core/live-posts";
import { MemoryPostStore } from "@infra/bloc/post.store";
import { ClientHub } from "@infra/bloc/client.hub";

export class LivePostsDock {
  // tokens
  static readonly postRepository = token<ILivePostRepository>("LivePostsDock.postRepository");
  static readonly postIdIssuer = token<IPostIdIssuer>("LivePostsDock.postIdIssuer");
  static readonly clock = token<IClock>("LivePostsDock.clock");
  static readonly clientHub = token<ClientHub>("LivePostsDock.clientHub");
  static readonly publishPost = token<PublishPostHandler>("LivePostsDock.publishPost");
  static readonly listPosts = token<ListPostsHandler>("LivePostsDock.listPosts");

  // module
  static readonly module: Module = (container) => {
    container.bind(LivePostsDock.postRepository).toFactory(() => new MemoryPostStore()).inSingleton();
    container.bind(LivePostsDock.clientHub).toFactory(() => new ClientHub()).inSingleton();
    container.bind(LivePostsDock.postIdIssuer).toValue({ next: () => crypto.randomUUID() });
    container.bind(LivePostsDock.clock).toValue({ now: () => new Date() });
    container
      .bind(LivePostsDock.publishPost)
      .toClass(PublishPostHandler, [LivePostsDock.postRepository, LivePostsDock.postIdIssuer, LivePostsDock.clock]);
    container.bind(LivePostsDock.listPosts).toClass(ListPostsHandler, [LivePostsDock.postRepository]);
  };
}
