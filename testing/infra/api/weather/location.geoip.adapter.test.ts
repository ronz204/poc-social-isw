import { describe, expect, it } from "vitest";
import { GeoipLocationAdapter } from "@infra/api/weather/location.geoip.adapter";

describe("GeoipLocationAdapter", () => {
  it("resolves a public IP to coordinates from the bundled data", () => {
    const place = new GeoipLocationAdapter().locate("8.8.8.8");

    expect(typeof place?.latitude).toBe("number");
    expect(typeof place?.longitude).toBe("number");
  });

  it.each(["127.0.0.1", "::1", "192.168.1.10", "10.0.0.5", "not-an-ip"])(
    "finds nothing for loopback, private or invalid address %s",
    (ip) => {
      expect(new GeoipLocationAdapter().locate(ip)).toBeNull();
    },
  );

  it("carries the city as the place name when the provider has one", () => {
    const adapter = new GeoipLocationAdapter(() => ({ ll: [40.4, -3.7], city: "Madrid" }));

    expect(adapter.locate("1.2.3.4")?.name).toBe("Madrid");
  });

  it("leaves the name out when the provider has no city", () => {
    const adapter = new GeoipLocationAdapter(() => ({ ll: [40.4, -3.7], city: "" }));

    expect(adapter.locate("1.2.3.4")?.name).toBeUndefined();
  });
});
