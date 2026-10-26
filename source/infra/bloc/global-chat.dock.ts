import { token, type Module } from "dockdi";
import { ListMessagesHandler } from "@app/global-chat/list-messages/list-messages.handler";
import { SendMessageHandler } from "@app/global-chat/send-message/send-message.handler";
import type { IChatClock, IChatIdIssuer, IChatMessageRepository } from "@core/global-chat";
import { MemoryChatStore } from "./chat.store";

export class GlobalChatDock {
  // tokens
  static readonly messageRepository = token<IChatMessageRepository>("GlobalChatDock.messageRepository");
  static readonly idIssuer = token<IChatIdIssuer>("GlobalChatDock.idIssuer");
  static readonly clock = token<IChatClock>("GlobalChatDock.clock");
  static readonly sendMessage = token<SendMessageHandler>("GlobalChatDock.sendMessage");
  static readonly listMessages = token<ListMessagesHandler>("GlobalChatDock.listMessages");

  // module
  static readonly module: Module = (container) => {
    container.bind(GlobalChatDock.messageRepository).toFactory(() => new MemoryChatStore()).inSingleton();
    container.bind(GlobalChatDock.idIssuer).toValue({ next: () => crypto.randomUUID() });
    container.bind(GlobalChatDock.clock).toValue({ now: () => new Date() });
    container
      .bind(GlobalChatDock.sendMessage)
      .toClass(SendMessageHandler, [GlobalChatDock.messageRepository, GlobalChatDock.idIssuer, GlobalChatDock.clock]);
    container.bind(GlobalChatDock.listMessages).toClass(ListMessagesHandler, [GlobalChatDock.messageRepository]);
  };
}
