import type { ChatMessage } from "./message.vos";

// The chat messages the process keeps in memory, oldest first; it holds only the most recent ones.
export interface IChatMessageRepository {
  add(message: ChatMessage): void;
  list(): readonly ChatMessage[];
}
