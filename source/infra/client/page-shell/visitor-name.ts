import { AVATAR_TONES, avatarTone, IDLE_TONE, initials } from "@infra/avatar";
import { byId } from "../dom";

// One saved name for both forms.
const NAME_KEY = "visitor-name";

const field = byId<HTMLInputElement>("visitor-name");
const listeners: Array<() => void> = [];
const name = () => field.value.trim();

// The saved name is a convenience: a browser that cannot store it still works.
try {
  field.value = localStorage.getItem(NAME_KEY) ?? "";
} catch {}

// Every avatar of the visitor shows the initials and the color of the name, or a plain icon without one.
const paintAvatars = () => {
  const tones = [IDLE_TONE, ...AVATAR_TONES].flatMap((tone) => tone.split(" "));
  for (const avatar of Array.from(document.querySelectorAll<HTMLElement>("[data-visitor-avatar]"))) {
    const text = avatar.querySelector<HTMLElement>("[data-initials]")!;
    text.textContent = initials(name());
    text.toggleAttribute("hidden", name() === "");
    avatar.querySelector("svg")!.toggleAttribute("hidden", name() !== "");
    avatar.classList.remove(...tones);
    avatar.classList.add(...(name() === "" ? IDLE_TONE : avatarTone(name())).split(" "));
  }
};

field.addEventListener("input", () => {
  try {
    localStorage.setItem(NAME_KEY, field.value);
  } catch {}
  paintAvatars();
  listeners.forEach((listener) => listener());
});
// Enter ends the editing, so the field folds back into the chip.
field.addEventListener("keydown", (event) => {
  if (event.key === "Enter") field.blur();
});
paintAvatars();

// The name both forms send, trimmed and empty until the visitor types one.
export const visitor = {
  name,
  onChange: (listener: () => void) => void listeners.push(listener),
};
