import { readFileSync, writeFileSync } from "node:fs";

interface Variable {
  type: "color" | "number" | "string";
  value: string | number;
}

// Design radii that read better as Tailwind utilities (`rounded-field`, `rounded-panel`).
const RENAMED_RADII: Record<string, string> = { "radius-sm": "radius-field", "radius-md": "radius-panel" };

// The theme block for Tailwind, from the variables of the Pencil file. Spacing and the pill radius are left out:
// Tailwind's own scale and `rounded-full` already cover them.
export const themeCss = (variables: Record<string, Variable>) => {
  const lines = Object.entries(variables).flatMap(([name, { type, value }]) => {
    if (type === "color") return [`  --color-${name}: ${value};`];
    if (name.startsWith("font-")) return [`  --${name}: "${value}", sans-serif;`];
    const radius = RENAMED_RADII[name];
    return radius ? [`  --${radius}: ${value}px;`] : [];
  });
  return `/* Generated from design/tokens.json by \`bun run theme\`; edit the tokens, not this file. */\n@theme {\n${lines.join("\n")}\n}\n`;
};

// `bun run theme` regenerates the stylesheet block after the tokens are re-exported from the design.
if (import.meta.main) {
  const tokens = JSON.parse(readFileSync(new URL("../../../design/tokens.json", import.meta.url), "utf8"));
  writeFileSync(new URL("./theme.css", import.meta.url), themeCss(tokens.variables));
}
