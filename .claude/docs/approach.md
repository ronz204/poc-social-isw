# Approach

What the project must support, how to tell it is done, and what could derail it. Why it exists lives in overview.md; the exact requirements and rubric live in the assignment brief at the repo root.

---

## Functional scope

- Server-rendered three-panel page: weather, feed, chat.
- Feed from the fake-data API's posts and users, mapped to typed `Post` and `User` shapes, showing title, content and author name.
- Current temperature and wind speed for the visitor's IP-derived location, with a fixed default for local development.
- Publish a post with a name and a text; the server builds the stored object and broadcasts it; new connections receive the history.
- Global chat that works across clients.
- Friendly degraded UI when the fake-data API or the weather API fails; the app never collapses.
- Beyond the brief, confirmed: short-TTL caching of weather and feed, and rate limiting of publish and chat.
- A user manual.

## Roadmap

Not defined yet. The first step is this knowledge base; the order of the rest is decided slice by slice, by the author.

## Risks

- **Stack not confirmed with the teacher.** The rubric names Express, EJS and Axios/fetch in its own wording (items 5, 6 and 7); Elysia, `@elysiajs/html` and ofetch are assumed acceptable. Confirming before building avoids losing those points.
- **Geolocation library under Bun.** Compatibility of the preferred offline library is unverified.
- **Oral defense.** Code the author cannot explain line by line scores zero, so any generated code needs to be understood and adapted before it stays.

## Done criteria

- Every item of the brief's checklist is met, or its deviation is a recorded decision.
- With one external API made unreachable, the page still renders and shows a friendly message in the matching panel.
- A post published in one browser appears in a second one without reload, and a third browser opened afterwards receives it as history.
- Delivery follows the brief's naming and deadline requirements.
