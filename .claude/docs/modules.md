# Modules

Behavior that spans components or would surprise a reader. No application code exists yet, so everything below is the designed behavior from the brief and the confirmed decisions, not observed behavior; check it against the code once it lands.

---

## Cross-component flows

Page load (server-rendered):

1. The request's client IP goes to the location lookup.
2. The resulting coordinates go to the weather API; the posts and users are fetched from the fake-data API and joined by author.
3. The three panels render from whatever came back; each external dependency can degrade on its own without taking down the others.

Live publish and chat:

1. A client sends a publish (or chat) event over the WebSocket.
2. The server validates it, builds the stored object itself (unique id, author, content, formatted time) and appends it to the in-memory history.
3. The server broadcasts it to every connected client.
4. A client that connects later receives the history first.

## Non-obvious behavior

- Location lookup: on a local machine the client IP is a loopback address (`127.0.0.1` or `::1`) and yields no location, so the weather panel needs a fixed default location plus a friendly note saying it is a default; otherwise weather never works in development.
- Feed: posts come from two sources (the read-only fake-data API and visitors publishing live). Whether they share one list, and how ids stay distinct between the two, is undecided (see structure.md).

## Shared guarantees

- The server, not the client, creates the stored post: the client only supplies author name and text, so id and time cannot be forged by a client.
- All live state is process-local memory: it is shared by every connection to the same process and lost on restart.
