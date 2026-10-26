import type { ChatMessage, IChatMessageRepository } from "@core/global-chat";

export const CHAT_HISTORY_SIZE = 50;

// Keeps the most recent chat messages in memory; the oldest is dropped first.
export class MemoryChatStore implements IChatMessageRepository {
  private readonly messages: ChatMessage[] = [];

  constructor(private readonly max = CHAT_HISTORY_SIZE) {}

  add(message: ChatMessage): void {
    this.messages.push(message);
    if (this.messages.length > this.max) this.messages.shift();
  }

  list(): readonly ChatMessage[] {
    return this.messages;
  }
}
