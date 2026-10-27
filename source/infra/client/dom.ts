// An element the page must have; its absence is a bug in the markup, so it fails loudly.
export const byId = <T extends HTMLElement>(id: string) => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`#${id} is missing from the page`);
  return element as T;
};

// An element with a class and a text. Visitor text goes in as text, never as markup.
export const part = (tag: string, className: string, text: string) => {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
};
