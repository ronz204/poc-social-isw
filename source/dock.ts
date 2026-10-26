import { Container, token } from "dockdi";
import { env } from "@env";
import { FeedDock } from "@infra/api/feed/feed.dock";
import { GlobalChatDock } from "@infra/bloc/global-chat.dock";
import { LivePostsDock } from "@infra/bloc/live-posts.dock";
import { WeatherDock } from "@infra/api/weather/weather.dock";

export const EnvToken = token<typeof env>("Env");

// Composition root
export const container = new Container();
container.bind(EnvToken).toValue(env);
container.load(WeatherDock.module);
container.load(FeedDock.module);
container.load(LivePostsDock.module);
container.load(GlobalChatDock.module);
