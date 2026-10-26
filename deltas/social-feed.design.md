# Social Feed — Design

> The API posts in the center panel, below the live posts: post cards, the infinite scroll and the degraded states. Presentation layer of social-feed.spec.md.

## Scope

Covers the post cards, how the next page is requested, and the states of the API posts area.

Non-goals:

- The publish form and the live posts: live-posts.design.md.
- The panel's frame and scrolling container: page-shell.design.md.
- Comments, likes and any action on a post; the spec excludes them.
- Colors and theme.

## Layout

The API posts area is a vertical list of post cards inside the center panel, after the live posts. Each card, top to bottom:

- **Author:** a line of its own at the top, a round avatar with the author's initials and the author's name beside it. The avatar is only decoration, drawn from the name; it is not an identity.
- **Title:** the most prominent line.
- **Content:** the post body.

At the end of the list sits one status row, which is empty, "Loading more posts", "Could not load more posts" with a Retry button, or "No more posts" depending on the state below.

## States

- While the page loads, the first page of posts is already in the response, so there is no loading state for it.
- While the feed fails, the area shows its friendly message in place of the cards (see social-feed.spec.md, invariant 3).
- While the API returns no postable posts, the area shows "No posts to show".
- While the visitor has not reached the bottom and more posts remain, the status row is empty.
- While the next page is being fetched, the status row shows "Loading more posts".
- While the last page has been shown, the status row shows "No more posts".
- While the request for the next page fails, the status row shows "Could not load more posts" with a Retry button. The Retry button is a presentation choice, not a spec requirement.

## Interactions

- When the visitor scrolls the center panel to its bottom and the last page said more remain, the client requests the next page over HTTP and appends its cards after the existing ones.
- When a page arrives with has-more false, the client stops requesting pages.
- When the visitor presses Retry, the client requests the same page again.
- While a page request is in flight, scrolling to the bottom again does not send a second request.

There are no confirmation steps. How the page size, paging and has-more work is in social-feed.spec.md (Contract and invariants 6, 7, 10 and 11).

## Consumes

| Source | Used for |
|---|---|
| Home page response: first page of the feed | The first cards and the first has-more value |
| HTTP request for page N of the feed | The cards to append and the new has-more value |
| Feed failure outcome | The degraded message |

Author name, title and content are rendered as text (see social-feed.spec.md, invariant 5). The area writes nothing.

## Deferred / Open questions

- The HTTP route and response format used to request a page (HTML fragment or JSON); decided when implementing.
- Wording of the degraded message (a first line is "Posts are not available right now") and of "No posts to show".
- Whether the Retry button is worth its code for the demo; it can be dropped for a plain message.
- Accessibility of the loading and end rows.

## Acceptance criteria

1. Given the API answers, when the page loads, then the area shows post cards with title, content and author name. [manual: load the page]
2. Given more than one page of posts, when the visitor scrolls the center panel to the bottom, then the next cards appear after the existing ones without a page reload. [manual: scroll the center panel]
3. Given the visitor reaches the last page, when they scroll to the bottom, then the row says "No more posts" and no further request is made. [manual: scroll to the end with the network tab open]
4. Given the posts API is unreachable, when the page loads, then the area shows its friendly message and the live posts and chat keep working. [manual: block the posts host and reload]
5. Given the next-page request fails, when the visitor scrolls to the bottom, then the row says "Could not load more posts" and Retry requests it again. [manual: go offline after the first page, scroll, go online and press Retry]

---

Last updated: 2026-10-26.
