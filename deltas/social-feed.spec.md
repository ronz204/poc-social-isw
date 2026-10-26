# Social Feed — Spec

> Reads posts and users from the public fake-data API, joins each post to its author, and serves the result in fixed-size pages for the center panel.

## Intent

The visitor always sees a populated social feed, even with no live activity: the fake-data API supplies existing posts and authors, and the slice turns them into title, content and author name.

## Scope

Owns:

- Reading the API's posts and users, parsing them into typed `Post` and `User` shapes, and joining each post to its author by user id.
- Splitting the joined list into fixed-size pages, produced on the server.
- Caching the fetched data for a short time.
- The failure outcome when the API cannot be read, so the rest of the page keeps working.

Non-goals:

- Posts published live by visitors. The live-posts slice owns them; they are not merged into this list, so no id policy between the two sources is needed here.
- Comments. The brief mentions them in prose, but its feed requirement only asks for posts and users.
- Writing to the API, persistence and accounts.
- Layout, visual states and how scrolling asks for the next page: those belong to a future design file, to be done with or after the page-shell slice.

## Contract

| Item | Value |
|---|---|
| Sources | The fake-data API's `/posts` and `/users`, read only |
| Post shape | Title, content, author name (from the joined user) |
| Join | Post's user id against the user's id |
| Page size | Fixed, server-side constant (starting value 10) |
| Order | The API's order |
| Cache | Short TTL on the fetched data, invalidated by expiry only; value and mechanism open |
| On failure | A friendly message in place of the posts; no exception reaches the caller |

## Invariants

1. Every rendered post carries a title, a content and the author name of its joined user. [none]
2. If a post's user id matches no fetched user, then the post is left out and the other posts still render. [none]
3. If reading the API fails (network error, timeout, non-2xx) or a response does not match its schema, then the feed returns the friendly message and does not throw. [none]
4. The `/posts` and `/users` responses are parsed with a schema at the boundary, and only the parsed result is used afterwards. [none]
5. Author name, title and content are HTML-escaped when rendered. [none]
6. When a page is requested, the feed returns at most the fixed page size of posts, in the API's order. [none]
7. If the requested page is not a valid page number or is past the last page, then the feed returns the first page. [none]
8. While the cached data is within its TTL, no new request goes to the API. [none]
9. The slice never sends data to the API. [none]

## Deferred / Open questions

- Testing gap: every invariant is tagged `[none]` because no code exists yet. The executor writes one vitest test per invariant when the slice is implemented.
- Exact page size (10 is a starting value) and how the panel's scrolling requests the next page. Decided in the feed's design file.
- Cache TTL value and mechanism. Decided when the slice is implemented.
- Fallback for an invalid or out-of-range page (invariant 7) is a proposal, not confirmed in detail. Revisit if the scroll mechanism makes it irrelevant.
- Serving stale cached data while the API is down is not done: failure shows only the friendly message. Revisit if the demo needs more resilience.

## Acceptance criteria

1. Given the API returns 100 posts and 10 users, when the first page is requested, then 10 posts show, each with its author name. [none]
2. Given one post references an unknown user id, when the page is built, then that post is absent and the rest show. [none]
3. Given `/posts` answers 500 or malformed JSON, when the page loads, then the feed shows the friendly message and the page still returns 200. [none]
4. Given a request already fetched the feed, when a second request arrives within the TTL, then the API receives one call in total. [none]
5. Given a post title containing `<script>`, when the page renders, then the markup shows it as escaped text. [none]

---

Last updated: 2026-10-26.
