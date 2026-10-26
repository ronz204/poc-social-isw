import { z } from "zod";
import type { SocketClient, SocketHub } from "@app/realtime/realtime.contracts";
import type { ListMessagesHandler } from "./list-messages/list-messages.handler";
import type { SendMessageHandler } from "./send-message/send-message.handler";
import { sendMessageInput } from "./send-message/send-message.schema";

export interface ChatLimiter {
  allow(clientId: string): boolean;
}

// The one message a client sends here; the `type` tells chat from posts on the shared connection.
export const chatMessage = sendMessageInput.extend({ type: z.literal("chat") });

const reply = (client: SocketClient, body: object) => client.send(JSON.stringify(body));

// Routes the chat messages of one connection; a bad message only gets an error back to its sender.
// Connections are added to and removed from the hub by the live-posts socket, which owns the endpoint.
export const globalChatSocket = (deps: {
  send: SendMessageHandler;
  list: ListMessagesHandler;
  limiter: ChatLimiter;
  hub: Pick<SocketHub, "broadcast">;
}) => ({
  open(client: SocketClient) {
    reply(client, { type: "chat-history", messages: deps.list.execute() });
  },
  message(client: SocketClient, data: unknown) {
    if (!deps.limiter.allow(client.id)) return reply(client, { type: "chat-error", reason: "rate_limited" });
    const parsed = chatMessage.safeParse(data);
    if (!parsed.success) return reply(client, { type: "chat-error", reason: "invalid" });
    const message = deps.send.execute(parsed.data);
    deps.hub.broadcast(JSON.stringify({ type: "chat", message }));
  },
});
