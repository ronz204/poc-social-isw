# Structure

Stack choices and rationale, how the parts communicate, cross-cutting patterns, and decisions still open. There is no persistence layer: all state is process memory (see Cross-cutting patterns).

---

## Stack

The brief names Express, EJS and Axios/fetch; this project deliberately uses a different set, and the teacher has accepted the deviation. The author's reason is much better control of everything; the cost is that the choice must be defensible in the oral defense.

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | Bun | Native TypeScript, built-in WebSocket and bundler; fewer moving parts than a Node toolchain. |
| Web framework | Elysia | Replaces Express. To be installed; not in the manifest yet. |
| Rendering | `@elysiajs/html` | Replaces EJS: views are TypeScript, so the "100% TypeScript" requirement covers templates too. To be installed. |
| HTTP client | ofetch | Replaces Axios/fetch; used for every external API call. |
| Validation | zod | Schemas at every trust boundary (see Cross-cutting patterns). |
| Realtime | Elysia's built-in WebSocket on Bun | No separate WebSocket library to justify or configure. To be confirmed at implementation. |
| Client scripts | TypeScript compiled with `bun build` to static assets | The brief requires client code in TypeScript too. |
| Tests | vitest | Configured to resolve the tsconfig path aliases. |
| DI container | dockdi | Type-first: typed tokens whose dependency tuples the compiler checks, no decorators or reflection. Resolution is synchronous, so async setup happens before the container is built. |
| IP geolocation | geoip-lite | Offline lookup: no network failure and no rate limit. To be installed. It doesn't ship current data, so the data must be refreshed after install with a MaxMind license key. Used behind an interface so the provider can still be swapped. |

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
| Rate limiting | Applied to publish and chat events | Any visitor can broadcast to all; limits flooding. Mechanism undecided. |
| Secrets | None required; environment config follows the committed sample file | Both external APIs are keyless. |
| State | Live posts and chat history are plain in-memory collections, shared by every connection to the one process | Required by the brief (no database). A restart empties them, only a single instance is supported (a second would keep its own history and miss the first one's broadcasts), and both histories are bounded to their most recent entries, so memory does not grow without limit. |

## Open architecture decisions

- **geoip-lite under Bun.** The library is chosen, but its compatibility with Bun is not verified, and the data-refresh step (license key, where the key lives, whether the data is committed) is not decided. A short spike under Bun settles both; if it fails, ip-api.com (HTTP only on the free tier, 45 requests per minute, non-commercial) is the fallback behind the same interface.
- **Error handling in server-rendered pages.** The brief requires a try/catch around each external call with a friendly message in the view. An Elysia error handler is request-level, so it cannot render a page with only the weather panel degraded; per-call degradation is needed for the panels, while the global handler can remain the last-resort fallback. Whether to formalize this as a rule is undecided.
