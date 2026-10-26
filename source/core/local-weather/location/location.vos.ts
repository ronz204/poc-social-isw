import { LocationError } from "./location.errors";

type LatitudeBrand = number & { readonly __brand: "Latitude" };
type LongitudeBrand = number & { readonly __brand: "Longitude" };

const isLatitude = (value: unknown): value is LatitudeBrand =>
  typeof value === "number" && value >= -90 && value <= 90;

const isLongitude = (value: unknown): value is LongitudeBrand =>
  typeof value === "number" && value >= -180 && value <= 180;

export const Latitude = {
  kind: "Latitude",
  parse(value: number): LatitudeBrand {
    if (!isLatitude(value)) throw new LocationError("invalid_latitude");
    return value;
  },
  is: isLatitude,
};
export type Latitude = ReturnType<typeof Latitude.parse>;

export const Longitude = {
  kind: "Longitude",
  parse(value: number): LongitudeBrand {
    if (!isLongitude(value)) throw new LocationError("invalid_longitude");
    return value;
  },
  is: isLongitude,
};
export type Longitude = ReturnType<typeof Longitude.parse>;

// Coordinates the lookup found, with a place name only when the provider has one.
export interface Place {
  readonly latitude: Latitude;
  readonly longitude: Longitude;
  readonly name?: string;
}

export interface Location extends Place {
  readonly isDefault: boolean;
}

// San José, Costa Rica: used when the lookup finds nothing.
export const DEFAULT_PLACE: Place = {
  latitude: Latitude.parse(9.93),
  longitude: Longitude.parse(-84.08),
  name: "San José",
};
