---
paths:
  - "source/app/**"
---

# Application Layer Conventions

This governs the application layer, which orchestrates use cases over the domain's bounded contexts: its layout, how a use case is reached over HTTP or the socket, and how a handler gets its dependencies. There is no database, so no transactions, and no authentication, so no request gate: a visitor's name arrives as an input field and is validated by its value object like any other. The domain layer's rules and any single use case's behavior (its context's spec) are out of scope. The language idioms rule supplies every language mechanism.

---

## Layout

- One folder per bounded context, named as in core. The shared kernel is not mirrored, and neither are sub-slices: use cases often cross entities of one context.
- Inside a context, one folder per use case, verb-noun, one level deep, never nested (a use case needing structure is two). It exists only for a handler that orchestrates injected repositories or contracts.
- A context imports only its own folder, never another's implementation. The one exception is a workflow.
- A flow needing several contexts is a workflow: its own folder at the root of the layer, verb-noun, never inside a context. Its handler calls each context's handlers in sequence. Invariants of its own (ordering, compensation, idempotency) earn its own spec.
- A `reaction` is the listener the in-process dispatcher calls for one event type of one context: it parses the payload with the workflow's input schema, translates ids between contexts and calls the handler, deciding nothing. One that only calls its own context is wired by that context's plugin; a listener with only an infrastructure effect (pushing to clients, overwriting a cache entry) is infrastructure.
- Files are `<use-case>.<kind>` (a workflow uses `schema`, `handler`, `reaction`, `errors`), prefix kept, only kinds needed. Tests never live in a use-case folder.
- Per context: `<context>.plugin` and `<context>.socket` compose the use cases' entries, and `<context>.views` declares an output shape (schema plus entity mapper) that two or more use cases return. It is not an HTML view; those live in infrastructure.

| Kind | Holds |
|---|---|
| `schema` | Input and output runtime schemas; types derived from them, never hand-declared. Shape only: never re-check a business invariant |
| `handler` | The use-case class, receiving its dependencies through its constructor, typed by core interfaces |
| `errors` | Orchestration errors that aren't domain rules (entity not found); domain errors stay in core |
| `plugin` | The HTTP plugin exposing a JSON endpoint, page or fragment with the same schemas |
| `socket` | The entry for one socket message type, parsing it with the same input schema |
| `mapper` | Pure functions from what an entry receives (request, message, client address) to the use case input; only when more than a field copy |

## Entries

- An entry only translates what a framework gives it into the use case's input and calls the handler; every decision stays in the handler. Reading the client's address from the request is translation: the handler receives a value, not a framework object.
- A context has one plugin that composes its use cases' plugins under one route prefix and maps domain and orchestration errors in one place (a status for an endpoint, a friendly message for a page or fragment); the entrypoint mounts only these.
- A context with socket-triggered use cases has one socket file routing each message type to its entry and replying to the sender on error, so one visitor's bad message never reaches the others or ends the connection. A message the schema rejects never reaches a handler.
- The HTTP framework is imported only in plugin files and the socket framework only in socket files, so a handler is tested without one. Views receive plain output values, never entities or errors.
- A context in this layer has no barrel: each entrypoint imports the per-context file directly.

## Injection

- A handler declares its dependencies as constructor parameters typed by core interfaces, never the concrete client or store, so a test hands it an in-memory double. It never imports the container library or resolves from the container.
- Bindings are grouped in one module per context and loaded by the composition root, so adding a use case touches its folder, its context plugin and its module. Process-lifetime objects (in-memory stores, API clients, cache, dispatcher) are bound once as singletons in dependency order; an in-memory store must be one instance, since a second would keep its own history. Anything asynchronous is initialized before the container is built.
- A handler holds no per-request state: what varies per call arrives as the parsed input.
- Other connections run at every `await`: a check and the write that depends on it stay in one synchronous stretch.
- Whether a failing external source fails the use case or becomes a degraded output is decided in the handler, per its spec, never in the entry or view.
- A handler that changes an entity hands the returned events to the dispatcher once the entity is stored. It never calls consumers itself, so a failing listener cannot fail the use case, and it never reaches into another context in reaction to its own write.

---

## Non-goals

- Does not decide which use cases or routes a context exposes; that is the context's spec.
- Does not govern the dispatcher, the socket server setup or the views; those are infrastructure.
