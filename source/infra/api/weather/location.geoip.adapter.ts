import geoip, { type GeoipEntry } from "geoip-lite";
import { Latitude, Longitude, type ILocationLocator, type Place } from "@core/local-weather";

// Offline lookup on geoip-lite's bundled data; loopback and private addresses resolve to nothing.
export class GeoipLocationAdapter implements ILocationLocator {
  constructor(private readonly lookup: (ip: string) => GeoipEntry | null = geoip.lookup) {}

  locate(ip: string): Place | null {
    const entry = this.lookup(ip);
    if (!entry) return null;
    const [latitude, longitude] = entry.ll;
    return {
      latitude: Latitude.parse(latitude),
      longitude: Longitude.parse(longitude),
      // The bundled data usually has no city: an empty one means no name.
      name: entry.city || undefined,
    };
  }
}
