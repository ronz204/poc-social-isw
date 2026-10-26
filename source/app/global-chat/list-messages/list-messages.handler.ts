import type { IChatMessageRepository } from "@core/global-chat";
import type { SendMessageOutput } from "../send-message/send-message.schema";

// The stored chat messages, oldest first, for a client that just connected.
export class ListMessagesHandler {
  constructor(private readonly messages: IChatMessageRepository) {}

  execute(): SendMessageOutput[] {
    return [...this.messages.list()];
  }
}
