# Structure

Stack choices and rationale, how the parts communicate, cross-cutting patterns, and decisions still open. Persistence is in database.md.

---

## Stack

The brief names Express, EJS and Axios/fetch; this project deliberately uses a different set. The author's reason is much better control of everything; the cost is that the choice must be defensible in the oral defense.

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
| DI container | dockdi | Installed; its role is not decided yet (see Open decisions). |

Import aliases are limited to the application layer and the infrastructure layer (plus the env module); there is deliberately no domain layer alias, because posts, messages and weather are simple data shapes with no domain behavior to model. The tsconfig still lists a core alias that is pending removal.

## Topology

```
browser ──HTTP──▶ Elysia ──ofetch──▶ fake-data API (posts, users)
   ▲                 │    └─ofetch/lib─▶ location lookup ─▶ weather API
   └───WebSocket─────┘
                     └── in-memory store (live posts, chat history)
```

One process, no database, no background workers. The brief's four responsibilities (service calls, endpoints, templates, public assets) map to the application and infrastructure layers; where views and public assets live under the source root is not decided yet.

## Cross-cutting patterns

| Pattern | Decision | Why |
|---|---|---|
| Authentication | None | Brief requires only a typed name. |
| Input validation | Every external input goes through a schema at the boundary: forms, WebSocket messages, and the fake-data and weather API responses | Untrusted client data and third-party shapes can change or lie; see the rule on boundaries. |
| HTML escaping | All visitor-supplied text is escaped when rendered | Posts and chat are shown to every other visitor, so unescaped text is stored XSS. See the matching rule. |
| Caching | Short-TTL cache of weather and feed responses; invalidated by expiry only | Avoids hitting both free APIs on every page visit. Mechanism undecided. |
| Rate limiting | Applied to publish and chat events | Any visitor can broadcast to all; limits flooding. Mechanism undecided. |
| Secrets | None required; environment config follows the committed sample file | Both external APIs are keyless. |

## Open architecture decisions

- **IP geolocation.** Leaning toward `geoip-lite` (offline, no rate limit, no network failure) behind an interface so it can be swapped for ip-api.com (free tier is HTTP only, 45 requests per minute, non-commercial). Bun compatibility of `geoip-lite` is not verified, and a search for a more modern option was inconclusive (an offline ip2region reader and several hosted APIs surfaced, with conflicting limits and nothing verified).
- **Error handling in server-rendered pages.** The brief requires a try/catch around each external call with a friendly message in the view. An Elysia error handler is request-level, so it cannot render a page with only the weather panel degraded; per-call degradation is needed for the panels, while the global handler can remain the last-resort fallback. Whether to formalize this as a rule is undecided.
- **Stack deviation from the brief.** The rubric names Express, EJS and Axios/fetch literally; whether the teacher accepts Elysia, `@elysiajs/html` and ofetch is assumed from the author's stated latitude, not confirmed.
- **Live posts vs. fetched posts.** Whether visitor posts merge into the same feed list as the fake-data API's posts, and how their ids avoid colliding with the API's numeric ids.
- **Where views and public assets live** under the source root, and what the dependency-injection container is used for, if anything.
