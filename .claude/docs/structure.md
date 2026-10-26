# Structure

Stack choices and rationale, how the parts communicate, cross-cutting patterns, and decisions still open. There is no persistence layer: all state is process memory (see Cross-cutting patterns).

---

## Stack

The brief names Express, EJS and Axios/fetch; this project deliberately uses a different set, and the teacher has accepted the deviation. The author's reason is much better control of everything; the cost is that the choice must be defensible in the oral defense.

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | Bun | Native TypeScript, built-in WebSocket and bundler; fewer moving parts than a Node toolchain. |
| Web framework | Elysia | Replaces Express. |
| Rendering | Elysia's HTML plugin | Replaces EJS: views are TypeScript, so the "100% TypeScript" requirement covers templates too. |
| HTTP client | ofetch | Replaces Axios/fetch; used for every external API call. |
| Validation | zod | Schemas at every trust boundary (see Cross-cutting patterns). |
| Realtime | Elysia's built-in WebSocket on Bun, one connection per page shared by posts and chat | No separate WebSocket library to justify or configure; one connection carries typed messages instead of one socket per feature. To be confirmed at implementation. |
| Client scripts | TypeScript compiled with `bun build` to static assets | The brief requires client code in TypeScript too. |
| Tests | vitest | Configured to resolve the tsconfig path aliases. |
| DI container | dockdi | Type-first: typed tokens whose dependency tuples the compiler checks, no decorators or reflection. Resolution is synchronous, so async setup happens before the container is built. |
| IP geolocation | geoip-lite | Offline lookup: no network failure and no rate limit. Verified under Bun: installs, loads in about 0.25 s and resolves IPv4, IPv6 and IPv4-mapped IPv6 to coordinates and a timezone. The bundled data is used as shipped, with no license key and no refresh step: it is a snapshot, accurate to country or region level, which is enough to pick a weather location. Loopback and private addresses resolve to nothing, which feeds the default-location fallback. Used behind an interface so the provider can still be swapped. |

The code is split into the domain layer (core), the application layer (use cases) and the infrastructure layer (external calls, in-memory store, views). The domain layer exists because the project has a handful of domain objects worth modeling (posts, chat messages, locations, weather readings), even though it is small.

## Topology

```
browser ──HTTP──▶ Elysia ──ofetch──▶ fake-data API (posts, users)
   ▲                 │    └─ofetch/lib─▶ location lookup ─▶ weather API
   └───WebSocket─────┘
                     └── in-memory store (live posts, chat history)
```

One process, no database, no background workers. The brief's four responsibilities map as follows: external service calls and views live in the infrastructure layer, endpoints are the application layer's entries, and public assets sit in a folder at the repo root beside the source root, not inside it.

## Cross-cutting patterns

| Pattern | Decision | Why |
|---|---|---|
| Authentication | None | Brief requires only a typed name. |
| Input validation | Every external input goes through a schema at the boundary: forms, WebSocket messages, and the fake-data and weather API responses | Untrusted client data and third-party shapes can change or lie; see the rule on boundaries. |
| HTML escaping | All visitor-supplied text is escaped when rendered | Posts and chat are shown to every other visitor, so unescaped text is stored XSS. See the matching rule. |
| Caching | Short-TTL cache of weather and feed responses; invalidated by expiry only | Avoids hitting both free APIs on every page visit. Mechanism undecided. |
| Page error handling | Each external call degrades inside its own panel; a request-level handler is only the last resort and renders a generic error page | A request-level handler cannot render a page with only one panel degraded, so panels must absorb their own failures. |
| Secrets | None required (geoip-lite runs on its bundled data, so no MaxMind key); environment config follows the committed sample file | Both external APIs are keyless. |
| State | Live posts and chat history are plain in-memory collections, shared by every connection to the one process | Required by the brief (no database). A restart empties them, only a single instance is supported (a second would keep its own history and miss the first one's broadcasts), and both histories are bounded to their most recent entries, so memory does not grow without limit. |

## Open architecture decisions

- **Error handling in server-rendered pages.** The pattern is settled (see Page error handling); whether to formalize it as a rule is undecided.
