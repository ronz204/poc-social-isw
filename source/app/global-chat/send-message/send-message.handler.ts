import type { IChatClock, IChatIdIssuer, IChatMessageRepository } from "@core/global-chat";
import type { SendMessageInput, SendMessageOutput } from "./send-message.schema";

// Builds the message with the server's own id and time and stores it; the history keeps its bound in the repository.
export class SendMessageHandler {
  constructor(
    private readonly messages: IChatMessageRepository,
    private readonly ids: IChatIdIssuer,
    private readonly clock: IChatClock,
  ) {}

  execute({ name, text }: SendMessageInput): SendMessageOutput {
    const message = {
      id: this.ids.next(),
      author: name,
      text,
      time: this.clock.now().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    this.messages.add(message);
    return message;
  }
}
