// Two initials drawn from the author name; decoration only.
export const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

// The four avatar color pairs of the design; the pair comes from the name, so one author keeps one color.
const TONES = ["bg-av1-bg text-av1-fg", "bg-av2-bg text-av2-fg", "bg-av3-bg text-av3-fg", "bg-av4-bg text-av4-fg"];

export const avatarTone = (name: string) => {
  const sum = [...name].reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return TONES[sum % TONES.length]!;
};
