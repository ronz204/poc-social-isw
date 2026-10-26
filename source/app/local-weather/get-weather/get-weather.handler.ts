import {
  DEFAULT_PLACE,
  type ILocationLocator,
  type IReadingReader,
  type Place,
} from "@core/local-weather";
import type { GetWeatherInput, GetWeatherOutput } from "./get-weather.schema";

// Weather for a client IP; an external failure becomes `unavailable`, never an exception.
export class GetWeatherHandler {
  constructor(
    private readonly locator: ILocationLocator,
    private readonly reader: IReadingReader,
  ) {}

  async execute({ ip }: GetWeatherInput): Promise<GetWeatherOutput> {
    const found = this.locate(ip);
    const place = found ?? DEFAULT_PLACE;
    try {
      const reading = await this.reader.read(place);
      return { status: "ok", location: { ...place, isDefault: found === null }, reading };
    } catch {
      return { status: "unavailable" };
    }
  }

  // A lookup that throws counts as finding nothing.
  private locate(ip: string): Place | null {
    try {
      return this.locator.locate(ip);
    } catch {
      return null;
    }
  }
}
