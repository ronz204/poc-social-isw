# Page Shell — Spec

> Assembles the home page from the weather, feed and chat panels, keeps an external API failure inside its own panel, and owns the single client WebSocket connection.

## Intent

The home page is one server-rendered page with three panels. An external API failing in one panel never takes down the page or the other panels, and live posts and chat reach the page through one shared connection.

## Scope

Owns:

- The page-load orchestration across the weather-panel and social-feed slices: starting both requests together and isolating their failures. Neither slice has this guarantee alone.
- The three panels always being present in the page.
- The last-resort fallback for a failure outside any panel.
- The client side of the WebSocket: opening the one connection, reconnecting, and routing incoming messages by `type` to the posts list or the chat list.

Non-goals:

- What each panel shows and how it behaves: the weather-panel, social-feed, live-posts and global-chat slices own that.
- Accounts, navigation and client-side routing.
- Live history in the page HTML: history arrives over the WebSocket only.
- Layout, states and interactions: see the page-shell design file.

## Contract

| Item | Value |
|---|---|
| Page load | One request for the home page; the server asks for the weather (by the client IP) and the first page of the feed together, each with its own failure outcome, then renders the three panels |
| Panels | Weather, feed and chat, all present in the HTML whatever the outcomes |
| Degradation | An external-data panel shows its data or its friendly message, as its own slice's outcome says (weather `unavailable`, feed friendly message) |
| Client socket | One connection per page; each message goes to the posts list or the chat list by its `type` |
| Reconnect | After an unexpected close, the client retries after 1 s, doubling the wait each failed attempt up to 10 s, and starting over once open; once reconnected, the server sends both histories again and they replace the lists |

The endpoint and message envelope are decided by the live-posts and global-chat slices. This slice owns the client side: the connection and the routing by `type`.

## Invariants

1. When the home page is requested, the server starts the weather and feed requests without waiting for one to finish before starting the other. [test: testing/infra/views/home.route.test.ts "starts the feed request without waiting for the weather one"]
2. If the weather outcome is `unavailable`, then the page still renders the feed and chat panels and the weather panel shows its friendly message. [test: testing/infra/views/home.route.test.ts "keeps the feed and chat panels when the weather is unavailable"]
3. If the feed fails, then the page still renders the weather and chat panels and the feed panel shows its friendly message. [test: testing/infra/views/home.route.test.ts "keeps the weather and chat panels when the feed fails"]
4. If both external APIs fail, then the page still answers with status 200 and the three panels. [test: testing/infra/views/home.route.test.ts "answers 200 with the three panels when both APIs fail"]
5. The home page always contains the three panels, whatever the data outcomes. [test: testing/infra/views/home.route.test.ts "always contains the three panels when the data is fine"]
6. If a failure happens outside the per-panel handling, then the visitor sees a generic friendly error page instead of a stack trace. [test: testing/infra/views/home.route.test.ts "shows a friendly error page, not a stack trace, when something outside the panels fails"]
7. The home page HTML never embeds live posts or chat history. [test: testing/infra/views/home.route.test.ts "leaves the live lists empty in the HTML: history arrives over the socket"]
8. When the WebSocket closes unexpectedly, the client retries with a growing wait until it reconnects. [test: testing/infra/client/connection.test.ts "retries with a growing wait after an unexpected close, until it reconnects"]
9. When a socket message arrives, the client routes it by `type` to exactly one of the posts list or the chat list, and ignores an unknown type. [test: testing/infra/client/connection.test.ts "routes each message to exactly one of the posts or the chat listener"]
10. When a history message arrives, the client replaces the content of that list instead of adding to it, so a history re-sent after a reconnect shows no item twice. [test: testing/infra/client/history.test.tsx]

## Deferred / Open questions

- Client-script tests run in a simulated DOM, not a real browser; the layout and header status are verified by the design's manual criteria.

## Acceptance criteria

1. Given the weather API is down and the feed API is up, when the home page loads, then it answers 200, the weather panel shows its message and the feed lists posts. [test: testing/infra/views/home.route.test.ts "keeps the feed and chat panels when the weather is unavailable"]
2. Given the feed API is down and the weather API is up, when the home page loads, then it answers 200, the feed panel shows its message and the weather panel shows the reading. [test: testing/infra/views/home.route.test.ts "keeps the weather and chat panels when the feed fails"]
3. Given both APIs are down, when the home page loads, then it answers 200 with the three panels. [test: testing/infra/views/home.route.test.ts "answers 200 with the three panels when both APIs fail"]
4. Given a weather API that answers slowly, when the home page loads, then the feed request is not held back by it. [test: testing/infra/views/home.route.test.ts "starts the feed request without waiting for the weather one"]
5. Given an open connection, when it is killed, then the client reconnects and receives both histories again. [test: testing/infra/client/connection.test.ts "retries with a growing wait after an unexpected close, until it reconnects"]
6. Given a socket message with an unknown `type`, when it arrives, then the client ignores it without an error. [test: testing/infra/client/connection.test.ts "ignores a message of unknown type, or one that is not JSON, without an error"]

---

Last updated: 2026-10-26.
