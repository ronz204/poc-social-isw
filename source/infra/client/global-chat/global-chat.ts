import { bindMessagePanel } from "../message-panel/message-panel";
import { connection } from "../page-shell/socket";
import { chatItem, type ClientChatMessage } from "./global-chat.render";

type ServerMessage =
  | { type: "chat-history"; messages: ClientChatMessage[] }
  | { type: "chat"; message: ClientChatMessage }
  | { type: "chat-error"; reason: "invalid" };

const panel = bindMessagePanel<ClientChatMessage>({
  prefix: "chat",
  sends: "chat",
  invalid: "Your name and message can't be empty, and the message can't pass 200 characters.",
  render: chatItem,
  newestFirst: false,
});

connection.onChat((data: ServerMessage) => {
  if (data.type === "chat-history") panel.history(data.messages);
  else if (data.type === "chat") panel.add(data.message);
  else panel.reject();
});
