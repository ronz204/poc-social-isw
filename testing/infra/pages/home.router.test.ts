import { afterEach, describe, expect, it, vi } from "vitest";
import type { GetWeatherHandler } from "@app/local-weather/get-weather/get-weather.handler";
import type { GetWeatherOutput } from "@app/local-weather/get-weather/get-weather.schema";
import type { GetFeedPageHandler } from "@app/social-feed/get-feed-page/get-feed-page.handler";
import type { GetFeedPageOutput } from "@app/social-feed/get-feed-page/get-feed-page.schema";
import { homeRouter } from "@infra/pages/home.router";
import { serve } from "../../support/serve";

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
const PANELS = ['id="weather-panel"', 'id="feed-panel"', 'id="chat-panel"'];

const weatherHandler = (execute: (input: { ip: string }) => Promise<GetWeatherOutput>) =>
  ({ execute }) as unknown as GetWeatherHandler;
const feedHandler = (execute: (input: { page: number }) => Promise<GetFeedPageOutput>) =>
  ({ execute }) as unknown as GetFeedPageHandler;

const running: Array<() => void> = [];
afterEach(() => running.splice(0).forEach((stop) => stop()));

const load = async (weather: GetWeatherHandler, feed: GetFeedPageHandler) => {
  const app = await serve((app) => app.use(homeRouter(weather, feed)));
  running.push(app.stop);
  const response = await fetch(`${app.url}/`);
  return { status: response.status, type: response.headers.get("content-type") ?? "", body: await response.text() };
};

describe("home router", () => {
  it("answers 200 with the three panels and the data when both APIs are fine", async () => {
    const { status, body } = await load(weatherHandler(async () => WEATHER_OK), feedHandler(async () => FEED_OK));

    expect(status).toBe(200);
    PANELS.forEach((panel) => expect(body).toContain(panel));
    expect(body).toContain("23°C");
    expect(body).toContain("First title");
  });

  it("starts the feed request without waiting for the weather one", async () => {
    let finishWeather!: (output: GetWeatherOutput) => void;
    const slowWeather = new Promise<GetWeatherOutput>((resolve) => (finishWeather = resolve));
    const feed = vi.fn(async () => FEED_OK);

    const response = load(weatherHandler(() => slowWeather), feedHandler(feed));
    await vi.waitFor(() => expect(feed).toHaveBeenCalledTimes(1));

    finishWeather(WEATHER_OK);
    expect((await response).status).toBe(200);
  });

  it("asks the weather for the visitor's address and the feed for page 1", async () => {
    const weather = vi.fn(async () => WEATHER_OK);
    const feed = vi.fn(async () => FEED_OK);

    await load(weatherHandler(weather), feedHandler(feed));

    expect(weather).toHaveBeenCalledWith({ ip: expect.stringContaining("127.0.0.1") });
    expect(feed).toHaveBeenCalledWith({ page: 1 });
  });

  it("keeps the feed and chat panels when the weather is unavailable", async () => {
    const { status, body } = await load(weatherHandler(async () => DOWN), feedHandler(async () => FEED_OK));

    expect(status).toBe(200);
    expect(body).toContain(WEATHER_MESSAGE);
    expect(body).toContain("First title");
    PANELS.forEach((panel) => expect(body).toContain(panel));
  });

  it("keeps the weather and chat panels when the feed fails", async () => {
    const { status, body } = await load(weatherHandler(async () => WEATHER_OK), feedHandler(async () => DOWN));

    expect(status).toBe(200);
    expect(body).toContain(FEED_MESSAGE);
    expect(body).toContain("23°C");
    PANELS.forEach((panel) => expect(body).toContain(panel));
  });

  it("answers 200 with the three panels when both APIs fail", async () => {
    const { status, body } = await load(weatherHandler(async () => DOWN), feedHandler(async () => DOWN));

    expect(status).toBe(200);
    expect(body).toContain(WEATHER_MESSAGE);
    expect(body).toContain(FEED_MESSAGE);
    PANELS.forEach((panel) => expect(body).toContain(panel));
  });

  it("escapes third-party text: the place name and every post field", async () => {
    const evil = "<script>alert(1)</script>";
    const weather = weatherHandler(async () => ({
      status: "ok",
      location: { latitude: 1, longitude: 2, name: evil, isDefault: false },
      reading: { temperature: 1, windSpeed: 1 },
    }));
    const feed = feedHandler(async () => ({
      status: "ok",
      posts: [{ id: 1, title: evil, content: evil, author: evil }],
      hasMore: false,
    }));

    const { body } = await load(weather, feed);

    expect(body).not.toContain("<script>alert");
    expect(body).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("shows a friendly error page, not a stack trace, when something outside the panels fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const broken = async () => {
      throw new Error("boom at /secret/path.ts:1");
    };

    const { status, type, body } = await load(weatherHandler(broken), feedHandler(async () => FEED_OK));

    expect(status).toBe(500);
    expect(type).toContain("text/html");
    expect(body).toContain("Something went wrong");
    expect(body).not.toContain("boom");
    expect(body).not.toContain("/secret/path.ts");
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });

  it("leaves the live lists empty in the HTML: history arrives over the socket", async () => {
    const { body } = await load(weatherHandler(async () => WEATHER_OK), feedHandler(async () => FEED_OK));

    expect(body).toMatch(/id="live-list"[^>]*><\/div>/);
    expect(body).toMatch(/id="chat-list"[^>]*><\/div>/);
  });

  it("asks for the visitor name once, in the header, and not in each form", async () => {
    const { body } = await load(weatherHandler(async () => WEATHER_OK), feedHandler(async () => FEED_OK));

    expect(body.match(/id="visitor-name"/g)).toHaveLength(1);
    expect(body).not.toContain('id="live-name"');
    expect(body).not.toContain('id="chat-name"');
  });
});
