import { byId } from "../dom";
import { connection } from "../page-shell/socket";

// One saved name for both forms.
const NAME_KEY = "visitor-name";

interface MessagePanelOptions<T> {
  prefix: string; // the ids of the panel start with it: -form, -name, -text, -error, -empty and -list
  sends: string; // the `type` of the message its form sends
  invalid: string; // what the visitor reads when the server rejects a message
  render: (item: T) => HTMLElement;
  newestFirst: boolean; // new items go on top; otherwise at the bottom, which the list follows while the visitor is there
}

// What a panel of live items does: its form talks to the connection, and its list shows what arrives.
export const bindMessagePanel = <T>({ prefix, sends, invalid, render, newestFirst }: MessagePanelOptions<T>) => {
  const form = byId<HTMLFormElement>(`${prefix}-form`);
  const nameField = byId<HTMLInputElement>(`${prefix}-name`);
  const textField = byId<HTMLInputElement>(`${prefix}-text`);
  const errorLine = byId(`${prefix}-error`);
  const empty = byId(`${prefix}-empty`);
  const list = byId(`${prefix}-list`);

  // The saved name is a convenience: a browser that cannot store it still works.
  try {
    nameField.value = localStorage.getItem(NAME_KEY) ?? "";
  } catch {}

  const setEnabled = (enabled: boolean) => {
    form.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button").forEach((control) => {
      control.disabled = !enabled;
    });
  };
  setEnabled(false);
  connection.onOpen(() => setEnabled(true));
  connection.onClose(() => setEnabled(false));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameField.value;
    connection.send(JSON.stringify({ type: sends, name, text: textField.value }));
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {}
    errorLine.textContent = "";
    textField.value = "";
  });

  const add = (item: T) => {
    empty.hidden = true;
    if (newestFirst) {
      list.prepend(render(item));
      return;
    }
    const follow = list.scrollHeight - list.scrollTop - list.clientHeight < 8;
    list.append(render(item));
    if (follow) list.scrollTop = list.scrollHeight;
  };

  return {
    add,
    // The history replaces the list, so one re-sent after a reconnect never shows an item twice.
    // It arrives oldest first, which `add` turns into the right order for either direction.
    history: (items: T[]) => {
      list.replaceChildren();
      empty.hidden = items.length > 0;
      items.forEach(add);
    },
    reject: () => {
      errorLine.textContent = invalid;
    },
  };
};
