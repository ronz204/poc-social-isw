import { connection } from "./socket";

// The header pill: its label and its `data-state` (which the stylesheet colors) follow the connection.
const pill = document.querySelector<HTMLElement>("#connection");
const label = document.querySelector<HTMLElement>("#connection-status");

if (pill && label) {
  const show = (state: string, text: string) => {
    pill.dataset.state = state;
    label.textContent = text;
  };
  connection.onOpen(() => show("open", "Connected"));
  connection.onClose(() => show("closed", "Offline, retrying"));
}
