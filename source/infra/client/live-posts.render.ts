export interface ClientPost {
  id: string;
  author: string;
  content: string;
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

// One live post as a DOM element; every visitor string is set with textContent.
export const postItem = (post: ClientPost) => {
  const header = document.createElement("div");
  header.className = "flex items-center gap-2";
  header.append(
    part("span", "flex h-8 w-8 items-center justify-center rounded-full bg-indigo-300 text-xs font-bold", initials(post.author)),
    part("span", "text-sm font-medium", post.author),
    part("span", "rounded-full bg-indigo-600 px-2 text-xs text-white", "Live"),
    part("span", "ml-auto text-xs text-slate-500", post.time),
  );
  const item = document.createElement("article");
  item.className = "rounded-2xl bg-indigo-50 p-4 shadow-sm";
  item.append(header, part("p", "mt-2 text-slate-700", post.content));
  return item;
};
