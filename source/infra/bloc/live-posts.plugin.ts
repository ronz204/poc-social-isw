import { Elysia } from "elysia";
import type { livePostsSocket, SocketClient } from "@app/live-posts/live-posts.socket";
import type { SlidingWindowLimiter } from "./rate-limiter";

// The one WebSocket endpoint; global chat joins it later with its own message type.
export const livePostsPlugin = (socket: ReturnType<typeof livePostsSocket>, limiter: SlidingWindowLimiter) => {
  // Elysia's socket wrapper may differ between events, so only its stable id and `send` are kept.
  const clientOf = (ws: { id: string; send(data: string): unknown }): SocketClient => ({
    id: ws.id,
    send: (text) => void ws.send(text),
  });
  return new Elysia({ name: "live-posts" }).ws("/ws", {
    open: (ws) => socket.open(clientOf(ws)),
    message: (ws, data) => socket.message(clientOf(ws), data),
    close: (ws) => {
      socket.close(clientOf(ws));
      limiter.forget(ws.id);
    },
  });
};
