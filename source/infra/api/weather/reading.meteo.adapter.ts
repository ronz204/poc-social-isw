import { ofetch } from "ofetch";
import { z } from "zod";
import {
  ReadingError,
  Temperature,
  WindSpeed,
  type IReadingReader,
  type Place,
  type WeatherReading,
} from "@core/local-weather";

export type Fetcher = (
  url: string,
  options: { query: Record<string, string | number>; timeout: number },
) => Promise<unknown>;

const URL = "https://api.open-meteo.com/v1/forecast";
const TIMEOUT_MS = 3000;

const responseSchema = z.object({
  current: z.object({ temperature_2m: z.number(), wind_speed_10m: z.number() }),
});

// Reads the current weather from Open-Meteo by coordinates; every failure is a ReadingError.
export class OpenMeteoReadingAdapter implements IReadingReader {
  constructor(private readonly fetcher: Fetcher = ofetch) {}

  async read(place: Place): Promise<WeatherReading> {
    const query = {
      latitude: place.latitude,
      longitude: place.longitude,
      current: "temperature_2m,wind_speed_10m",
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
    };
    try {
      const payload = await this.fetcher(URL, { query, timeout: TIMEOUT_MS });
      const { current } = responseSchema.parse(payload);
      return {
        temperature: Temperature.parse(current.temperature_2m),
        windSpeed: WindSpeed.parse(current.wind_speed_10m),
      };
    } catch {
      throw new ReadingError("reading_unavailable");
    }
  }
}
