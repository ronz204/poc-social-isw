import { afterEach, describe, expect, it } from "vitest";
import type { GetWeatherHandler } from "@app/local-weather/get-weather/get-weather.handler";
import type { GetWeatherOutput } from "@app/local-weather/get-weather/get-weather.schema";
import type { GetFeedPageHandler } from "@app/social-feed/get-feed-page/get-feed-page.handler";
import type { GetFeedPageOutput } from "@app/social-feed/get-feed-page/get-feed-page.schema";
import { homeRoute } from "@infra/views/home.route";
import { homeRouter } from "@infra/pages/home.router";
import { serve } from "../../support/serve";

const running: Array<() => void> = [];
afterEach(() => running.splice(0).forEach((stop) => stop()));

const tsx = async (weather: GetWeatherHandler, feed: GetFeedPageHandler) =>
  (await homeRoute(weather, feed).handle(new Request("http://localhost/"))).text();

const ejs = async (weather: GetWeatherHandler, feed: GetFeedPageHandler) => {
  const app = await serve((app) => app.use(homeRouter(weather, feed)));
  running.push(app.stop);
  return (await fetch(`${app.url}/`)).text();
};

// Only what the browser treats as the same: spacing between tags, `<br/>` against `<br>`, the entity spelling of a quote,
// and `&gt;` against a bare `>` in text (EJS escapes it, the TSX renderer leaves it).
// Vitest compiles TSX in development mode, which stamps `__self` and `__source` on every tag; the real server does not.
const normalize = (html: string) =>
  html
    .replace(/ __(self|source)="[^"]*"/g, "")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .replace(/\s*(<|>)\s*/g, "$1")
    .replace(/\s*\/>/g, ">")
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, "&#34;");

const weatherOf = (output: GetWeatherOutput) => ({ execute: async () => output }) as unknown as GetWeatherHandler;
const feedOf = (output: GetFeedPageOutput) => ({ execute: async () => output }) as unknown as GetFeedPageHandler;

const WEATHER: GetWeatherOutput = {
  status: "ok",
  location: { latitude: 1, longitude: 2, name: "Heredia", isDefault: false },
  reading: { temperature: 23.4, windSpeed: 8.6 },
};
const WEATHER_DEFAULT: GetWeatherOutput = {
  status: "ok",
  location: { latitude: 9.9, longitude: -84, isDefault: true },
  reading: { temperature: 3, windSpeed: 1 },
};
const FEED: GetFeedPageOutput = {
  status: "ok",
  posts: [
    { id: 1, title: `Quotes " and 'apostrophes'`, content: "<b>markup</b> & more", author: "Ana Mora" },
    { id: 2, title: "Second", content: "Body", author: "Luis" },
  ],
  hasMore: true,
};
const FEED_END: GetFeedPageOutput = { status: "ok", posts: FEED.status === "ok" ? FEED.posts : [], hasMore: false };
const FEED_EMPTY: GetFeedPageOutput = { status: "ok", posts: [], hasMore: false };
const DOWN = { status: "unavailable" } as const;

describe("TSX and EJS home pages", () => {
  const cases: Array<[string, GetWeatherOutput, GetFeedPageOutput]> = [
    ["weather and feed with more pages", WEATHER, FEED],
    ["the default location and the last page", WEATHER_DEFAULT, FEED_END],
    ["an empty feed", WEATHER, FEED_EMPTY],
    ["the weather down", DOWN, FEED],
    ["the feed down", WEATHER, DOWN],
    ["both down", DOWN, DOWN],
  ];

  it.each(cases)("render the same markup with %s", async (_name, weather, feed) => {
    const fromTsx = await tsx(weatherOf(weather), feedOf(feed));
    const fromEjs = await ejs(weatherOf(weather), feedOf(feed));

    expect(normalize(fromEjs)).toBe(normalize(fromTsx));
  });
});
