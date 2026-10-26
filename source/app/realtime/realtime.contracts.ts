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

export interface PublishLimiter {
  allow(clientId: string): boolean;
}

export interface ClientLimiter extends PublishLimiter {
  forget(clientId: string): void;
}
