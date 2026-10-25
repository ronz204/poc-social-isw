---
paths:
  - "**/source/app/**"
---

# Application Injection Conventions

This governs how a use case gets what it works with: the repositories and contracts a handler receives, who builds the handler, how process-lifetime objects are constructed, and how a handler hands off the events its entities raise. The process has no database and so no transactions: each repository call stands alone, and the state a handler touches is either an external API's or an in-memory collection. Where the files live is the layering rule's concern and how a use case is exposed is the entries rule's. Where it needs a language's own mechanism, the language idioms rule for the file's extension supplies it.

---

## Dependency injection

- A handler declares its dependencies as constructor parameters, typed by the core interfaces of the repositories and contracts it orchestrates, and nothing else. A handler that asks for something that does not exist fails to compile in its own file, and adding a dependency is one edit in the handler plus its binding. It never imports the container library, so the library stays a composition-root concern.
- The project uses a type-first container (dockdi): each dependency is a typed token, and a binding declares the class or factory together with the tuple of tokens it needs, which the compiler checks in order, type and count. Bindings are grouped in one module per bounded context and loaded by the composition root, so adding a use case touches only its own folder, its context plugin and its context's module. A handler never resolves from the container itself, because that turns the container into a hidden service locator.
- Objects that live as long as the process (the in-memory stores, the external-API clients, the cache, the event dispatcher) are bound once as singletons in the composition root, in the order they depend on each other, so the construction can be read top to bottom and a test replaces a part with the container's override on a child scope. An in-memory store in particular must be one instance: a second one would keep its own history, invisible to every connection that used the first. Nothing else constructs an infrastructure object. Resolution is synchronous, so anything asynchronous is initialized before the container is built and bound as a value.
- The composition root hands each context's plugin and socket file an object holding only what that context needs, typed by the core contracts and handlers it depends on rather than by concrete classes. The plugin passes those values on to its use cases' entries as positional arguments, while each has a distinct type so two of them cannot be swapped silently.

## Handlers and shared state

- A handler receives **only** the repositories and contracts it orchestrates. It holds no per-request state: whatever varies per call (a visitor's name, an address, a message) arrives as the parsed input, so one handler instance serves every request and every connection.
- A handler receives repositories and contracts through their core interfaces, never the concrete HTTP client or store, which is what lets a test hand it an in-memory double.
- Other connections run at every `await`. A check and the write that depends on it (is the history full, then append) stay in one synchronous stretch with no `await` between them, because anything awaited in between lets another message change the collection first.
- Whether a failing external source fails the use case or becomes a degraded output the view can show is decided in the handler, per its slice's spec, never in the entry or the view. A handler lets a domain error propagate unless the spec says to degrade, and the entry maps it.

## Events

- A handler that changes an entity takes the events the entity returned and hands them to the in-process dispatcher once the entity is stored. It never calls the consumers itself (pushing to connected clients, overwriting a cache entry): those subscribe to the event, so the handler doesn't know about them and a failing listener can't fail the use case, because the dispatcher catches and logs a listener's error.
- A handler never reaches into another context in reaction to its own write; that is a workflow's reaction.

---

## Non-goals

- Doesn't decide which dependencies a given use case needs — that follows from what the use case does.
- Doesn't govern the dispatcher or the infrastructure listeners — they are infrastructure, not an application-layer file.
