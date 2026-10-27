import { avatarTone, initials } from "../avatar";

export interface ClientPost {
  id: string;
  author: string;
  content: string;
  time: string;
}

const part = (tag: string, className: string, text: string) => {
  const element = document.createElement(tag);
  element.className = className;
  // Visitor text goes in as text, never as markup.
  element.textContent = text;
  return element;
};

const row = (className: string, ...children: HTMLElement[]) => {
  const element = document.createElement("div");
  element.className = className;
  element.append(...children);
  return element;
};

// One live post as a DOM element; every visitor string is set with textContent.
export const postItem = (post: ClientPost) => {
  const author = row(
    "flex items-center gap-2.5",
    part("span", `flex size-9 items-center justify-center rounded-full font-display text-sm font-semibold ${avatarTone(post.author)}`, initials(post.author)),
    part("span", "text-sm font-extrabold", post.author),
  );
  const badge = row(
    "flex items-center gap-1.25 rounded-full bg-accent px-2 py-0.75 text-on-accent",
    part("span", "size-1.5 rounded-full bg-on-accent", ""),
    part("span", "text-[11px] font-extrabold", "Live"),
  );
  const meta = row("flex items-center gap-2", badge, part("span", "text-xs font-semibold text-muted", post.time));
  const item = document.createElement("article");
  item.className = "flex flex-col gap-2.5 rounded-panel border border-accent-border bg-accent-tint p-4.5";
  item.append(row("flex items-center justify-between", author, meta), part("p", "text-[15px] leading-[1.45]", post.content));
  return item;
};
