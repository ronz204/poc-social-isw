import { describe, expect, it } from "vitest";
import { CachedReadingAdapter } from "@infra/api/weather/reading.cache.adapter";
import {
  Latitude,
  Longitude,
  ReadingError,
  Temperature,
  WindSpeed,
  type IReadingReader,
  type Place,
  type WeatherReading,
} from "@core/local-weather";

const TTL = 10 * 60 * 1000;
const reading: WeatherReading = { temperature: Temperature.parse(24.5), windSpeed: WindSpeed.parse(12) };
const sanJose: Place = { latitude: Latitude.parse(9.93), longitude: Longitude.parse(-84.08) };
const madrid: Place = { latitude: Latitude.parse(40.4), longitude: Longitude.parse(-3.7) };

// An inner reader that counts how often it is called and answers like the given function.
const setup = (answer: () => Promise<WeatherReading> = async () => reading) => {
  let calls = 0;
  let clock = 0;
  const inner: IReadingReader = {
    read: async () => {
      calls++;
      return answer();
    },
  };
  const cache = new CachedReadingAdapter(inner, TTL, () => clock);
  return { cache, calls: () => calls, advance: (ms: number) => (clock += ms) };
};

describe("CachedReadingAdapter", () => {
  it("calls the inner reader once for two reads of the same coordinates inside the TTL", async () => {
    const { cache, calls, advance } = setup();

    const first = await cache.read(sanJose);
    advance(TTL - 1);
    const second = await cache.read(sanJose);

    expect(calls()).toBe(1);
    expect(second).toEqual(first);
  });

  it("calls the inner reader again once the cached reading is as old as the TTL", async () => {
    const { cache, calls, advance } = setup();

    await cache.read(sanJose);
    advance(TTL);
    await cache.read(sanJose);

    expect(calls()).toBe(2);
  });

  it("keeps a reading until it expires, whatever else is read meanwhile", async () => {
    const { cache, calls, advance } = setup();

    await cache.read(sanJose);
    advance(TTL / 2);
    await cache.read(madrid);
    advance(TTL / 4);
    await cache.read(sanJose);

    expect(calls()).toBe(2);
  });

  it("caches each pair of coordinates separately", async () => {
    const { cache, calls } = setup();

    await cache.read(sanJose);
    await cache.read(madrid);

    expect(calls()).toBe(2);
  });

  it("does not cache a failure, so a recovered API shows up on the next read", async () => {
    let failing = true;
    const { cache, calls } = setup(async () => {
      if (failing) throw new ReadingError("reading_unavailable");
      return reading;
    });

    await expect(cache.read(sanJose)).rejects.toBeInstanceOf(ReadingError);
    failing = false;

    await expect(cache.read(sanJose)).resolves.toEqual(reading);
    expect(calls()).toBe(2);
  });
});
