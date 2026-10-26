# Design Plan: Screens and Components

Inventory of the screens of poc-social-isw, derived from the `deltas/` design files, together with the order in which they are designed in Pencil. The contract of each screen (states, interactions, what it consumes) lives in its `design.md`; this file is only the inventory and the work order. The interface text is in English.

Scope: the single page of the app and its four content panels. There are no accounts, no navigation and no other routes, so the plan is small by design.

---

## Deltas

Each screen belongs to a delta under `deltas/`, which holds its full contract.

| Delta | Files | Screens |
|---|---|---|
| `page-shell` | `.spec.md` + `.design.md` | A1 to A4 |
| `weather-panel` | `.spec.md` + `.design.md` | B1 to B3 |
| `social-feed` | `.spec.md` + `.design.md` | C1 to C6 |
| `live-posts` | `.spec.md` + `.design.md` | D1 to D4 |
| `global-chat` | `.spec.md` + `.design.md` | E1 to E4 |

---

## Current State in Pencil

- Single working file: `design/social.pen`, versioned in the repo. It is the source of truth for all slices, so tokens are defined once and components are reused across screens.
- The file is empty: no frames, no components and no variables yet. Nothing is designed.
- Colors and theme are not decided: the design files leave them out on purpose, and the page is styled with the Tailwind build. Phase 0 settles them before any screen is drawn.
- The `.pen` file is encrypted: it is only read and written through the Pencil tools.

---

## Screens

States: the "States" columns list what must be shown as variants of the same frame, not as separate screens.

### A. Page Frame (`page-shell`)

Status: not started.

| ID | Screen | Purpose | States |
|---|---|---|---|
| A1 | Home, wide | Header with the app name and the connection status; three columns: weather on the left, feed in the center (widest), chat on the right. Each panel has a title and scrolls on its own | Connected |
| A2 | Home, narrow | One column in the order feed, weather, chat; the page scrolls normally | Connected |
| A3 | Connection states | The header status and the forms while the connection changes | Connecting (forms disabled), connected, offline and retrying (forms disabled, content stays) |
| A4 | Generic error page | The last resort when a failure happens outside any panel | Friendly message |

Panel-level failures are not screens of their own: the weather and feed degraded states are in B3 and C5, and the other panels keep their slots.

### B. Weather Panel (`weather-panel`)

Status: not started.

| ID | Screen | Purpose | States |
|---|---|---|---|
| B1 | Weather, resolved location | Large temperature in °C, wind in km/h, and the place name only when the location has one | With and without a place name |
| B2 | Weather, default location | The same readings plus the note "Showing San José (default location)" | Default location |
| B3 | Weather, unavailable | A friendly message in place of the readings | Unavailable |

There is no loading state: the weather arrives inside the page response.

### C. Social Feed (`social-feed`)

Status: not started.

| ID | Screen | Purpose | States |
|---|---|---|---|
| C1 | Post cards | Title, content and author name on each card, after the live posts in the center panel | First page shown |
| C2 | Loading more | The status row under the last card while the next page is fetched | "Loading more posts" |
| C3 | End of feed | The status row once the last page is shown | "No more posts" |
| C4 | Load more failed | The status row when the next-page request fails | "Could not load more posts" with a Retry button |
| C5 | Feed degraded | A friendly message in place of the cards when the posts API fails | Degraded |
| C6 | Feed empty | The posts API returned nothing to show | "No posts to show" |

### D. Live Posts (`live-posts`)

Status: not started.

| ID | Screen | Purpose | States |
|---|---|---|---|
| D1 | Publish form and live list | Name, text and a Publish button with a message line, above the live posts newest first; each post shows author, content and time | With posts, form disabled |
| D2 | Live list, empty | The list before anyone has published | "No live posts yet" |
| D3 | Publish rejected | The inline message under the form when the post is invalid | Rejected |
| D4 | Publish rate limited | The inline message asking the visitor to wait | Rate limited |

### E. Global Chat (`global-chat`)

Status: not started.

| ID | Screen | Purpose | States |
|---|---|---|---|
| E1 | Chat list and form | Messages oldest to newest with author, text and time, scrolling on their own; the form (name, text, Send, message line) at the bottom | With messages, form disabled |
| E2 | Chat, empty | The list before anyone has written | "No messages yet" |
| E3 | Message rejected | The inline message under the form when the message is invalid or rate limited | Rejected, rate limited |
| E4 | Chat, scrolled up | The visitor has scrolled up to read; an arriving message does not move the list | Scrolled up |

### Out of Scope

- Accounts, sign-in, profiles, private messages, rooms and presence: the brief excludes them.
- Comments, likes and any action on a post.
- A character counter, an entry animation for new posts and highlighting one's own chat messages: not wanted.
- A refresh control, a location input or a forecast in the weather panel.
- The user manual: it is a delivery task, not a screen.

---

## Components

Each component is built once as `reusable: true` in Pencil, and screens are instances of it. This way every new screen costs a fraction of the first.

The "Status" column states whether the component is already in the `Components` section of `social.pen`. Nothing is built yet.

| Component | Variants and states | Used by | Status |
|---|---|---|---|
| Header | App name on the left, connection status on the right | A | Not started |
| Connection status | Connecting, connected, offline and retrying | A | Not started |
| Panel frame | Title and a body that scrolls on its own | A to E | Not started |
| Weather readout | Temperature, wind, optional place name, optional default-location note | B | Not started |
| Post card | Title, content, author | C | Not started |
| Feed status row | Empty, loading, end, failed with Retry | C | Not started |
| Live post item | Author, content, time | D | Not started |
| Chat message item | Author, text, time | E | Not started |
| Message form | Name field, text field, send button, inline message line; enabled, disabled, with error | D, E | Not started |
| Inline message | Error and information, for rejections and the rate limit | D, E | Not started |
| Friendly message | Text in place of a panel's content | B, C, A4 | Not started |
| Empty line | Short text for an empty list | C, D, E | Not started |

### Screen Templates

| Template | Covers |
|---|---|
| Three-panel page (header + three columns) | A1, A3 |
| Single-column page (header + stacked panels) | A2 |
| Panel content states | B, C, D, E |

---

## Mobile

Every screen is also designed for the narrow layout. There are two canvas sizes: desktop at 1440 and mobile at 390×844. Tablet is not designed: the stacking breakpoint is decided at implementation (see `page-shell.design.md`).

The narrow page stacks the panels in the order feed, weather, chat. The panels themselves reuse the same components. Each panel state is drawn once and checked at both widths, so there is no separate mobile phase.

---

## Design Order

Each phase ends with a screenshot and a review before the next begins. The goal is to keep effort low: components first, screens as instances, states as variants.

| Phase | Work | Deliverable | Status |
|---|---|---|---|
| 0 | Decide the theme and define the color and font variables in `social.pen` | Variables ready | Not started |
| 1 | Base components: panel frame, header, connection status, message form, inline message, friendly message, empty line | Row of components on the canvas | Not started |
| 2 | Page frame: A1, A2, A3 and A4 | The three-panel page, wide and narrow | Not started |
| 3 | Weather panel: B1 to B3 | Weather readout and its states | Not started |
| 4 | Social feed: C1 to C6 (requires post card and feed status row) | Feed with all its states | Not started |
| 5 | Live posts: D1 to D4 (requires live post item) | Publish form and live list | Not started |
| 6 | Global chat: E1 to E4 (requires chat message item) | Chat panel | Not started |
| 7 | Review: both widths, all states, against the design files | Screens match the contracts | Not started |

Minimum order if scope must be cut: phases 0 to 2, then 5 and 6 (the live part is what the brief grades hardest), then 4 and 3.

---

## Design Rules

- One primary button per form; there are two forms on the page, each with its own.
- Visitor text is always drawn as plain text: the mockups never rely on markup in a name or a message.
- A failing panel shows a friendly message in its own slot; the other panels keep their layout unchanged.
- Every panel that lists things has an empty line, and every form has a disabled state.
- The interface text is in English, and the connection status uses the exact words in `page-shell.design.md`.
- No value outside the palette: once phase 0 defines it, a new color means extending the variables first.

## Open Items and Questions

- Theme and palette are undecided (phase 0).
- Iconography is undecided: icons for the temperature and wind are an open question in `weather-panel.design.md`.
- Wording of the friendly messages (weather unavailable, feed degraded) and of the rejection messages is not final.
- The stacking breakpoint is decided at implementation.
- Accessibility (focus after sending, announcing incoming messages) is open in the design files and not drawn here.
- The `.pen` file is encrypted: it cannot be compared with `git diff`. Each commit stores it whole, so it should be committed per phase and not on every change.
