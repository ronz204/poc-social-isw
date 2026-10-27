// What the sockets need from a connection, so a test hands them a plain object instead of a real socket.
export interface SocketClient {
  readonly id: string;
  send(text: string): void;
}

export interface SocketHub {
  add(client: SocketClient): void;
  remove(client: SocketClient): void;
  broadcast(text: string): void;
}

// On the shared connection a chat message goes to the chat socket, everything else to the posts socket.
export const isChatMessage = (data: unknown) =>
  typeof data === "object" && data !== null && "type" in data && data.type === "chat";
