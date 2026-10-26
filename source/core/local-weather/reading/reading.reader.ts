import type { Place } from "../location/location.vos";
import type { WeatherReading } from "./reading.vos";

// Reads the current weather at a place; fails only with a ReadingError.
export interface IReadingReader {
  read(place: Place): Promise<WeatherReading>;
}
