# Design Plan: Screens and Components

Inventory of the screens of poc-social-isw, derived from the `deltas/` design files, together with the order in which they are designed in Pencil. The contract of each screen (states, interactions, what it consumes) lives in its `design.md`; this file is only the inventory and the work order. The interface text is in English.

Scope: the single page of the app and its four content panels. There are no accounts, no navigation and no other routes, so the plan is small by design.

---

## Deltas

Each screen belongs to a delta under `deltas/`, which holds its full contract.

| Delta | Files | Screens |
|---|---|---|
| `page-shell` | `.spec.md` + `.design.md` | A1 to A5 |
| `weather-panel` | `.spec.md` + `.design.md` | B1 to B3 |
| `social-feed` | `.spec.md` + `.design.md` | C1 to C3, C5, C6 |
| `live-posts` | `.spec.md` + `.design.md` | D1 to D3 |
| `global-chat` | `.spec.md` + `.design.md` | E1 to E4 |

---

## Current State in Pencil

- Single working file: `design/social.pen`, versioned in the repo. It is the source of truth for all slices, so tokens are defined once and components are reused across screens.
- Phases 0 to 6 are drawn: the theme variables, the base components, screens A1 to A5 (frames `A1 Home Wide`, `A2 Home Narrow`, `A3 Connection States`, `A4 Error Page`, `A5 No Name`), the weather states B1 to B3 (frames `B1 Weather Resolved`, `B2 Weather Default Location`, `B3 Weather Unavailable`) the feed states C1 to C3, C5 and C6 (frames `C1 Feed Post Cards` to `C6 Feed Empty`) the live posts states D1 to D3 (frames `D1 Live Posts Form And List` to `D3 Publish Rejected`) and the chat states E1 to E4 (frames `E1 Chat List And Form` to `E4 Chat Scrolled Up`), under a `Components` section.
- Color variables (hex): `bg` (warm cream), `surface`, `border`, `border-control`, `text-primary`, `text-secondary`, `muted`, `accent` (coral), `accent-tint`, `accent-border`, `on-accent`, `disabled`, `disabled-bg`, `neutral-bg`, `sun` and `sun-warm` (the weather card gradient), four avatar pairs `av1-bg`/`av1-fg` to `av4-bg`/`av4-fg`, and the `success`, `warning` and `error` pairs (`*-bg`, `*-text`). Font variables: `font-ui` (Nunito) and `font-display` (Fredoka). Number variables: `space-xs` to `space-xl`, `radius-sm` (12), `radius-md` (20) and `radius-pill`.
- The app is named Happy. The theme is a warm, rounded proposal, light only: cream background, white panels with a soft shadow, a coral accent, a sunny weather card. The design files leave colors and theme out on purpose, and the page is styled with the Tailwind build, so the values must be carried into it at implementation.
- The presentation additions (avatars, the "Live" badge, chat bubbles, the logo tile, panel icons, the round icon-only send button and the weather panel that hugs its content) are recorded in the `design.md` files.

---

## Screens

States: the "States" columns list what must be shown as variants of the same frame, not as separate screens.

### A. Page Frame (`page-shell`)

Status: done on desktop. A1 to A5 are drawn in `social.pen`. A2 is the mobile counterpart of A1 (390 wide, the panels stacked as feed, weather, chat); A3, A4 and A5 are drawn at desktop width only; A3 and A5 show their headers at 432 wide, which is the tightest a one-row header gets. The panels hold sample content built from the content components below, so every region can be judged; their own states belong to phases 3 to 6.

| ID | Screen | Purpose | States |
|---|---|---|---|
| A1 | Home, wide | Header with the app name, the visitor's name chip and the connection status; three columns: weather on the left, feed in the center (widest), chat on the right. Each panel has a title and scrolls on its own | Connected |
| A2 | Home, narrow | One column in the order feed, weather, chat; the page scrolls normally | Connected |
| A3 | Connection states | The header status and the forms while the connection changes | Connecting (forms disabled), connected, offline and retrying (forms disabled, content stays) |
| A4 | Generic error page | The last resort when a failure happens outside any panel | Friendly message |
| A5 | No name | The header with the open name field and both forms disabled until a name is typed, with a plain user icon in place of the avatar | No name set |

Panel-level failures are not screens of their own: the weather and feed degraded states are in B3 and C5, and the other panels keep their slots.

### B. Weather Panel (`weather-panel`)

Status: done. B1 to B3 are drawn in `social.pen`; each state is shown twice in its frame, in the 320 wide desktop column and in the 358 wide narrow layout. B1 holds the two variants (with and without a place name). The unavailable wording is "Weather is not available right now".

| ID | Screen | Purpose | States |
|---|---|---|---|
| B1 | Weather, resolved location | Large temperature in °C, wind in km/h, and the place name only when the location has one | With and without a place name |
| B2 | Weather, default location | The same readings plus the note "Showing San José (default location)" | Default location |
| B3 | Weather, unavailable | A friendly message in place of the readings | Unavailable |

There is no loading state: the weather arrives inside the page response.

### C. Social Feed (`social-feed`)

Status: done. C1 to C3, C5 and C6 are drawn in `social.pen` (C4, the load-more failure with a Retry button, was dropped and the ids were not renumbered), each in the 684 wide desktop center panel and in the 358 wide narrow layout. Only the API posts area is drawn inside the Feed panel; the publish form and the live posts above it belong to D. The degraded wording is "Posts are not available right now".

| ID | Screen | Purpose | States |
|---|---|---|---|
| C1 | Post cards | Title, content and author name on each card, after the live posts in the center panel | First page shown |
| C2 | Loading more | The status row under the last card while the next page is fetched | "Loading more posts" |
| C3 | End of feed | The status row once the last page is shown | "No more posts" |
| C5 | Feed degraded | A friendly message in place of the cards when the posts API fails | Degraded |
| C6 | Feed empty | The posts API returned nothing to show | "No posts to show" |

### D. Live Posts (`live-posts`)

Status: done. D1 to D3 are drawn in `social.pen` (D4, rate limited, was dropped with the rate limiter), each in the 684 wide desktop center panel and in the 358 wide narrow layout. Each frame shows the publish form and the live list inside the Feed panel, without the API posts. D1 holds two variants (form enabled and form disabled). In D3 the text field is empty, as after a send; the name lives in the header. The rejected wording is "Your name and message can't be empty, and the message can't pass 280 characters."

| ID | Screen | Purpose | States |
|---|---|---|---|
| D1 | Publish form and live list | The visitor's avatar, the text and a Publish button with a message line, above the live posts newest first; each post shows author, content and time | With posts, form disabled |
| D2 | Live list, empty | The list before anyone has published | "No live posts yet" |
| D3 | Publish rejected | The inline message under the form when the post is invalid | Rejected |

### E. Global Chat (`global-chat`)

Status: done. E1 to E4 are drawn in `social.pen`, each in a 380 wide desktop column and in the 358 wide narrow layout, as a chat panel 560 high with the list scrolling above the form. E1 holds two variants (form enabled and form disabled), and E3 holds the rejected message, with the text empty. The rejected wording is "Your name and message can't be empty, and the message can't pass 200 characters."; In E4 the list shows older messages with a scroll thumb near the top and the newest ones out of view, with no "new messages" hint.

| ID | Screen | Purpose | States |
|---|---|---|---|
| E1 | Chat list and form | Messages oldest to newest with author, text and time, scrolling on their own; the form (avatar, text, Send, message line) at the bottom | With messages, form disabled |
| E2 | Chat, empty | The list before anyone has written | "No messages yet" |
| E3 | Message rejected | The inline message under the form when the message is invalid | Rejected |
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
| Header | Logo tile and the name "Happy" on the left; the name chip and the connection status on the right; both can be hidden (A4); in A5 the chip is replaced by an open text input | A | Done: `Header` |
| Header narrow | The narrow layout of the header: the brand and the connection status on a first row, the name chip as wide as the header on a second row | A | Done: `Header Narrow` |
| Name chip | The visitor's initials avatar, the name and a pencil; the open state is a `Text Input` | A | Done: `Name Chip` |
| Connection status | Connecting, connected, offline and retrying, by overriding fill, dot and label | A | Done: `Status Pill` |
| Avatar | Initials in a colored circle, four color pairs, size by override | C, D, E | Done: `Avatar` |
| Panel frame | Icon tile, title and a body that scrolls on its own | A to E | Done: `Panel Frame` (the body is replaced per panel) |
| Weather readout | Gradient card with the temperature, wind chip, optional place name, optional default-location note | B | Done: `Weather Readout` (the place row and the note are switched on or off by override) |
| Post card | Avatar and author, title, content | C | Done: `Post Card` |
| Feed status row | Loading and end (empty is the absence of the row) | C | Done: `Feed Status Row` (icon and text by override) |
| Live post item | Avatar, author, "Live" badge, time, content | D | Done: `Live Post Item` |
| Chat message item | Avatar, author, time and the text in a bubble | E | Done: `Chat Message Item` |
| Message form | The visitor's avatar, the text field and an icon-only round send button, all in one row; inline message line; enabled, disabled, with error | D, E | Done: `Message Form` (placeholders by override; the disabled look is an override of fills; the inline message is off by default) |
| Text input | Normal, disabled by override | D, E | Done: `Text Input` |
| Button | Primary, icon only, round 48 by 48; disabled by override. It has no visible text, so it needs an accessible name ("Publish" or "Send") at implementation | D, E | Done: `Button Primary` |
| Inline message | Error, with an icon | D, E | Done: `Inline Message` |
| Friendly message | Text and an icon in place of a panel's content or a page | A4, B, C | Done: `Friendly Message` |
| Empty line | Short text for an empty list; the icon is set by override (an inbox in C6) | C, D, E | Done: `Empty Line` |

### Screen Templates

| Template | Covers |
|---|---|
| Three-panel page (header + three columns) | A1 |
| Single-column page (header + stacked panels) | A2 |
| Header + stacked forms | A3 |
| Header + centered message | A4 |
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
| 0 | Decide the theme and define the color and font variables in `social.pen` | Variables ready | Done: the Happy theme (warm, rounded, light only), 38 variables |
| 1 | Base components: panel frame, header, connection status, message form, inline message, friendly message, empty line | Row of components on the canvas | Done, plus basic versions of the four content items so A1 can show them |
| 2 | Page frame: A1 to A5 | The three-panel page, wide and narrow | Done |
| 3 | Weather panel: B1 to B3 | Weather readout and its states | Done |
| 4 | Social feed: C1 to C3, C5 and C6 (requires post card and feed status row) | Feed with all its states | Done |
| 5 | Live posts: D1 to D3 (requires live post item) | Publish form and live list | Done |
| 6 | Global chat: E1 to E4 (requires chat message item) | Chat panel | Done |
| 7 | Review: both widths, all states, against the design files | Screens match the contracts | Not started |

Phase 7 is the only one left: a pass over every frame against the design files.

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

- The theme is a proposal to review: palette, the two fonts and the radius.
- Iconography: the weather panel uses a pin for the place and a wind icon for the wind, with no icon on the temperature (recorded in `weather-panel.design.md`); the feed status row uses a spinner, a check and an alert icon.
- Wording of the friendly messages (weather unavailable, feed degraded) and of the rejection messages is not final.
- The stacking breakpoint is decided at implementation.
- Accessibility (focus after sending, announcing incoming messages) is open in the design files and not drawn here.
- The `.pen` file changes only in the Pencil app until it is saved there: the tools edit the open document in memory, so the file must be saved before committing.
- The `.pen` file is encrypted: it cannot be compared with `git diff`. Each commit stores it whole, so it should be committed per phase and not on every change.
