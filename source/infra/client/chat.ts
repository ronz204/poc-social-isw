import { chatItem, type ClientChatMessage } from "./chat.render";
import { connection } from "./socket";

const form = document.querySelector<HTMLFormElement>("#chat-form");
const list = document.querySelector<HTMLElement>("#chat-messages");
const empty = document.querySelector<HTMLElement>("#chat-empty");
const message = document.querySelector<HTMLElement>("#chat-message");
const nameField = document.querySelector<HTMLInputElement>("#chat-name");
const textField = document.querySelector<HTMLInputElement>("#chat-text");

// The same key as the publish form: one saved name for both.
const NAME_KEY = "visitor-name";
const INVALID = "Your name and message can't be empty, and the message can't pass 200 characters.";

type ServerMessage =
  | { type: "chat-history"; messages: ClientChatMessage[] }
  | { type: "chat"; message: ClientChatMessage }
  | { type: "chat-error"; reason: "invalid" };

if (form && list && empty && message && nameField && textField) {
  // The saved name is a convenience: a browser that cannot store it still works.
  try {
    nameField.value = localStorage.getItem(NAME_KEY) ?? "";
  } catch {}

  const setEnabled = (enabled: boolean) => {
    form.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button").forEach((control) => {
      control.disabled = !enabled;
    });
  };
  // The list follows new messages only while the visitor is at the bottom.
  const atBottom = () => list.scrollHeight - list.scrollTop - list.clientHeight < 8;
  const show = (item: ClientChatMessage) => {
    const follow = atBottom();
    empty.hidden = true;
    list.append(chatItem(item));
    if (follow) list.scrollTop = list.scrollHeight;
  };

  setEnabled(false);
  connection.onOpen(() => setEnabled(true));
  connection.onClose(() => setEnabled(false));
  connection.onChat((data: ServerMessage) => {
    // The history replaces the list, so one re-sent after a reconnect never shows a message twice.
    // It arrives oldest first, so appending each leaves the newest at the bottom.
    if (data.type === "chat-history") {
      list.replaceChildren();
      empty.hidden = data.messages.length > 0;
      data.messages.forEach(show);
    } else if (data.type === "chat") show(data.message);
    else if (data.type === "chat-error") message.textContent = INVALID;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameField.value;
    connection.send(JSON.stringify({ type: "chat", name, text: textField.value }));
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {}
    message.textContent = "";
    textField.value = "";
  });
}
