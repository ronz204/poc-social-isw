import { postItem, type ClientPost } from "./live-posts.render";

const form = document.querySelector<HTMLFormElement>("#live-form");
const list = document.querySelector<HTMLElement>("#live-posts");
const empty = document.querySelector<HTMLElement>("#live-empty");
const message = document.querySelector<HTMLElement>("#live-message");
const nameField = document.querySelector<HTMLInputElement>("#live-name");
const textField = document.querySelector<HTMLInputElement>("#live-text");

const NAME_KEY = "visitor-name";
const INVALID = "Your name and message can't be empty, and the message can't pass 280 characters.";
const TOO_FAST = "You're posting too fast. Please wait a moment and try again.";

type ServerMessage =
  | { type: "history"; posts: ClientPost[] }
  | { type: "post"; post: ClientPost }
  | { type: "error"; reason: "invalid" | "rate_limited" };

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
  const show = (post: ClientPost) => {
    empty.hidden = true;
    list.prepend(postItem(post));
  };

  setEnabled(false);
  const socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
  socket.addEventListener("open", () => setEnabled(true));
  socket.addEventListener("close", () => setEnabled(false));
  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data as string) as ServerMessage;
    // The history arrives oldest first, so showing each at the top leaves the newest first.
    if (data.type === "history") data.posts.forEach(show);
    else if (data.type === "post") show(data.post);
    else message.textContent = data.reason === "rate_limited" ? TOO_FAST : INVALID;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameField.value;
    socket.send(JSON.stringify({ type: "post", name, text: textField.value }));
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {}
    message.textContent = "";
    textField.value = "";
  });
}
