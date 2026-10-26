import { Elysia } from "elysia";
import type { GetWeatherHandler } from "./get-weather/get-weather.handler";

// Gives a page route the weather for its visitor, so the panel arrives already filled.
export const localWeatherPlugin = (getWeather: GetWeatherHandler) =>
  new Elysia({ name: "local-weather" }).decorate("weatherFor", (ip: string | undefined) =>
    // No address (or an unknown one) is a lookup that finds nothing: the default location.
    getWeather.execute({ ip: ip ?? "" }),
  );
