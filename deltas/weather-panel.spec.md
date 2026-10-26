# Weather panel — Spec

> Resolves the visitor's approximate location from their IP and returns the current temperature and wind speed there, degrading to a default location or an unavailable result instead of ever failing the page.

## Intent

A visitor should see the weather where they approximately are, with no input from them. The weather is a nice-to-have ingredient of the page: a missing location or a dead weather API must never block or break the feed and chat beside it.

## Scope

Owns:

- Looking up coordinates from a client IP, behind an interface so the provider can be swapped.
- The fixed default location used when the lookup yields nothing.
- Reading the current weather from the weather API (Open-Meteo) by coordinates.
- A short-TTL in-memory cache of weather readings.
- The "unavailable" outcome that the view turns into a friendly message.

Non-goals:

- Forecasts or weather history; only the current reading.
- A user-chosen location or a manual city search.
- Browser (client-side) geolocation.
- Persistence of any kind.
- Layout, states and wording of the panel: a future `weather-panel.design.md`.
- How a degraded weather panel sits next to the other panels: the page-shell slice.

## Contract

Use case: get the weather for a client IP. It orchestrates the location lookup and the weather reading, both inside this one slice.

| Part | Shape |
|---|---|
| Input | The client IP address of the request. |
| Location | Coordinates (latitude, longitude), an optional place name, and an `isDefault` flag. |
| Weather reading | Temperature in °C and wind speed in km/h. |
| Output, success | A location plus a reading. |
| Output, failure | An `unavailable` result. The use case does not throw for any external failure. |
| Default location | San José, Costa Rica: latitude 9.93, longitude -84.08. |

The weather API is queried with coordinates only, never with a city name. A lookup that finds nothing is a normal outcome, not an error.

## Invariants

1. When the client IP is loopback or private, or the lookup finds no location, the system uses the default location. [test: testing/app/local-weather/get-weather.handler.test.ts "uses default when lookup finds nothing"]
2. When the default location is used, the result carries `isDefault` true so the view can say it is a default. [test: testing/app/local-weather/get-weather.handler.test.ts "uses default when lookup finds nothing"]
3. When the lookup finds a location, the result carries `isDefault` false. [test: testing/app/local-weather/get-weather.handler.test.ts "uses found coordinates when lookup resolves"]
4. If the location lookup throws, then the system uses the default location instead of failing the weather. [test: testing/app/local-weather/get-weather.handler.test.ts "falls back to default when lookup throws"]
5. The weather API is always queried with coordinates, never with a place name. [test: testing/infra/api/weather/reading.meteo.adapter.test.ts "queries by coordinates only"]
6. If the weather API fails, times out, or answers with a shape that fails its schema, then the use case returns `unavailable` instead of throwing. [test: testing/app/local-weather/get-weather.handler.test.ts "unavailable on any other failure"]
7. The weather API response is parsed with a schema at the boundary before any field is used. [test: testing/infra/api/weather/reading.meteo.adapter.test.ts "rejects a malformed payload"]
8. While a cached reading for the same coordinates is younger than the TTL, the system does not call the weather API again. [test: testing/infra/api/weather/reading.cache.adapter.test.ts "reads once inside the TTL"]
9. A cached reading leaves the cache only by expiry. [test: testing/infra/api/weather/reading.cache.adapter.test.ts "keeps a reading until expiry"]
10. The temperature in a reading is in °C. [test: testing/infra/api/weather/reading.meteo.adapter.test.ts "requests Celsius"]
11. The wind speed in a reading is in km/h. [test: testing/infra/api/weather/reading.meteo.adapter.test.ts "requests km/h"]
12. Where the lookup provides a place name, the location carries it; otherwise the location has no name. [test: testing/app/local-weather/get-weather.handler.test.ts "carries the place name"]

## Deferred / Open questions

- **Geolocation data quality.** `geoip-lite` is the settled provider (verified under Bun) and runs on its bundled data without a refresh. That data usually carries coordinates and a timezone but no city name, so most locations have no name (invariant 12) and the panel must not depend on one.
- **TTL value and cache mechanism.** About 10 minutes is the proposal; the mechanism is undecided. Decide when implementing.
- **Caching failures.** Proposed: an `unavailable` result is not cached, so a recovered API shows up on the next visit. Not confirmed; decide when implementing and then promote it to an invariant.
- **Weather API timeout.** The value is undecided; it must be short enough that a hung API cannot stall the page render.

## Acceptance criteria

- Given a loopback client IP, when the weather is requested, then the result is San José with `isDefault` true. [test: testing/app/local-weather/get-weather.handler.test.ts "uses default when lookup finds nothing"]
- Given a public IP the lookup resolves, when the weather is requested, then the result uses those coordinates with `isDefault` false. [test: testing/app/local-weather/get-weather.handler.test.ts "uses found coordinates when lookup resolves"]
- Given the weather API is down, when the weather is requested, then the result is `unavailable` and nothing throws. [test: testing/app/local-weather/get-weather.handler.test.ts "unavailable on reading error"]
- Given the weather API answers a malformed payload, when the weather is requested, then the result is `unavailable`. [test: testing/infra/api/weather/reading.meteo.adapter.test.ts "rejects a malformed payload"]
- Given two requests for the same coordinates within the TTL, when both run, then the weather API is called once. [test: testing/infra/api/weather/reading.cache.adapter.test.ts "reads once inside the TTL"]
- Given a cached reading older than the TTL, when the weather is requested, then the weather API is called again. [test: testing/infra/api/weather/reading.cache.adapter.test.ts "reads again after the TTL"]

---

Last updated: 2026-10-26.
