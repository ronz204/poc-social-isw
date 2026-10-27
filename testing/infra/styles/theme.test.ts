import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { themeCss } from "@infra/styles/theme.gen";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const tokens = JSON.parse(read("../../../design/tokens.json")).variables;

describe("themeCss", () => {
  it("turns each color variable into a color token, keeping the design name", () => {
    const css = themeCss(tokens);

    expect(css).toContain("--color-accent: #D9421F;");
    expect(css).toContain("--color-av4-fg: #7A5A00;");
  });

  it("gives the fonts a fallback and renames the two radii", () => {
    const css = themeCss(tokens);

    expect(css).toContain('--font-display: "Fredoka", sans-serif;');
    expect(css).toContain("--radius-field: 12px;");
    expect(css).toContain("--radius-panel: 20px;");
  });

  it("leaves out what Tailwind already covers", () => {
    const css = themeCss(tokens);

    expect(css).not.toContain("space-");
    expect(css).not.toContain("radius-pill");
  });

  it("matches the committed stylesheet block, so the tokens and the theme cannot drift", () => {
    expect(read("../../../source/infra/styles/theme.css")).toBe(themeCss(tokens));
  });
});
