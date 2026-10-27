# Live Posts — Design

> The publish form and the live posts list at the top of the center panel. Presentation layer of live-posts.spec.md.

## Scope

Covers the publish form, the list of live posts and their states.

Non-goals:

- The API posts below them: social-feed.design.md.
- The connection status in the header and the disabling of forms while offline: page-shell.design.md.
- A character counter and an entry animation for new posts; not wanted.
- Colors and theme.

## Layout

Top of the center panel, top to bottom:

- **Publish form:** the visitor's avatar, the text field and a round, icon-only send button, all the same height; an inline message line under them for errors. The name comes from the header field (see page-shell.design.md).
- **Live posts list:** newest first. Each post shows a round avatar with the author's initials, the author name, a "Live" badge, the formatted time and the content. The tinted background and the badge tell live posts apart from the API posts below.

The API posts follow below the list (social-feed.design.md).

## States

- While there are no live posts, the list shows "No live posts yet".
- While the history arrives on connect, the list shows the stored posts newest first.
- While the connection is not open, the form is disabled (see page-shell.design.md).
- While the server rejects a publish as invalid, the message line shows the reason under the form.
- While a previous error is shown and the visitor sends a valid post, the message line is cleared.

## Interactions

- When the visitor submits the form with a text while connected and a name set in the header, the client sends the post message; the rules are in live-posts.spec.md (Contract and invariant 3).
- The send button has no visible text, so it carries the accessible name "Publish".
- When the form is sent, the text field is cleared. The name is kept and saved by the header field, shared with the chat form.
- When a post arrives, from the visitor or from anyone else, it is added at the top of the list.
- When the server answers with an error, the text already cleared is not restored.

There are no confirmation steps. Author name and text are shown as text, never as markup (see live-posts.spec.md, invariant 7).

## Consumes

| Source | Used for |
|---|---|
| WebSocket history message on connect | The initial list |
| WebSocket post broadcast | New items at the top |
| WebSocket error reply to a publish | The inline message line |
| The header name field | The author name of each publish message |

It writes the publish message (name and text).

## Deferred / Open questions

- Wording of the rejection messages beyond showing them inline; first lines are "Your name and message can't be empty, and the message can't pass 280 characters." for an invalid post.
- Format and locale of the time: the server's string is shown as it comes (live-posts.spec.md).
- Accessibility: focus after sending, announcing new posts.
- Whether a rejected message should keep the text for correction; today it does not.

## Acceptance criteria

1. Given two browsers open on the page, when one publishes a name and a text, then both show the post at the top of the list with author, content and time. [manual: two browser windows]
2. Given a post was published, when a third browser opens the page, then it shows that post in the list. [manual: open a third window afterwards]
3. Given no posts have been published, when the page loads, then the list says "No live posts yet". [manual: restart the server and load the page]
4. Given an empty text, when the visitor submits, then the message line shows an error and nothing appears in the list of the other browser. [manual: submit with an empty text]
5. Given a text of `<script>`, when it is published, then both browsers show the characters as text. [manual: publish `<script>alert(1)</script>`]
6. Given a filled form, when the visitor publishes, then the text field is empty and the header still holds the name. [manual: publish and look at the form]
7. Given a name was used, when the page is reloaded, then the header holds it and both forms are enabled. [manual: reload the page]

---

Last updated: 2026-10-27.
