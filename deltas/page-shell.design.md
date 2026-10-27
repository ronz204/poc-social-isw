# Page Shell — Design

> The page frame: header, three-panel layout, responsive stacking, connection status and where each form sits. Presentation layer of page-shell.spec.md.

## Scope

Covers the header, the arrangement of the three panels, the connection status, the panel-level states and the position of the publish and chat forms.

Non-goals:

- The inner look of each panel's content (weather card, post cards, message list). The design files of the weather-panel, social-feed, live-posts and global-chat slices own it.
- Colors and theme.

## Layout

- **Header:** a logo tile and the app name "Happy" on the left; on the right the visitor's name and the connection status. No navigation, no accounts.
- **Visitor name:** one field in the header, shared by both forms. With no saved name it is an open field ("Your name"); with one it folds into a chip with the initials avatar, the name and a pencil, and pressing it opens the field again. On narrow screens the field takes a row of its own under the brand and the connection status, as wide as the header.
- **Wide screens:** three columns, weather on the left (narrow), feed in the center (widest), chat on the right (medium). Each panel has an icon and a title, and scrolls on its own, except the weather panel, which is as tall as its content; the page itself does not scroll past the viewport.
- **Narrow screens:** one column in the order feed, weather, chat. The page scrolls normally.
- **Center panel, top to bottom:** publish form (the visitor's avatar and the text field), live posts newest first, then the API feed.
- **Right panel, top to bottom:** chat messages, then the chat form (the visitor's avatar and the text field) at the bottom.

Styling goes through the existing Tailwind build.

## States

- While no name is set, the header shows the open name field and both forms are disabled, with "Set your name first" in their text fields and a plain user icon in place of the avatar.
- While the connection is being opened, the header shows "Connecting" and both forms are disabled.
- While the connection is open and a name is set, the header shows "Connected" and both forms are enabled.
- While the connection is closed and retrying, the header shows "Offline, retrying", both forms are disabled and the content already shown stays.
- While the weather is unavailable, the weather panel shows its friendly message; while a default location is used, it shows the default-location note (see weather-panel.spec.md).
- While the feed fails, the feed panel shows its friendly message in its own slot.
- While there are no live posts, the live posts area shows "No live posts yet".
- While there are no chat messages, the chat list shows "No messages yet".
- While one panel is in error, the other panels keep their slots unchanged.
- While a failure happens outside any panel, the page shows a generic friendly error page.

## Interactions

- When the visitor submits the publish form with valid fields while connected, the client sends the post message (rules in live-posts.spec.md).
- When the server answers a publish with an error, the publish form shows it inline.
- When the visitor submits the chat form with valid fields while connected, the client sends the chat message (rules in global-chat.spec.md).
- When the server answers a chat message with an error, the chat form shows it inline.
- When the visitor scrolls the center panel to its bottom, the next page of API posts is requested over HTTP (see social-feed.design.md).
- When the visitor types a name in the header field, both forms show its initials and, if the connection is open, become enabled. A changed name applies only to the messages sent afterwards.
- When a form sends a message, its text field is cleared and the header keeps the name; the name is saved in the visitor's browser and prefilled on the next visit. If the browser cannot store it, the page still works.
- When the viewport narrows below the breakpoint, the layout stacks in one column.

There are no confirmation steps: nothing destructive exists.

## Consumes

| Source | Used for |
|---|---|
| Home page response | The three panels, from the weather and feed outcomes (weather-panel.spec.md, social-feed.spec.md) |
| WebSocket post messages and history | Live posts list (live-posts.spec.md) |
| WebSocket chat messages and history | Chat list (global-chat.spec.md) |
| WebSocket error replies | Inline form errors |
| Browser storage of the visitor's name | Prefilling the header name field |

The page writes the publish and chat messages and the saved name.

## Deferred / Open questions

- Breakpoint value for stacking.
- Accessibility: focus after sending, live announcement of incoming messages.

## Acceptance criteria

1. Given a viewport below the breakpoint, when the page loads, then the panels stack in the order feed, weather, chat. [manual: resize the browser window]
2. Given an open connection, when the server connection is cut, then the header shows "Offline, retrying" and both forms are disabled; when it returns, then they are enabled again. [manual: stop and restart the server with the page open]
3. Given the weather API is unreachable, when the page loads, then the weather panel shows its message and the feed and chat keep their slots. [manual: block the weather host and reload]
4. Given the center panel holds more content than its height, when the visitor scrolls, then only that panel scrolls. [manual: scroll the center panel on a wide screen]
5. Given no saved name, when the page loads, then the header shows the open name field and both forms are disabled until a name is typed. [manual: clear the site data and reload]
6. Given a saved name, when the page loads, then the header shows the name as a chip and both forms show its initials. [manual: send a message, then reload]

---

Last updated: 2026-10-27.
