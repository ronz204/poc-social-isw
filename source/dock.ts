import { Container, token } from "dockdi";
import { env } from "@env";
import { feedDock } from "@infra/api/feed/feed.dock";
import { globalChatDock } from "@infra/bloc/global-chat.dock";
import { livePostsDock } from "@infra/bloc/live-posts.dock";
import { weatherDock } from "@infra/api/weather/weather.dock";

export const EnvToken = token<typeof env>("Env");

// Composition root: contexts add their own bindings here as slices are built.
export const container = new Container();
container.bind(EnvToken).toValue(env);
container.load(weatherDock);
container.load(feedDock);
container.load(livePostsDock);
container.load(globalChatDock);
