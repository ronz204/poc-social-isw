# Modules

Behavior that spans components or would surprise a reader. Everything below is the designed behavior from the brief and the confirmed decisions; check it against the code when a slice changes.

---

## Cross-component flows

Page load (server-rendered):

1. The weather (from the request's client IP, through the location lookup and then the weather API) and the first page of the feed (posts and users from the fake-data API, joined by author) are requested together, not one after the other.
2. The three panels render from whatever came back; each external dependency degrades on its own, so one failure never takes down the others, and the page answers 200 even when both fail. A failure outside any panel falls to a generic error page.
3. Live posts and chat history are not in the HTML: they arrive over the WebSocket after the page loads.

Live publish and chat:

1. The page opens one WebSocket connection; messages carry a `type` that tells a post from a chat message, and the client routes each to its own list.
2. A client sends a publish (or chat) message.
3. The server validates it; if that fails, only the sender gets an error and nothing is stored or broadcast. Otherwise it builds the stored object itself (unique id, author, content, formatted time) and appends it to that kind's in-memory history, which is bounded to its most recent entries.
4. The server broadcasts it to every connected client, the sender included.
5. A client that connects, or reconnects after a drop, receives both histories; on a reconnect they replace the lists on screen instead of adding to them.

## Non-obvious behavior

- Location lookup: on a local machine the client IP is a loopback address (`127.0.0.1` or `::1`) and yields no location, so the weather panel needs a fixed default location plus a friendly note saying it is a default; otherwise weather never works in development.
- Feed: posts come from two sources (the read-only fake-data API and visitors publishing live). They are kept as two separate lists, never merged: live posts show above the API posts, newest first, so their ids never need to avoid the API's numeric ids.
- Feed: the API posts are served in fixed-size pages, and a post whose author is not among the fetched users is left out rather than shown with a placeholder author.
- Posts and chat share the connection but nothing else: their histories are independent.

## Shared guarantees

- The server, not the client, creates the stored post or message: the client only supplies author name and text, so id and time cannot be forged by a client.
- All live state is process-local memory: it is shared by every connection to the same process and lost on restart.
