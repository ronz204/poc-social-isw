import { ReadingError } from "./reading.errors";

type TemperatureBrand = number & { readonly __brand: "Temperature" };
type WindSpeedBrand = number & { readonly __brand: "WindSpeed" };

const isTemperature = (value: unknown): value is TemperatureBrand =>
  typeof value === "number" && Number.isFinite(value);

const isWindSpeed = (value: unknown): value is WindSpeedBrand =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

// In degrees Celsius.
export const Temperature = {
  kind: "Temperature",
  parse(value: number): TemperatureBrand {
    if (!isTemperature(value)) throw new ReadingError("invalid_temperature");
    return value;
  },
  is: isTemperature,
};
export type Temperature = ReturnType<typeof Temperature.parse>;

// In kilometres per hour.
export const WindSpeed = {
  kind: "WindSpeed",
  parse(value: number): WindSpeedBrand {
    if (!isWindSpeed(value)) throw new ReadingError("invalid_wind_speed");
    return value;
  },
  is: isWindSpeed,
};
export type WindSpeed = ReturnType<typeof WindSpeed.parse>;

export interface WeatherReading {
  readonly temperature: Temperature;
  readonly windSpeed: WindSpeed;
}
