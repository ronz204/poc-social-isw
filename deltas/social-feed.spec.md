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
- Layout, visual states and how scrolling asks for the next page: those belong to `social-feed.design.md`.

## Contract

| Item | Value |
|---|---|
| Sources | The fake-data API (JSONPlaceholder, `https://jsonplaceholder.typicode.com`): `/posts` and `/users`, read only |
| Post shape | Title, content, author name (from the joined user) |
| Join | Post's user id against the user's id |
| Page size | Fixed, server-side constant (starting value 10) |
| Order | The API's order |
| Page result | The posts of the page plus a has-more indicator, true while posts remain after this page |
| Cache | One in-memory entry holding the fetched posts and users, TTL 5 minutes, invalidated by expiry only; a failed read is never stored |
| On failure | A friendly message in place of the posts; no exception reaches the caller |

## Invariants

1. Every rendered post carries a title, a content and the author name of its joined user. [test: testing/app/social-feed/get-feed-page.handler.test.ts "returns the first page with title, content and author name"]
2. If a post's user id matches no fetched user, then the post is left out and the other posts still render. [test: testing/app/social-feed/get-feed-page.handler.test.ts "leaves out a post whose user is unknown and keeps the rest"]
3. If reading the API fails (network error, timeout, non-2xx) or a response does not match its schema, then the feed returns the friendly message and does not throw. [test: testing/infra/api/feed/feed.http.adapter.test.ts "fails with a feed error when the API call fails"]
4. The `/posts` and `/users` responses are parsed with a schema at the boundary, and only the parsed result is used afterwards. [test: testing/infra/api/feed/feed.http.adapter.test.ts "fails with a feed error when a response does not match its schema"]
5. Author name, title and content are HTML-escaped when rendered. [test: testing/infra/views/feed-posts.component.test.tsx "renders author name, title and content as escaped text"]
6. When a page is requested, the feed returns at most the fixed page size of posts, in the API's order. [test: testing/app/social-feed/get-feed-page.handler.test.ts "returns at most a page of posts in the API order"]
7. If the requested page is not a valid page number, then the feed returns the first page. [test: testing/app/social-feed/get-feed-page.handler.test.ts "returns the first page for the invalid page %s"]
8. While the cached data is within its TTL, no new request goes to the API. [test: testing/infra/api/feed/feed.cache.adapter.test.ts "reads once inside the TTL"]
9. The slice never sends data to the API. [test: testing/infra/api/feed/feed.http.adapter.test.ts "only reads posts and users and sends nothing"]
10. If the requested page is a valid number past the last page, then the feed returns no posts and has-more false, never the first page again. [test: testing/app/social-feed/get-feed-page.handler.test.ts "returns no posts and has-more false past the last page"]
11. While posts remain after the returned page, the page result carries has-more true; on the last page it carries has-more false. [test: testing/app/social-feed/get-feed-page.handler.test.ts "reports has-more false on the last page and true before it"]

## Deferred / Open questions

- Exact page size (10 is a starting value; it is a server-side constant).
- Serving stale cached data while the API is down is not done: failure shows only the friendly message. Revisit if the demo needs more resilience.

## Acceptance criteria

1. Given the API returns 100 posts and 10 users, when the first page is requested, then 10 posts show, each with its author name. [test: testing/app/social-feed/get-feed-page.handler.test.ts "returns the first page with title, content and author name"]
2. Given one post references an unknown user id, when the page is built, then that post is absent and the rest show. [test: testing/app/social-feed/get-feed-page.handler.test.ts "leaves out a post whose user is unknown and keeps the rest"]
3. Given `/posts` answers 500 or malformed JSON, when the page loads, then the feed shows the friendly message and the page still returns 200. [test: testing/app/social-feed/get-feed-page.handler.test.ts "returns an unavailable result when the reader fails"]
4. Given a request already fetched the feed, when a second request arrives within the TTL, then the API receives one call in total. [test: testing/infra/api/feed/feed.cache.adapter.test.ts "reads once inside the TTL"]
5. Given a post title containing `<script>`, when the page renders, then the markup shows it as escaped text. [test: testing/infra/views/feed-posts.component.test.tsx "renders author name, title and content as escaped text"]
6. Given 100 posts and a page size of 10, when page 11 is requested, then no posts and has-more false come back. [test: testing/app/social-feed/get-feed-page.handler.test.ts "returns no posts and has-more false past the last page"]
7. Given 100 posts and a page size of 10, when page 10 is requested, then 10 posts come back with has-more false, and page 9 reports has-more true. [test: testing/app/social-feed/get-feed-page.handler.test.ts "reports has-more false on the last page and true before it"]

---

Last updated: 2026-10-26.
