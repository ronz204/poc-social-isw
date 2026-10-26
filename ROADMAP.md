# Roadmap

Build progress of poc-social-isw, step by step; it tracks work done, not decisions or contracts (those live in `deltas/` and `.claude/docs/`).

---

## Overview

**Overall progress: 8 / 32 tasks — 25%**

| # | Step | Status | Progress |
|---|---|---|---|
| 1 | [Foundation](#1--foundation) | 🔄 In progress | 3/4 — 75% |
| 2 | [Weather panel](#2--weather-panel) | 🔄 In progress | 1/5 — 20% |
| 3 | [Social feed](#3--social-feed) | 🔄 In progress | 1/5 — 20% |
| 4 | [Live posts](#4--live-posts) | 🔄 In progress | 1/5 — 20% |
| 5 | [Global chat](#5--global-chat) | 🔄 In progress | 1/5 — 20% |
| 6 | [Page shell](#6--page-shell) | 🔄 In progress | 1/4 — 25% |
| 7 | [Delivery](#7--delivery) | 🔲 Not started | 0/4 — 0% |

Status legend: 🔲 Not started · 🔄 In progress · ✅ Done (only once every task under it is checked).

---

## 1 — Foundation

Stack installed and the one open technical risk settled before any slice is built.

- [x] Install `elysia` and `@elysiajs/html` with bun and confirm a minimal server starts and answers one request that renders a TSX/HTML component.
- [x] Fill in the empty `source/env.ts` and `source/boot.ts` so the app reads its config from a committed `.sample` env file and starts through a single entry point that builds the DI container.
- [x] Create the `public/` folder at the repo root and add a `bun build` step that compiles the TypeScript client scripts into static assets the server can serve.
- [ ] Run a short spike of `geoip-lite` under Bun: check that it installs and loads, that a public IP resolves to coordinates, and how its data gets refreshed; then record the provider decision (or the `ip-api.com` fallback) in `structure.md`.

## 2 — Weather panel

Slice: `deltas/weather-panel.spec.md`.

- [x] Write the spec with intent, contract, 12 invariants and acceptance criteria, with the provider choice left open.
- [ ] Write `weather-panel.design.md` with the panel's layout, its states (loading, success, default-location note, unavailable) and the friendly message wording.
- [ ] Write the tests first for each invariant: loopback IP falls back to San José, a failing or malformed weather API yields `unavailable`, and a second call inside the TTL does not hit the API.
- [ ] Implement the location lookup interface with the default fallback, the Open-Meteo reading parsed with a zod schema, and the in-memory TTL cache, then render the weather panel.
- [ ] Run the sentinel check of the spec against the implementation and fix any drift it reports.

## 3 — Social feed

Slice: `deltas/social-feed.spec.md`.

- [x] Specify the slice with intent, the `Post` and `User` shapes, how author is joined to post, and the behavior when the fake-data API fails.
- [ ] Write `social-feed.design.md` with how a post card shows title, content and author, plus the loading, empty and degraded states.
- [ ] Write the tests first for the join of posts to authors, the schema validation of both API responses, and the degraded result on failure.
- [ ] Implement the ofetch calls to `/posts` and `/users`, the mapping to typed shapes, the TTL cache and the rendered feed panel.
- [ ] Run the sentinel check of the spec and the design against the implementation and fix any drift it reports.

## 4 — Live posts

Slice: `deltas/live-posts.spec.md`. Visitor posts are not merged into the feed's list, so their ids never collide with the API's.

- [x] Specify the slice with the server-built post (id, author, content, formatted time), the in-memory history, the broadcast rule and the rate limit, and settle the open merge-with-feed question.
- [ ] Write `live-posts.design.md` with the publish form, the live items as they arrive, and the states for a rejected or rate-limited post.
- [ ] Write the tests first for server-side id and time creation, validation of the incoming event, escaping of visitor text, history on connect and broadcast to all.
- [ ] Implement the WebSocket handler, the in-memory post store, the publish validation with zod, the rate limiting and the client script that sends and renders posts.
- [ ] Run the sentinel check of the spec and the design against the implementation and fix any drift it reports.

## 5 — Global chat

Slice: `deltas/global-chat.spec.md`. Shares the WebSocket transport with live posts.

- [x] Specify the slice with the chat message shape, the history replayed to new connections, the broadcast rule and the rate limit, and check what it shares with live posts.
- [ ] Write `global-chat.design.md` with the chat panel's message list, the input, and the states for empty history and a rejected message.
- [ ] Write the tests first for message validation, escaping of visitor text, history on connect and delivery to every connected client.
- [ ] Implement the chat handler on the shared WebSocket, the in-memory message store, the rate limiting and the client script that sends and renders messages.
- [ ] Run the sentinel check of the spec and the design against the implementation and fix any drift it reports.

## 6 — Page shell

Slice: `deltas/page-shell.spec.md`.

- [x] Write the spec and the design for the three-panel page and for how one failed panel degrades without touching the other two.
- [ ] Build the server-rendered three-panel layout with weather on the left, the feed in the center and the chat on the right, plus the stylesheet.
- [ ] Make each panel load independently so that when one external API is unreachable the page still renders and the matching panel shows its friendly message.
- [ ] Run the sentinel check of the spec and the design against the implementation and fix any drift it reports.

## 7 — Delivery

- [ ] Walk through the done criteria in `approach.md`, including the two-browser live post test and the third browser that receives the history.
- [ ] Write the user manual describing how to run the app and use each panel, as the brief and rubric require.
- [ ] Check the delivery requirements of the brief: the project folder name pattern, the deadline, and that the code is 100% TypeScript.
- [ ] Prepare the oral defense by being able to explain each file line by line and to make a small change live without help.

---

## Adding a new step

Append a new `## N — <name>` section with its own task checklist, add its row to the Overview table, and recompute **Overall** as the new total checked/total across every step. Never mark a step "Done" while an unchecked task remains under it — split the step instead of rounding up.
