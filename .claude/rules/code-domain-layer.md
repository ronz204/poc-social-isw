---
paths:
  - "source/core/**"
---

# Domain Layer Conventions

This governs the domain layer (core): how bounded contexts are laid out and what they may import, the files inside a sub-slice, how each building block is written, and how contexts work together without knowing each other. The project has no database: data is owned by an external API and read over HTTP, or kept by the process in an in-memory collection, and the contracts below are shaped for those two sources. The language idioms rule supplies every language mechanism. The application layer's layout, injection and entries are the application rule's.

---

## Bounded contexts

- One folder per bounded context directly under core, named as a two-word pair; the second word describes that context and is never a suffix repeated across all of them, because a repeated suffix stops carrying information.
- A context imports only the shared kernel, never another context. Core never imports the application layer, infrastructure, runtime config or any framework or I/O library; what it needs from there it declares as a contract, so the domain stays replaceable around its adapters.
- The shared kernel has the same shape as any context and holds only what every context needs. Two contexts wanting the same thing is not enough: each keeps its own until a third needs it.
- Every context uses sub-slice folders, even with one concept today. One barrel at the context root re-exports every sub-slice file; nothing outside imports from a sub-slice folder. The language's visibility gate decides what is public. Exported names are unique across the context and carry their full domain noun (no bare `Id`).

## Sub-slices

- A sub-slice is a cohesive concept: typically one entity (the aggregate root) plus everything that exists only to serve it. Its folder is one short word from inside the context. Split on two concepts, never on size or technical layer; never nest.
- Files are `<subslice>.<kind>` inside `<context>/<subslice>/`, prefix always kept, and only the kinds needed exist. There is no catch-all `contracts` file: a type goes in the file of the contract that carries it, or beside the model it describes.

| Kind | Holds |
|---|---|
| `entity` | The root entity and the state shape its `restore` accepts |
| `parts` | Entities owned by the root |
| `vos` | Value objects, typed ids, closed literal sets |
| `policies` | Pure rules over several values or entities, no I/O: inputs in, verdict out |
| `events` | Domain events the root emits |
| `errors` | The sub-slice's one domain error and its closed code set |
| `repository` | The entity's data-source contract: `find…`, `list…` and, for an entity the process keeps itself, `add`. Data an external API owns gets no `add` |
| `<role>` | One contract the domain needs from outside (`locator`, `broadcaster`), one file each |

## Contracts

- A contract lives in core, in the sub-slice it serves (one every context shares, in the shared kernel), even when only the application calls it, so every dependency points inward. It is written in the domain's language, never a transport's (status code, header, URL, JSON field). One only adapters consume lives beside those adapters.
- Its implementation lives in infrastructure and is named for its transport (HTTP client, in-memory store); the in-memory one doubles as the test double. A repository or role file never re-exports a concrete class.
- A contract states how it fails: the HTTP implementation turns every transport failure into the sub-slice's domain error, so the application layer can degrade one panel without knowing it was HTTP.
- There is no query side. A shape built for one screen is assembled in the application layer from entities.
- An external response is checked with a runtime schema, then every field is parsed with the domain's value-object parsers and the entity rebuilt through `restore`, so drifted data fails on read. The mapper sits beside the HTTP implementation and goes one way. Closed-set fields take their values from the core literal sets.

## Building blocks

- A rule lives with the entity or value object it constrains. Size alone is no smell; anything no domain rule requires (a wrapper, a variant of a base, extra indirection) is removed.
- Every piece is built from a shared-kernel base. A shape outside this table means extending the base once, never hand-rolling a variant in one sub-slice.

| Piece | Built from | Shape |
|---|---|---|
| Value object | Distinct-primitive support plus the text factory (or a hand-written parser) | Same-named declaration with `kind`, `parse`, `is`; type derived from it |
| Identifier | Identifier factory, one per id kind | As a value object; format is the issuer's (the external API's, or the server's) |
| Literal set | Literal-set factory | `kind`, `values`, `parse`, `is`; type derived from `values` |
| Error | Base domain error's `define`, one type per sub-slice | Closed `snake_case` codes with fixed messages |
| Entity, part | Entity base typed by a state extending the base state | Frozen, `restore`, `sameAs`, intention-named factories, protected `with` only when it changes |
| Event | Domain event type | `type`, `entityId`, `occurredAt`, `payload` |

- A value object's parser is its only constructor: it trims first, normalizes, validates and fails with the sub-slice's domain error, passing bounds as structured details. `is` accepts only already-normalized values. No class-based value object with a wrapped field.
- An error carries a stable `snake_case` code; its code type is derived from the code map. Messages are fixed per code, in English, never interpolated; variable data travels in structured details, which also keeps visitor text out of logs.
- Construction is restricted and takes the whole state object, never positional arguments. Creation uses intention-named factories taking `(input, now)`; core never generates ids or reads the clock. A part is created only by an operation of its root.
- `restore` is inherited, trusts its input and is never rewritten. Identity is `sameAs`, never plain equality. No getters or snapshot method: read fields directly; a derived fact is a method named as a computation.
- A state change returns a new instance through the base `with` patch, which never carries the id. An event is named `<entity>.<past_tense_verb>` with plain values. An operation that raises events returns the change result (`next` plus `events`) and never dispatches; one that raises none returns the bare instance.

## Collaboration between contexts

- A context refers to another's data by id only, as its own identifier value object, and never imports its types. A type two contexts both seem to need is a shared-kernel primitive or two separate types.
- A change that must cause work elsewhere travels as an event of plain values: the operation returns it, the application layer dispatches it in-process once the entity is stored, and a listener calls the receiving context. The emitter never knows its listeners. Dispatch is best-effort, since all state dies with the process. Consistency across contexts is eventual.
- To read what another context owns, the consumer declares its own role contract in its own words, returning only what its rule decides on, never the owner's entity.
- A flow that needs several contexts is an application-layer workflow, never logic inside one of them.

---

## Non-goals

- Does not decide which contexts, sub-slices or aggregate boundaries exist, nor which contexts talk; that is each slice's spec.
- Does not govern the application or infrastructure layers' layout.
