import { avatarTone, initials } from "@infra/avatar";

export interface ClientChatMessage {
  id: string;
  author: string;
  text: string;
  time: string;
}

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
    part("span", "text-[13px] font-extrabold", message.author),
    part("span", "text-xs font-semibold text-muted", message.time),
  );
  const body = document.createElement("div");
  body.className = "flex min-w-0 flex-col gap-1";
  body.append(
    header,
    part("p", "rounded-[4px_16px_16px_16px] bg-neutral-bg px-3.25 py-2.25 text-sm leading-[1.4] wrap-break-word", message.text),
  );
  const item = document.createElement("article");
  item.className = "flex gap-2.5";
  item.append(
    part("span", `flex size-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold ${avatarTone(message.author)}`, initials(message.author)),
    body,
  );
  return item;
};
