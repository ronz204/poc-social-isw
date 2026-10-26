import { token, type Module } from "dockdi";
import { ListMessagesHandler } from "@app/global-chat/list-messages/list-messages.handler";
import { SendMessageHandler } from "@app/global-chat/send-message/send-message.handler";
import type { IChatClock, IChatIdIssuer, IChatMessageRepository } from "@core/global-chat";
import { MemoryChatStore } from "../store/chat.memory-store";
import { SlidingWindowLimiter } from "./rate-limiter";

// Ten messages every ten seconds per connection: more permissive than the posts limit.
const CHAT_LIMIT = 10;
const CHAT_WINDOW_MS = 10_000;

export const ChatMessageRepositoryToken = token<IChatMessageRepository>("ChatMessageRepository");
export const ChatIdIssuerToken = token<IChatIdIssuer>("ChatIdIssuer");
export const ChatClockToken = token<IChatClock>("ChatClock");
export const ChatLimiterToken = token<SlidingWindowLimiter>("ChatLimiter");
export const SendMessageHandlerToken = token<SendMessageHandler>("SendMessageHandler");
export const ListMessagesHandlerToken = token<ListMessagesHandler>("ListMessagesHandler");

export const globalChatDock: Module = (container) => {
  // Store and limiter are one instance for the whole process: a second one would keep its own state.
  container.bind(ChatMessageRepositoryToken).toFactory(() => new MemoryChatStore()).inSingleton();
  container
    .bind(ChatLimiterToken)
    .toFactory(() => new SlidingWindowLimiter(CHAT_LIMIT, CHAT_WINDOW_MS))
    .inSingleton();
  container.bind(ChatIdIssuerToken).toValue({ next: () => crypto.randomUUID() });
  container.bind(ChatClockToken).toValue({ now: () => new Date() });
  container
    .bind(SendMessageHandlerToken)
    .toClass(SendMessageHandler, [ChatMessageRepositoryToken, ChatIdIssuerToken, ChatClockToken]);
  container.bind(ListMessagesHandlerToken).toClass(ListMessagesHandler, [ChatMessageRepositoryToken]);
};
