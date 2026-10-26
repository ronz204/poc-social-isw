import { z } from "zod";
import type { SocketClient, SocketHub } from "@app/realtime/realtime.contracts";
import type { ListPostsHandler } from "./list-posts/list-posts.handler";
import type { PublishPostHandler } from "./publish-post/publish-post.handler";
import { publishPostInput } from "./publish-post/publish-post.schema";

// The one message a client sends here; the `type` tells posts from chat on the shared connection.
export const publishPostMessage = publishPostInput.extend({ type: z.literal("post") });

const reply = (client: SocketClient, body: object) => client.send(JSON.stringify(body));

// Routes the post messages of one connection; a bad message only gets an error back to its sender.
export const livePostsSocket = (deps: {
  publish: PublishPostHandler;
  list: ListPostsHandler;
  hub: SocketHub;
}) => ({
  open(client: SocketClient) {
    deps.hub.add(client);
    reply(client, { type: "history", posts: deps.list.execute() });
  },
  close(client: SocketClient) {
    deps.hub.remove(client);
  },
  message(client: SocketClient, data: unknown) {
    const parsed = publishPostMessage.safeParse(data);
    if (!parsed.success) return reply(client, { type: "error", reason: "invalid" });
    const post = deps.publish.execute(parsed.data);
    deps.hub.broadcast(JSON.stringify({ type: "post", post }));
  },
});
