const messages = {
  invalid_latitude: "Latitude must be a number between -90 and 90",
  invalid_longitude: "Longitude must be a number between -180 and 180",
} as const;

export type LocationErrorCode = keyof typeof messages;

export class LocationError extends Error {
  constructor(readonly code: LocationErrorCode) {
    super(messages[code]);
    this.name = "LocationError";
  }
}
