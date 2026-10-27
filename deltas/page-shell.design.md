# Page Shell — Design

> The page frame: header, three-panel layout, responsive stacking, connection status and where each form sits. Presentation layer of page-shell.spec.md.

## Scope

Covers the header, the arrangement of the three panels, the connection status, the panel-level states and the position of the publish and chat forms.

Non-goals:

- The inner look of each panel's content (weather card, post cards, message list). The design files of the weather-panel, social-feed, live-posts and global-chat slices own it.
- Colors and theme.

## Layout

- **Header:** a logo tile and the app name "Happy" on the left, connection status on the right. No navigation, no accounts.
- **Wide screens:** three columns, weather on the left (narrow), feed in the center (widest), chat on the right (medium). Each panel has an icon and a title, and scrolls on its own, except the weather panel, which is as tall as its content; the page itself does not scroll past the viewport.
- **Narrow screens:** one column in the order feed, weather, chat. The page scrolls normally.
- **Center panel, top to bottom:** publish form (name and text), live posts newest first, then the API feed.
- **Right panel, top to bottom:** chat messages, then the chat form (name and text) at the bottom.

Styling goes through the existing Tailwind build.

## States

- While the connection is being opened, the header shows "Connecting" and both forms are disabled.
- While the connection is open, the header shows "Connected" and both forms are enabled.
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
- When a form sends a message, its text field is cleared and its name field keeps its value; the name is saved in the visitor's browser and prefills both forms on the next visit.
- When the viewport narrows below the breakpoint, the layout stacks in one column.

There are no confirmation steps: nothing destructive exists.

## Consumes

| Source | Used for |
|---|---|
| Home page response | The three panels, from the weather and feed outcomes (weather-panel.spec.md, social-feed.spec.md) |
| WebSocket post messages and history | Live posts list (live-posts.spec.md) |
| WebSocket chat messages and history | Chat list (global-chat.spec.md) |
| WebSocket error replies | Inline form errors |

The page writes only publish and chat messages.

## Deferred / Open questions

- Breakpoint value for stacking.
- Accessibility: focus after sending, live announcement of incoming messages.

## Acceptance criteria

1. Given a viewport below the breakpoint, when the page loads, then the panels stack in the order feed, weather, chat. [manual: resize the browser window]
2. Given an open connection, when the server connection is cut, then the header shows "Offline, retrying" and both forms are disabled; when it returns, then they are enabled again. [manual: stop and restart the server with the page open]
3. Given the weather API is unreachable, when the page loads, then the weather panel shows its message and the feed and chat keep their slots. [manual: block the weather host and reload]
4. Given the center panel holds more content than its height, when the visitor scrolls, then only that panel scrolls. [manual: scroll the center panel on a wide screen]

---

Last updated: 2026-10-26.
