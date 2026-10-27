import type { Server } from "node:http";
import { WebSocketServer } from "ws";
import type { globalChatSocket } from "@app/global-chat/global-chat.socket";
import type { livePostsSocket } from "@app/live-posts/live-posts.socket";
import { isChatMessage, type SocketClient } from "./realtime.contracts";

// The one WebSocket endpoint, twin of the Elysia plugin. It is not an `express.Router()`: a WebSocket never goes
// through Express's request/response cycle, it arrives as an `upgrade` event of the HTTP server, so this takes the server.
export const realtimeRouter = (
  server: Server,
  posts: ReturnType<typeof livePostsSocket>,
  chat: ReturnType<typeof globalChatSocket>,
) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    if (new URL(request.url ?? "", "http://localhost").pathname !== "/ws") return void socket.destroy();
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, request));
  });

  wss.on("connection", (ws) => {
    const client: SocketClient = { id: crypto.randomUUID(), send: (text) => ws.send(text) };
    posts.open(client);
    chat.open(client);

    ws.on("message", (raw) => {
      // `ws` hands over bytes where Elysia hands over parsed JSON. Text that is not JSON goes on as it is:
      // the schema rejects it and the sender gets the usual error back.
      const text = raw.toString();
      let data: unknown = text;
      try {
        data = JSON.parse(text);
      } catch {}
      try {
        (isChatMessage(data) ? chat : posts).message(client, data);
      } catch (error) {
        // One visitor's message never takes the process down or ends the connection.
        console.error(error);
      }
    });
    ws.on("close", () => posts.close(client));
    ws.on("error", () => ws.terminate());
  });
};
