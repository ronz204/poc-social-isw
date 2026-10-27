import express from "express";
import { container, EnvToken } from "./dock";
import { globalChatSocket } from "@app/global-chat/global-chat.socket";
import { livePostsSocket } from "@app/live-posts/live-posts.socket";
import { realtimeRouter } from "@app/realtime/realtime.router";
import { socialFeedRouter } from "@app/social-feed/social-feed.router";
import { GlobalChatDock } from "@app/global-chat/global-chat.dock";
import { LivePostsDock } from "@app/live-posts/live-posts.dock";
import { WeatherDock } from "@infra/api/weather/weather.dock";
import { FeedDock } from "@infra/api/feed/feed.dock";
import { homeRouter } from "@infra/pages/home.router";
import { pageEngine } from "@infra/pages/pages.setup";

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

const app = express();
pageEngine(app);
app.use("/public", express.static("public"));
app.use(socialFeedRouter(container.resolve(FeedDock.getFeedPage)));
app.use(homeRouter(container.resolve(WeatherDock.getWeather), container.resolve(FeedDock.getFeedPage)));

const server = app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
realtimeRouter(server, postsSocket, chatSocket);
