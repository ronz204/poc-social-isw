---
paths:
  - "**/source/app/**"
---

# Application Layout Conventions

This governs the internal folder and file layout of the application layer, which orchestrates use cases over the domain's bounded contexts: how use cases are grouped, which files a use case and its bounded context hold, and where flows that span several contexts live. How a handler gets its dependencies is the injection rule's concern, and how a use case is exposed over HTTP or the socket is the entries rule's. It doesn't cover the domain layer's own layout (that has its own rule) or any single use case's behavior (that belongs to its bounded context's spec). Where it needs a language's own mechanism, the language idioms rule for the file's extension supplies it.

---

## Folder shape

- The application layer mirrors the domain's **bounded contexts**, but not their sub-slices: one folder per bounded context, named exactly as in core, so a use case's owning context is obvious from its path.
- The shared kernel is not mirrored. It is a domain concept and exists only in core, so the application layer holds nothing but real bounded contexts, their use cases, and the workflows that span them.
- Inside a bounded context, each use case gets its own folder, named verb-noun after what it does, joined the way the language's names allow (publish a post, not "post service"). This avoids mirroring sub-slices because many use cases cross more than one entity of the same context, such as listing posts together with their authors, and a sub-slice folder would have no natural owner for them.
- Use-case folders are one level deep and never nest. A use case that seems to need internal structure is really two use cases.
- A use-case folder exists only for a use case with a handler that orchestrates injected repositories or contracts. Everything inside it feeds that one use case; the only things it receives from outside are its injected dependencies.
- An application context imports only its own folder, never another application context's implementation, so contexts never couple through each other's use cases or HTTP plumbing. The one exception is a workflow, below.

```
<context>/
├── <context>.plugin       # composes use-case plugins, route prefix, error → response
├── <context>.socket       # composes use-case socket entries, message type → entry
├── <context>.views        # output shapes shared by several use cases
└── <use-case>/
    ├── <use-case>.schema
    ├── <use-case>.handler
    ├── <use-case>.errors
    ├── <use-case>.plugin
    ├── <use-case>.socket
    └── <use-case>.mapper

<workflow>/                   # at the root, beside the context folders
├── <workflow>.schema
├── <workflow>.handler
├── <workflow>.reaction
└── <workflow>.errors
```

The tree writes the separator between prefix and kind as a dot; the language idioms rule says when it is another character.

## Workflows

- A flow that needs several bounded contexts is a workflow: its own folder at the root of the application layer, beside the context folders and named after the flow (verb-noun), never inside one of the contexts it touches. Otherwise that context would quietly own a rule about another one.
- A workflow is the only application code that may call the use cases of more than one context. Its handler calls each context's handlers in sequence. A flow whose orchestration has invariants of its own (ordering, compensation after partial failure, idempotency across the boundary) also gets its own spec.
- A `reaction` is the listener the in-process event dispatcher calls for one event type of one context. It parses the event's payload with the workflow's input schema, translates the emitting context's ids into the receiving context's, and calls the workflow's handler. It carries no decision beyond that translation, so every decision stays in the handler.
- A reaction that only calls use cases of its own context is not a workflow: that context's own plugin wires it. A listener that only produces an infrastructure effect (pushing to connected clients, overwriting a cache entry) is infrastructure and never lives here.

## Files inside a use-case folder

Files are named `<use-case>.<kind>` plus the language's extension, with the prefix kept for the same reason as in core: tabs, search results, and stack traces identify the file without its path. Only the kinds a use case actually needs exist. A workflow folder uses the same prefix rule with the kinds `schema`, `handler`, `reaction` and `errors`.

| Kind | Holds |
|---|---|
| `schema` | The runtime validation schemas for the use case's input and output. Their types are derived from them and never declared by hand, so the runtime check and the type can't drift. |
| `handler` | The use-case class: it receives the parsed input, orchestrates repositories and contracts, and returns the output. Its dependencies arrive through its constructor, typed by core interfaces. |
| `errors` | Orchestration errors that aren't domain rules, e.g. a requested entity that doesn't exist. Domain errors stay in core. |
| `plugin` | The HTTP-framework plugin that exposes this use case's route (a JSON endpoint, a page or a page fragment), reusing the same schemas for the request and response. Present only for use cases reachable over HTTP. |
| `socket` | The entry that handles one socket message type for this use case, parsing the message with the same input schema. Present only for use cases a socket message triggers. |
| `mapper` | Pure functions that turn what an entry receives (a request, a socket message, the client's address) into the use case's input. Present only when that translation is more than a field copy, so it can be tested without the framework. |

- An output shape that two or more use cases return (the same entity presented the same way) is declared once, in the context's views file, as a schema plus the function that maps the entity to it. This is an output shape, not an HTML view: HTML components live in infrastructure. A shape only one use case returns stays in that use case's schema.
- Schemas validate **shape only**: types, formats, presence, and conversion from wire values (e.g. an ISO string to a date). A business invariant is never re-checked in a schema, even if that would be easy, because it already lives in the entity or its value objects. Two copies of one rule drift apart silently.
- A use case, like a domain piece, is as large as its flow needs. A handler that orchestrates many steps because the flow has many is essential complexity and stays one handler.
- Tests don't live inside a use-case folder. Keeping them out keeps each folder limited to what ships.

---

## Non-goals

- Doesn't decide which use cases a bounded context exposes or what they guarantee — that's the bounded context's own spec.
- Doesn't govern the event dispatcher or the infrastructure listeners — those are infrastructure, not application-layer files.
