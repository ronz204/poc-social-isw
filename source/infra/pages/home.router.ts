import { Router, type ErrorRequestHandler } from "express";
import type { GetWeatherHandler } from "@app/local-weather/get-weather/get-weather.handler";
import type { GetFeedPageHandler } from "@app/social-feed/get-feed-page/get-feed-page.handler";

// Only an unexpected throw reaches this: each external outcome already carries its own failure.
const lastResort: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error);
  console.error(error);
  res.status(500).render("error");
};

// The home page. Express 5 forwards a rejected async handler to the error handler by itself.
export const homeRouter = (getWeather: GetWeatherHandler, getFeedPage: GetFeedPageHandler) =>
  Router()
    .get("/", async (req, res) => {
      // Weather and the first feed page are requested together; no address is a lookup that finds nothing.
      const [weather, feed] = await Promise.all([
        getWeather.execute({ ip: req.ip ?? "" }),
        getFeedPage.execute({ page: 1 }),
      ]);
      res.render("home", { weather, feed });
    })
    .use(lastResort);
