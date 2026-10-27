import { Html } from "@elysia/html";
import { ICONS, type IconName } from "@infra/icons";

export type { IconName };

// The size and color come from the caller's classes: the stroke follows `currentColor`.
export const Icon = ({ name, class: className }: { name: IconName; class: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class={className}
  >
    {ICONS[name]}
  </svg>
);
