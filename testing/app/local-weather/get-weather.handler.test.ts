import { describe, expect, it } from "vitest";
import { GetWeatherHandler } from "@app/local-weather/get-weather/get-weather.handler";
import {
  DEFAULT_PLACE,
  Latitude,
  Longitude,
  ReadingError,
  Temperature,
  WindSpeed,
  type ILocationLocator,
  type IReadingReader,
  type Place,
  type WeatherReading,
} from "@core/local-weather";

const reading: WeatherReading = { temperature: Temperature.parse(24.5), windSpeed: WindSpeed.parse(12) };
const madrid: Place = { latitude: Latitude.parse(40.4), longitude: Longitude.parse(-3.7) };

const locatorReturning = (place: Place | null): ILocationLocator => ({ locate: () => place });

// Records every place it is asked about, then answers like the given function.
const readerStub = (answer: () => Promise<WeatherReading>) => {
  const calls: Place[] = [];
  const reader: IReadingReader = {
    read: async (place) => {
      calls.push(place);
      return answer();
    },
  };
  return { reader, calls };
};

describe("GetWeatherHandler", () => {
  it("uses the default location, flagged as default, when the lookup finds nothing", async () => {
    const { reader, calls } = readerStub(async () => reading);

    const result = await new GetWeatherHandler(locatorReturning(null), reader).execute({ ip: "127.0.0.1" });

    expect(result).toEqual({
      status: "ok",
      location: { ...DEFAULT_PLACE, isDefault: true },
      reading,
    });
    expect(calls).toEqual([DEFAULT_PLACE]);
  });

  it("uses the found coordinates, flagged as not default, when the lookup resolves", async () => {
    const { reader, calls } = readerStub(async () => reading);

    const result = await new GetWeatherHandler(locatorReturning(madrid), reader).execute({ ip: "8.8.8.8" });

    expect(result).toEqual({ status: "ok", location: { ...madrid, isDefault: false }, reading });
    expect(calls).toEqual([madrid]);
  });

  it("falls back to the default location when the lookup throws", async () => {
    const locator: ILocationLocator = {
      locate: () => {
        throw new Error("lookup exploded");
      },
    };
    const { reader } = readerStub(async () => reading);

    const result = await new GetWeatherHandler(locator, reader).execute({ ip: "8.8.8.8" });

    expect(result).toMatchObject({ status: "ok", location: { isDefault: true } });
  });

  it("carries the place name when the lookup provides one", async () => {
    const named: Place = { ...madrid, name: "Madrid" };
    const { reader } = readerStub(async () => reading);

    const result = await new GetWeatherHandler(locatorReturning(named), reader).execute({ ip: "8.8.8.8" });

    expect(result).toMatchObject({ status: "ok", location: { name: "Madrid" } });
  });

  it("leaves the name out when the lookup provides none", async () => {
    const { reader } = readerStub(async () => reading);

    const result = await new GetWeatherHandler(locatorReturning(madrid), reader).execute({ ip: "8.8.8.8" });

    expect(result.status === "ok" && result.location.name).toBeUndefined();
  });

  it("returns unavailable when the reader fails with a reading error", async () => {
    const { reader } = readerStub(async () => {
      throw new ReadingError("reading_unavailable");
    });

    await expect(new GetWeatherHandler(locatorReturning(madrid), reader).execute({ ip: "8.8.8.8" })).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("returns unavailable, without throwing, when the reader fails with anything else", async () => {
    const { reader } = readerStub(async () => {
      throw new TypeError("unexpected");
    });

    await expect(new GetWeatherHandler(locatorReturning(madrid), reader).execute({ ip: "8.8.8.8" })).resolves.toEqual({
      status: "unavailable",
    });
  });
});
