---
paths:
  - "**/source/core/**"
  - "**/source/infra/repos/**"
---

# Sub-slice Anatomy Conventions

This governs the files inside a sub-slice of a bounded context: the fixed set of file kinds, how repositories and role contracts are declared and named, and how an external response maps back to the domain. Where bounded contexts and sub-slices live, what core may depend on, and the barrel are in the layering rule; this file is only about what goes in a sub-slice's files. Where it needs a language's own mechanism, the language idioms rule for the file's extension supplies it. The project has no database: data is either owned by an external API and read over HTTP, or kept by the process itself in an in-memory collection, and the contracts below are shaped for those two sources.

---

## File naming inside a sub-slice

- Files are named `<subslice>.<kind>` plus the language's extension (the language idioms rule sets the separator between the two), where `<subslice>` matches the folder name, and `<kind>` is one of seven fixed kinds or a role, each answering a single question. A role kind (`locator`, `broadcaster`) names a contract the domain needs from outside other than the entity's own data source, so the kind is the role itself.

| Group | Kind | Holds |
|---|---|---|
| Model | `entity` | The root entity, plus the state shape its reconstitution factory accepts |
| Model | `parts` | Entities owned by the root entity that aren't the root |
| Model | `vos` | Value objects, including the sub-slice's typed identifiers and closed sets of literal values |
| Behavior | `policies` | Pure domain rules that don't belong to a single entity: a decision computed from several values. No I/O; inputs in, verdict out |
| Signals | `events` | Domain events the root entity emits |
| Signals | `errors` | The domain error the sub-slice signals, with its closed set of codes |
| Boundary | `repository` | The entity's data-source contract: `find…` one, `list…` several and, for an entity the process keeps itself, `add`. Data an external API owns gets no `add` |
| Boundary | `<role>` | One contract the domain needs from outside that isn't the entity's data source, one file per contract, with the role as the kind. This replaces a catch-all contracts file |

- There is no catch-all kind and no shared `contracts` file. A type that crosses the boundary goes in the file of the contract that carries it; a type internal to the model goes beside the model it describes, because a catch-all file is where a type ends up whenever its author didn't decide which of those it is.
- One contract per file, named by its role, so a contract is found by its file name and a change to one never touches another. A repository or role file never re-exports a concrete entity or error class; the barrel already does that.
- Repository method names follow fixed verbs, so a reader knows the shape of a call before opening it: `find…` returns the entity or nothing, `list…` returns several, `add` appends to the in-memory collection. A method that needs another verb is usually a role contract, not a repository method.
- There is no query side. A shape built for one screen (a post with its author's name) is assembled in the application layer from entities, so the domain doesn't grow a read model per screen and the repository stays about entities.
- Only the kinds a sub-slice actually needs exist: an empty placeholder communicates nothing a missing file doesn't already communicate.
- The `<subslice>.` prefix is kept even though the folder already disambiguates, so editor tabs, search results and stack traces identify a file without its path.
- Files within a sub-slice import each other directly, never through the barrel. Something from the shared kernel is imported through that context's barrel, never by reaching into one of its sub-slice folders.

## Repositories and role contracts

- A `repository` or role file declares one contract the domain needs from outside, and lives in the sub-slice it serves. A contract every bounded context shares lives in the shared kernel. Every contract stays in core, including ones only the application layer calls, because a contract belongs to the side that depends on it and that keeps every dependency pointing inward.
- A contract interface's name marks it as an interface and carries its role (the language idioms rule says how). Its implementation lives in the infrastructure repos folder and is named for its transport (an HTTP client, an in-memory store), because the project has two sources and the name should say which one an injection site gets. Any other infrastructure implementation ends in `Adapter`. An in-memory implementation also serves as the test double, so a use case runs without network.
- A contract is written in the domain's language (a location, a reading, a post), never a transport's (a status code, a header, a URL, a JSON field name). If only adapters consume an interface and it speaks a transport's vocabulary, it lives beside those adapters and core never declares it. When a contract's signature starts needing that vocabulary, split it into a domain contract in core and an adapter-internal interface in infrastructure.
- A contract states how it fails. An HTTP implementation turns every transport failure (timeout, non-success status, a body of the wrong shape) into the sub-slice's domain error, so the application layer can degrade one panel with a friendly message without knowing it was HTTP.
- Mapping from an external response to a domain object belongs to the HTTP implementation's mapper, beside it, and goes one way only. The response is first checked for shape with a runtime schema at the boundary; then every field is parsed with the same value-object parsers the domain uses and the entity is rebuilt through `restore`, so data that drifted from the domain's rules fails on read instead of flowing in. A field holding a closed set takes its allowed values from the core literal set. An in-memory implementation stores entities as they are and needs no mapper.

---

## Non-goals

- This rule does not decide where bounded contexts or sub-slices live or what core may import; that is the layering rule.
- It does not decide which domain concepts form a sub-slice or where an entity's boundary ends; those are per-bounded-context decisions made in that slice's own `spec.md`.
