const messages = {
  invalid_temperature: "Temperature must be a finite number",
  invalid_wind_speed: "Wind speed must be a finite number of zero or more",
  reading_unavailable: "The weather reading could not be obtained",
} as const;

export type ReadingErrorCode = keyof typeof messages;

export class ReadingError extends Error {
  constructor(readonly code: ReadingErrorCode) {
    super(messages[code]);
    this.name = "ReadingError";
  }
}
