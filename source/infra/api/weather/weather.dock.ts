import { token, type Module } from "dockdi";
import { GetWeatherHandler } from "@app/local-weather/get-weather/get-weather.handler";
import type { ILocationLocator, IReadingReader } from "@core/local-weather";
import { GeoipLocationAdapter } from "./location.geoip.adapter";
import { CachedReadingAdapter } from "./reading.cache.adapter";
import { OpenMeteoReadingAdapter } from "./reading.meteo.adapter";

const READING_TTL_MS = 10 * 60 * 1000;

export const LocationLocatorToken = token<ILocationLocator>("LocationLocator");
export const ReadingReaderToken = token<IReadingReader>("ReadingReader");
export const GetWeatherHandlerToken = token<GetWeatherHandler>("GetWeatherHandler");

export const weatherDock: Module = (container) => {
  container.bind(LocationLocatorToken).toFactory(() => new GeoipLocationAdapter()).inSingleton();
  // One cache instance for the whole process, so every visit shares it.
  container
    .bind(ReadingReaderToken)
    .toFactory(() => new CachedReadingAdapter(new OpenMeteoReadingAdapter(), READING_TTL_MS))
    .inSingleton();
  container.bind(GetWeatherHandlerToken).toClass(GetWeatherHandler, [LocationLocatorToken, ReadingReaderToken]);
};
