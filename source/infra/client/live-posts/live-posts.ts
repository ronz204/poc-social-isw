import { bindMessagePanel } from "../message-panel/message-panel";
import { connection } from "../page-shell/socket";
import { postItem, type ClientPost } from "./live-posts.render";

type ServerMessage =
  | { type: "history"; posts: ClientPost[] }
  | { type: "post"; post: ClientPost }
  | { type: "error"; reason: "invalid" };

const panel = bindMessagePanel<ClientPost>({
  prefix: "live",
  sends: "post",
  invalid: "Your name and message can't be empty, and the message can't pass 280 characters.",
  render: postItem,
  newestFirst: true,
});

connection.onPosts((data: ServerMessage) => {
  if (data.type === "history") panel.history(data.posts);
  else if (data.type === "post") panel.add(data.post);
  else panel.reject();
});
