---
paths:
  - "**/source/app/**"
---

# Application Entries Conventions

This governs how a use case is reached from outside: HTTP plugins that serve endpoints, pages and page fragments, socket entries that handle realtime messages, and the public surface of an application context. An entry only translates what a framework gives it into a use case's input and calls the handler; every decision stays in the handler. There is no authentication, no tenant and so no request gate: a visitor's name arrives as an input field and is validated by its value object like any other. Where the files live is the layering rule's concern and how a handler gets its dependencies is the injection rule's. Where it needs a language's own mechanism, the language idioms rule for the file's extension supplies it.

---

## Per-context entries

- Each bounded context has one plugin of its own that composes its use cases' plugins and sets their shared route prefix. The api entrypoint mounts only these per-context plugins, never a use case's plugin directly, so adding a use case touches its own context and nothing outside it.
- The per-context plugin maps errors to a response in one place, both domain errors and the context's orchestration errors: a status for an endpoint, a friendly message for a page or fragment. Mapping them per use case would repeat the same translation in every route and let identical errors drift to different responses.
- Each bounded context that has socket-triggered use cases has one socket file of its own. It routes each message type to its use case's socket entry and maps errors to a reply to the sender in one place, so one visitor's bad message never reaches the others or ends the connection. The entrypoint registers only these per-context socket files.
- The HTTP framework is imported **only** in plugin files and the socket framework **only** in socket files. Handlers, schemas, and errors depend on neither, because a handler is tested without a framework and the same handler may be reached from both entries.
- A bounded context in the application layer has no barrel. Its public surface is its per-context files (the plugin, the socket file), each imported directly by the composition root or entrypoint that needs it, because a barrel would pull framework-bound files into anything that imports one type. Per-context files import their use cases' entry files by relative path.

## Kinds of entry

- A `plugin` is an entry into a use case over HTTP. It parses the request with the use case's input schema (the validation rule says why every external input is parsed), calls the handler, and maps the output to a response. A plugin that serves a page or fragment hands the handler's output to a view component from infrastructure and returns the HTML; views receive plain output values, never entities or errors.
- A `socket` is an entry into a use case from one message type. It parses the message, which has no type system behind it, with the same input schema, calls the handler, and sends the result. A message the schema rejects is answered to the sender and never reaches a handler.
- Reading what the framework exposes on the request counts as translation: the client's address is taken from the request by the entry or its mapper and passed as an input field, so the handler receives a value instead of a framework object and stays testable without one.
- An entry carries no logic beyond translation, so every decision stays in the handler. An event that must reach another context is a workflow's `reaction`, never an entry.

---

## Non-goals

- Doesn't decide which routes or message types a context exposes — that's the bounded context's own spec.
- Doesn't govern the layer that holds the views, the dispatcher or the socket server setup — those are infrastructure.
