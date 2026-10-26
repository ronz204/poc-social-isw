import { describe, expect, it } from "vitest";
import { GeoipLocationAdapter } from "@infra/api/weather/location.geoip.adapter";

describe("GeoipLocationAdapter", () => {
  it("resolves a public IP", () => {
    const place = new GeoipLocationAdapter().locate("8.8.8.8");

    expect(typeof place?.latitude).toBe("number");
    expect(typeof place?.longitude).toBe("number");
  });

  it.each(["127.0.0.1", "::1", "192.168.1.10", "10.0.0.5", "not-an-ip"])(
    "finds nothing for %s",
    (ip) => {
      expect(new GeoipLocationAdapter().locate(ip)).toBeNull();
    },
  );

  it("carries the city as name", () => {
    const adapter = new GeoipLocationAdapter(() => ({ ll: [40.4, -3.7], city: "Madrid" }));

    expect(adapter.locate("1.2.3.4")?.name).toBe("Madrid");
  });

  it("leaves the name out without a city", () => {
    const adapter = new GeoipLocationAdapter(() => ({ ll: [40.4, -3.7], city: "" }));

    expect(adapter.locate("1.2.3.4")?.name).toBeUndefined();
  });
});
