# Overview

What the system is, its scope and its vocabulary. How the parts communicate lives in structure.md, not here; the full requirements and grading rubric live in the assignment brief at the repo root.

---

## Vision

A web platform that simulates a social network with two live ingredients on top of it: the weather where the visitor is, and a global real-time chat. Existing users and posts come from a public fake-data API so the feed is never empty; everything a visitor creates (new posts, chat messages) is real, shared with every connected visitor, and lives only in the server's memory.

The project is a university assignment, so it has a constraint most apps do not: the author must be able to explain every line and make small changes live, or the work is graded zero even if it runs. Code is therefore kept simple and legible; sophistication that cannot be defended orally is a cost, not a feature.

The brief is a floor, not a ceiling: the author has latitude to go beyond it. Where this project departs from the brief's literal text, that is a deliberate choice recorded in structure.md.

## Scope & non-goals

In scope: a three-panel page (weather, feed, chat), server-rendered; a feed built from the fake-data API's posts joined with their authors; weather for the visitor's approximate location; publishing a post with a name and a text; a global chat; live broadcast of new posts and messages to every connected client, with in-memory history delivered to each new connection; friendly degraded UI when an external API fails; a user manual.

Out of scope, by requirement or decision:

- No database and no persistence: a server restart empties all live content.
- No authentication or accounts: a visitor just types a name.
- No private or per-user messaging; the chat is global only.
- No external write: the fake-data API is read-only here, posts created by visitors are never sent to it.

## Domain concepts

| Concept | Description |
|---|---|
| `User` | An author record from the fake-data API. Distinct from a visitor, who has no account and only supplies a display name when publishing. |
| `Post` | A feed entry. Either fetched from the fake-data API (title, body, author) or created live by a visitor (server-assigned id, author name, content, formatted time). The two kinds are shown as separate lists, live posts above the fetched ones. |
| `Chat message` | A live message in the global chat, broadcast to all connected clients and kept in server memory. |
| `Location` | The visitor's approximate coordinates, derived from their IP address; a fixed default is used when the IP carries no location (local development). |
| `Weather reading` | Current temperature and wind speed for a `Location`, from the weather API. |
| `History` | The in-memory sequence of live posts, and a separate one of chat messages, each bounded to its most recent entries and replayed to a client when it connects. |

---

## Non-goals

- This file does not restate the assignment's requirement list or rubric; those stay in the brief.
