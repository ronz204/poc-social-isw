import { describe, expect, it } from "vitest";
import { OpenMeteoReadingAdapter, type Fetcher } from "@infra/api/weather/reading.meteo.adapter";
import { Latitude, Longitude, ReadingError, type Place } from "@core/local-weather";

const sanJose: Place = { latitude: Latitude.parse(9.93), longitude: Longitude.parse(-84.08), name: "San José" };

type Call = { url: string; options: Parameters<Fetcher>[1] };

// Answers every request with the given payload (or failure) and records what was asked.
const fetcherStub = (answer: () => unknown) => {
  const calls: Call[] = [];
  const fetcher: Fetcher = async (url, options) => {
    calls.push({ url, options });
    return answer();
  };
  return { fetcher, calls };
};

const okPayload = { current: { temperature_2m: 24.5, wind_speed_10m: 12.3 } };

describe("OpenMeteoReadingAdapter", () => {
  it("parses the current temperature and wind speed", async () => {
    const { fetcher } = fetcherStub(() => okPayload);

    const reading = await new OpenMeteoReadingAdapter(fetcher).read(sanJose);

    expect(reading).toEqual({ temperature: 24.5, windSpeed: 12.3 });
  });

  it("queries by coordinates only", async () => {
    const { fetcher, calls } = fetcherStub(() => okPayload);

    await new OpenMeteoReadingAdapter(fetcher).read(sanJose);

    const [call] = calls;
    expect(call?.options.query).toMatchObject({ latitude: 9.93, longitude: -84.08 });
    expect(JSON.stringify(call)).not.toContain("San");
  });

  it("requests Celsius", async () => {
    const { fetcher, calls } = fetcherStub(() => okPayload);

    await new OpenMeteoReadingAdapter(fetcher).read(sanJose);

    expect(calls[0]?.options.query).toMatchObject({ temperature_unit: "celsius" });
  });

  it("requests km/h", async () => {
    const { fetcher, calls } = fetcherStub(() => okPayload);

    await new OpenMeteoReadingAdapter(fetcher).read(sanJose);

    expect(calls[0]?.options.query).toMatchObject({ wind_speed_unit: "kmh" });
  });

  it("sets a short timeout", async () => {
    const { fetcher, calls } = fetcherStub(() => okPayload);

    await new OpenMeteoReadingAdapter(fetcher).read(sanJose);

    expect(calls[0]?.options.timeout).toBe(3000);
  });

  it("fails on request error or timeout", async () => {
    const { fetcher } = fetcherStub(() => {
      throw new Error("network down");
    });

    await expect(new OpenMeteoReadingAdapter(fetcher).read(sanJose)).rejects.toMatchObject({
      constructor: ReadingError,
      code: "reading_unavailable",
    });
  });

  it.each([
    ["not an object", "oops"],
    ["null", null],
    ["no current block", {}],
    ["temperature missing", { current: { wind_speed_10m: 1 } }],
    ["temperature as text", { current: { temperature_2m: "warm", wind_speed_10m: 1 } }],
    ["wind speed missing", { current: { temperature_2m: 20 } }],
  ])("rejects a malformed payload: %s", async (_label, payload) => {
    const { fetcher } = fetcherStub(() => payload);

    await expect(new OpenMeteoReadingAdapter(fetcher).read(sanJose)).rejects.toMatchObject({
      constructor: ReadingError,
      code: "reading_unavailable",
    });
  });
});
