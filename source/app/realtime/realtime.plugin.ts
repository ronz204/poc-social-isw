import { Elysia } from "elysia";
import type { globalChatSocket } from "@app/global-chat/global-chat.socket";
import type { livePostsSocket } from "@app/live-posts/live-posts.socket";
import { isChatMessage, type SocketClient } from "./realtime.contracts";

// The one WebSocket endpoint: a chat message goes to the chat socket, everything else to the posts socket.
export const realtimePlugin = (
  posts: ReturnType<typeof livePostsSocket>,
  chat: ReturnType<typeof globalChatSocket>,
) => {
  // Elysia's socket wrapper may differ between events, so only its stable id and `send` are kept.
  const clientOf = (ws: { id: string; send(data: string): unknown }): SocketClient => ({
    id: ws.id,
    send: (text) => void ws.send(text),
  });
  return new Elysia({ name: "realtime" }).ws("/ws", {
    open: (ws) => {
      posts.open(clientOf(ws));
      chat.open(clientOf(ws));
    },
    message: (ws, data) => (isChatMessage(data) ? chat : posts).message(clientOf(ws), data),
    close: (ws) => posts.close(clientOf(ws)),
  });
};
