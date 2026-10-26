export interface ClientChatMessage {
  id: string;
  author: string;
  text: string;
  time: string;
}

// Two initials drawn from the author name; decoration only.
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

const part = (tag: string, className: string, text: string) => {
  const element = document.createElement(tag);
  element.className = className;
  // Visitor text goes in as text, never as markup.
  element.textContent = text;
  return element;
};

// One chat message as a DOM element; every visitor string is set with textContent.
export const chatItem = (message: ClientChatMessage) => {
  const header = document.createElement("div");
  header.className = "flex items-center gap-2";
  header.append(
    part("span", "text-sm font-medium", message.author),
    part("span", "text-xs text-slate-500", message.time),
  );
  const body = document.createElement("div");
  body.className = "min-w-0";
  body.append(header, part("p", "mt-1 break-words rounded-2xl bg-slate-100 px-3 py-2 text-slate-700", message.text));
  const item = document.createElement("article");
  item.className = "flex gap-2";
  item.append(
    part("span", "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-300 text-xs font-bold", initials(message.author)),
    body,
  );
  return item;
};
