// A visitor's chat message as the server stores it; every field is built by the server.
export interface ChatMessage {
  readonly id: string;
  readonly author: string;
  readonly text: string;
  readonly time: string;
}
