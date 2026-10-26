import type { IReadingReader, Place, WeatherReading } from "@core/local-weather";

interface Entry {
  readonly reading: WeatherReading;
  readonly storedAt: number;
}

// Remembers readings per coordinates; a reading leaves only by expiry and failures are never stored.
export class CachedReadingAdapter implements IReadingReader {
  private readonly entries = new Map<string, Entry>();

  constructor(
    private readonly inner: IReadingReader,
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  async read(place: Place): Promise<WeatherReading> {
    const key = `${place.latitude},${place.longitude}`;
    const cached = this.entries.get(key);
    if (cached && this.now() - cached.storedAt < this.ttlMs) return cached.reading;

    const reading = await this.inner.read(place);
    this.entries.set(key, { reading, storedAt: this.now() });
    return reading;
  }
}
