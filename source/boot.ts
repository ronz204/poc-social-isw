import { Elysia } from "elysia";
import { html } from "@elysia/html";
import { staticPlugin } from "@elysia/static";
import { container, EnvToken } from "./dock";
import { socialFeedPlugin } from "@app/social-feed/social-feed.plugin";
import { globalChatSocket } from "@app/global-chat/global-chat.socket";
import { livePostsSocket } from "@app/live-posts/live-posts.socket";
import { realtimePlugin } from "@app/realtime/realtime.plugin";
import { GlobalChatDock } from "@app/global-chat/global-chat.dock";
import { LivePostsDock } from "@app/live-posts/live-posts.dock";
import { WeatherDock } from "@infra/api/weather/weather.dock";
import { FeedDock } from "@infra/api/feed/feed.dock";
import { PostCards } from "@infra/views/components/feed-posts.component";
import { homeRoute } from "@infra/views/home.route";

const { PORT } = container.resolve(EnvToken);

const hub = container.resolve(LivePostsDock.clientHub);
const postsSocket = livePostsSocket({
  publish: container.resolve(LivePostsDock.publishPost),
  list: container.resolve(LivePostsDock.listPosts),
  hub,
});
const chatSocket = globalChatSocket({
  send: container.resolve(GlobalChatDock.sendMessage),
  list: container.resolve(GlobalChatDock.listMessages),
  hub,
});

new Elysia()
  .use(html())
  .use(staticPlugin({ assets: "public", prefix: "/public" }))
  .use(socialFeedPlugin(container.resolve(FeedDock.getFeedPage)))
  .use(homeRoute(container.resolve(WeatherDock.getWeather), container.resolve(FeedDock.getFeedPage)))
  .use(realtimePlugin(postsSocket, chatSocket))
  // A later feed page as JSON: its cards as HTML plus whether more remain.
  .get("/feed", async ({ query, set, feedPage }) => {
    const feed = await feedPage(query.page);
    if (feed.status === "unavailable") {
      set.status = 503;
      return { html: "", hasMore: false };
    }
    return { html: await PostCards({ posts: feed.posts }), hasMore: feed.hasMore };
  })
  .listen(PORT);

console.log(`Listening on http://localhost:${PORT}`);
