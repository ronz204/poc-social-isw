import { token, type Module } from "dockdi";
import { GetWeatherHandler } from "@app/local-weather/get-weather/get-weather.handler";
import type { ILocationLocator, IReadingReader } from "@core/local-weather";
import { GeoipLocationAdapter } from "../api/weather/location.geoip.adapter";
import { CachedReadingAdapter } from "../api/weather/reading.cache.adapter";
import { OpenMeteoReadingAdapter } from "../api/weather/reading.meteo.adapter";

const READING_TTL_MS = 10 * 60 * 1000;

export class WeatherDock {
  // tokens
  static readonly locationLocator = token<ILocationLocator>("WeatherDock.locationLocator");
  static readonly readingReader = token<IReadingReader>("WeatherDock.readingReader");
  static readonly getWeather = token<GetWeatherHandler>("WeatherDock.getWeather");

  // module
  static readonly module: Module = (container) => {
    container.bind(WeatherDock.locationLocator).toFactory(() => new GeoipLocationAdapter()).inSingleton();
    container
      .bind(WeatherDock.readingReader)
      .toFactory(() => new CachedReadingAdapter(new OpenMeteoReadingAdapter(), READING_TTL_MS))
      .inSingleton();
    container
      .bind(WeatherDock.getWeather)
      .toClass(GetWeatherHandler, [WeatherDock.locationLocator, WeatherDock.readingReader]);
  };
}
