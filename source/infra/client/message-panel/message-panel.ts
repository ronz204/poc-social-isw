import { byId } from "../dom";
import { connection } from "../page-shell/socket";
import { visitor } from "../page-shell/visitor-name";

interface MessagePanelOptions<T> {
  prefix: string; // the ids of the panel start with it: -form, -text, -error, -empty and -list
  sends: string; // the `type` of the message its form sends
  invalid: string; // what the visitor reads when the server rejects a message
  render: (item: T) => HTMLElement;
  newestFirst: boolean; // new items go on top; otherwise at the bottom, which the list follows while the visitor is there
}

// What a panel of live items does: its form talks to the connection, and its list shows what arrives.
export const bindMessagePanel = <T>({ prefix, sends, invalid, render, newestFirst }: MessagePanelOptions<T>) => {
  const form = byId<HTMLFormElement>(`${prefix}-form`);
  const textField = byId<HTMLInputElement>(`${prefix}-text`);
  const errorLine = byId(`${prefix}-error`);
  const empty = byId(`${prefix}-empty`);
  const list = byId(`${prefix}-list`);

  // The form works while the connection is open and the visitor has a name; without one it says so.
  const placeholder = textField.placeholder;
  let connected = false;
  const refresh = () => {
    const named = visitor.name() !== "";
    form.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button").forEach((control) => {
      control.disabled = !(connected && named);
    });
    textField.placeholder = named ? placeholder : "Set your name first";
  };
  connection.onOpen(() => {
    connected = true;
    refresh();
  });
  connection.onClose(() => {
    connected = false;
    refresh();
  });
  visitor.onChange(refresh);
  refresh();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    connection.send(JSON.stringify({ type: sends, name: visitor.name(), text: textField.value }));
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
