---
paths:
  - "source/**/*.ts"
  - "source/**/*.tsx"
---

# Boundary Validation Conventions

This governs how data enters the server from outside: visitor input and third-party API responses. The inner folder layout is not settled, so the scope is the whole source root.

---

## Validate every external input with a schema

- Form submissions and WebSocket messages are parsed with a schema before use, because anything a client sends can be malformed or hostile, and a WebSocket message has no type system behind it.
- Responses from the fake-data and weather APIs are parsed with a schema before use, because a third party can change or break its shape, and a bad shape should become a handled failure, not a crash deep in rendering.
- Code past the boundary works with the parsed, typed result, never the raw input, so no later code re-checks or trusts an unchecked value.
- A failed parse is a handled outcome: the caller gets a clear failure to map to a message, never an uncaught exception.

---

## Non-goals

- Doesn't cover values created by the server itself (ids, timestamps); only data crossing in from outside.
