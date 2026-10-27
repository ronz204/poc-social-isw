import { describe, expect, it, vi } from "vitest";
import type { GetWeatherHandler } from "@app/local-weather/get-weather/get-weather.handler";
import type { GetWeatherOutput } from "@app/local-weather/get-weather/get-weather.schema";
import type { GetFeedPageHandler } from "@app/social-feed/get-feed-page/get-feed-page.handler";
import type { GetFeedPageOutput } from "@app/social-feed/get-feed-page/get-feed-page.schema";
import { homeRoute } from "@infra/views/home.route";

const WEATHER_OK: GetWeatherOutput = {
  status: "ok",
  location: { latitude: 1, longitude: 2, name: "Heredia", isDefault: false },
  reading: { temperature: 23, windSpeed: 9 },
};
const FEED_OK: GetFeedPageOutput = {
  status: "ok",
  posts: [{ id: 1, title: "First title", content: "First body", author: "Ana Mora" }],
  hasMore: false,
};
const DOWN = { status: "unavailable" } as const;

const WEATHER_MESSAGE = "Weather is not available right now";
const FEED_MESSAGE = "Posts are not available right now";

const weatherHandler = (execute: () => Promise<GetWeatherOutput>) => ({ execute }) as unknown as GetWeatherHandler;
const feedHandler = (execute: () => Promise<GetFeedPageOutput>) => ({ execute }) as unknown as GetFeedPageHandler;

const load = (weather: GetWeatherHandler, feed: GetFeedPageHandler) =>
  homeRoute(weather, feed).handle(new Request("http://localhost/"));

const PANELS = ['id="weather-panel"', 'id="feed-panel"', 'id="chat-panel"'];
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("home route", () => {
  it("starts the feed request without waiting for the weather one", async () => {
    let finishWeather!: (output: GetWeatherOutput) => void;
    const slowWeather = new Promise<GetWeatherOutput>((resolve) => (finishWeather = resolve));
    const feed = vi.fn(async () => FEED_OK);

    const response = load(weatherHandler(() => slowWeather), feedHandler(feed));
    await tick();

    expect(feed).toHaveBeenCalledTimes(1);
    finishWeather(WEATHER_OK);
    expect((await response).status).toBe(200);
  });

  it("keeps the feed and chat panels when the weather is unavailable", async () => {
    const response = await load(weatherHandler(async () => DOWN), feedHandler(async () => FEED_OK));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain(WEATHER_MESSAGE);
    expect(body).toContain("First title");
    PANELS.forEach((panel) => expect(body).toContain(panel));
  });

  it("keeps the weather and chat panels when the feed fails", async () => {
    const response = await load(weatherHandler(async () => WEATHER_OK), feedHandler(async () => DOWN));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain(FEED_MESSAGE);
    expect(body).toContain("23°C");
    PANELS.forEach((panel) => expect(body).toContain(panel));
  });

  it("answers 200 with the three panels when both APIs fail", async () => {
    const response = await load(weatherHandler(async () => DOWN), feedHandler(async () => DOWN));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain(WEATHER_MESSAGE);
    expect(body).toContain(FEED_MESSAGE);
    PANELS.forEach((panel) => expect(body).toContain(panel));
  });

  it("always contains the three panels when the data is fine", async () => {
    const body = await (await load(weatherHandler(async () => WEATHER_OK), feedHandler(async () => FEED_OK))).text();

    PANELS.forEach((panel) => expect(body).toContain(panel));
  });

  it("shows a friendly error page, not a stack trace, when something outside the panels fails", async () => {
    const broken = vi.fn(async () => {
      throw new Error("boom at /secret/path.ts:1");
    });

    const response = await load(weatherHandler(broken), feedHandler(async () => FEED_OK));
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(body).toContain("Something went wrong");
    expect(body).not.toContain("boom");
    expect(body).not.toContain("/secret/path.ts");
  });

  it("leaves the live lists empty in the HTML: history arrives over the socket", async () => {
    const body = await (await load(weatherHandler(async () => WEATHER_OK), feedHandler(async () => FEED_OK))).text();

    expect(body).toMatch(/id="live-list"[^>]*><\/div>/);
    expect(body).toMatch(/id="chat-list"[^>]*><\/div>/);
  });

  it("asks for the visitor name once, in the header, and not in each form", async () => {
    const body = await (await load(weatherHandler(async () => WEATHER_OK), feedHandler(async () => FEED_OK))).text();

    expect(body.match(/id="visitor-name"/g)).toHaveLength(1);
    expect(body).not.toContain('id="live-name"');
    expect(body).not.toContain('id="chat-name"');
  });
});
