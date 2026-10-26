import type { SocketClient, SocketHub } from "@app/live-posts/live-posts.socket";

// Every open connection; a broadcast reaches all of them and one failing send never stops the rest.
export class ClientHub implements SocketHub {
  private readonly clients = new Map<string, SocketClient>();

  add(client: SocketClient): void {
    this.clients.set(client.id, client);
  }

  remove(client: SocketClient): void {
    this.clients.delete(client.id);
  }

  broadcast(text: string): void {
    for (const client of this.clients.values()) {
      try {
        client.send(text);
      } catch {
        // A dead connection closes on its own and is removed then.
      }
    }
  }
}
