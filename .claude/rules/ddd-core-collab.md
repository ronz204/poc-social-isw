---
paths:
  - "**/source/core/**"
  - "**/source/infra/repos/**"
  - "**/source/app/**"
---

# Bounded Context Collaboration Conventions

This governs how bounded contexts work together without knowing each other: how one context refers to another, how a change in one triggers work in another, and how one reads what another owns. Where files live is the layering rule's concern and how each piece is written is the modeling rule's; this one is about the seams between contexts. The common thread is that every context stays understandable and testable alone, and all knowledge of more than one context sits in the application layer.

---

## References between contexts

- A context refers to another context's data by id only, declared as its own identifier value object under its own name. It never holds the other context's entity or imports its types, because the id is the one coupling that survives either side being rewritten.
- A context never imports another context, including for a type. The only shared vocabulary is the shared kernel's, so a type that two contexts both seem to need is either a shared-kernel primitive or two separate types, one per context.

## Reacting to a change: events by default

- A change in one context that must cause work in another travels as an event. The operation returns it, the application layer's handler stores the entity and then dispatches the event in-process to the listeners registered when the app is composed, and a listener (a workflow) calls a use case of the receiving context. The emitting context never knows who listens, because that is what lets a listener be added or removed without editing the emitter.
- Dispatch is best-effort and in-process. All state lives in memory and dies with the process, so there is nothing to recover after a crash and no delivery guarantee to build; a listener that fails must not undo the change that was already stored.
- Consistency across contexts is eventual. A use case changes one context's state, and a rule that seems to need two contexts changed together is a signal the boundary is drawn wrong, not a reason to make one context reach into the other.
- An event is the emitting context's public message: plain values only, never an entity, so a listener depends on the data and not on the emitter's internals. Only the application layer consumes it.

## Reading from another context: a contract in the consumer's language

- When a context needs information another one owns, it declares a role contract of its own (a reader, a resolver) in its own words and types. The application or infrastructure side implements it by calling the owning context. The consumer never learns the owner's model, so a change on the owner's side is absorbed by one adapter, the same role an anti-corruption layer plays.
- The contract returns only what the consumer's rule decides on, never the owner's entity, because a wider return type is how the owner's model leaks into the consumer.

## Orchestration lives in the application layer

- A flow that needs several contexts at once is a workflow in the application layer, never logic inside one of the contexts it touches, because otherwise that context quietly owns a rule about another. The workflow calls each context's use cases in sequence, and no context orchestrates another.
- A workflow whose orchestration has invariants of its own (ordering, compensation after partial failure, idempotency across the boundary) also gets its own spec.

## The shared kernel is not a shortcut

- Only what every context needs enters the shared kernel. Two contexts wanting the same thing does not qualify, because a kernel grown by convenience becomes the hidden coupling the whole separation was meant to avoid. Until a third context needs it, the two contexts each keep their own.

---

## Non-goals

- Doesn't decide which contexts exist or which of them talk to each other; that belongs to each slice's spec.
- Doesn't govern the application or infrastructure layers' own layout, only what they may do between contexts.
