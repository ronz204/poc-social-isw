# Expertise

Mechanisms where a misunderstanding would cause a mistake here. Only one is confirmed so far; mechanisms of the not-yet-installed framework and the external APIs are added after they are verified at implementation, not from memory.

---

## IP geolocation and loopback addresses

An IP-to-location lookup maps a public address to an approximate place, usually at city level and often wrong at that precision. Loopback (`127.0.0.1`, `::1`) and private-network addresses are not in any geolocation database, so they return nothing useful. Consequences for this project:

- In local development every request looks like loopback, so a lookup can never succeed; the location must fall back to a fixed default and the UI must say so.
- A "no result" from the lookup is a normal outcome, not an error to surface as a failure.
- The coordinates, not the city name, are what the weather API consumes.
