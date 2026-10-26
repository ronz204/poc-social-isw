import { Elysia } from "elysia";
import type { globalChatSocket } from "@app/global-chat/global-chat.socket";
import type { livePostsSocket, SocketClient } from "@app/live-posts/live-posts.socket";
import type { SlidingWindowLimiter } from "./rate-limiter";

// The one WebSocket endpoint: a chat message goes to the chat socket, everything else to the posts socket.
export const livePostsPlugin = (
  posts: ReturnType<typeof livePostsSocket>,
  chat: ReturnType<typeof globalChatSocket>,
  limiters: SlidingWindowLimiter[],
) => {
  // Elysia's socket wrapper may differ between events, so only its stable id and `send` are kept.
  const clientOf = (ws: { id: string; send(data: string): unknown }): SocketClient => ({
    id: ws.id,
    send: (text) => void ws.send(text),
  });
  const isChat = (data: unknown) => typeof data === "object" && data !== null && "type" in data && data.type === "chat";
  return new Elysia({ name: "live-posts" }).ws("/ws", {
    open: (ws) => {
      posts.open(clientOf(ws));
      chat.open(clientOf(ws));
    },
    message: (ws, data) => (isChat(data) ? chat : posts).message(clientOf(ws), data),
    close: (ws) => {
      posts.close(clientOf(ws));
      limiters.forEach((limiter) => limiter.forget(ws.id));
    },
  });
};
