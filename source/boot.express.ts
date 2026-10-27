import path from "node:path";
import express from "express";
import { container, EnvToken } from "./dock";
import { socialFeedRouter } from "@app/social-feed/social-feed.router";
import { WeatherDock } from "@infra/api/weather/weather.dock";
import { FeedDock } from "@infra/api/feed/feed.dock";
import { avatarTone, IDLE_TONE, initials } from "@infra/avatar";
import { ICONS } from "@infra/icons";
import { homeRouter } from "@infra/pages/home.router";

const { PORT } = container.resolve(EnvToken);

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "infra/pages"));
// Available to every page and partial without passing them in.
Object.assign(app.locals, { icons: ICONS, initials, avatarTone, idleTone: IDLE_TONE });

app.use("/public", express.static("public"));
app.use(socialFeedRouter(container.resolve(FeedDock.getFeedPage)));
app.use(homeRouter(container.resolve(WeatherDock.getWeather), container.resolve(FeedDock.getFeedPage)));

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
