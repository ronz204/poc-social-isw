import { Elysia } from "elysia";
import { html } from "@elysia/html";
import { localWeatherPlugin } from "@app/local-weather/local-weather.plugin";
import { socialFeedPlugin } from "@app/social-feed/social-feed.plugin";
import type { GetWeatherHandler } from "@app/local-weather/get-weather/get-weather.handler";
import type { GetFeedPageHandler } from "@app/social-feed/get-feed-page/get-feed-page.handler";
import { ErrorView } from "./error.view";
import { HomeView } from "./home.view";

// The home page: each external outcome already carries its own failure, so only an unexpected throw reaches `onError`.
export const homeRoute = (getWeather: GetWeatherHandler, getFeedPage: GetFeedPageHandler) =>
  new Elysia({ name: "home" })
    .use(html())
    .use(localWeatherPlugin(getWeather))
    .use(socialFeedPlugin(getFeedPage))
    .onError(async ({ code }) => {
      // An unknown path keeps the framework's own 404.
      if (code === "NOT_FOUND") return;
      return new Response(await ErrorView(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    })
    .get("/", async ({ request, server, weatherFor, feedPage }) => {
      // Weather and the first feed page are requested together.
      const [weather, feed] = await Promise.all([
        weatherFor(server?.requestIP(request)?.address),
        feedPage("1"),
      ]);
      return HomeView({ weather, feed });
    });
