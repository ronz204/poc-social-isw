import { Html } from "@elysia/html";
import { IDLE_TONE } from "@infra/avatar";
import { Icon } from "./icon.component";

// The visitor's own avatar: a plain user icon until there is a name. The client script swaps the icon for the
// initials and the idle colors for the name's pair (see visitor-name).
export const VisitorAvatar = ({ class: className }: { class: string }) => (
  <span
    data-visitor-avatar
    class={`flex shrink-0 items-center justify-center rounded-full font-display font-semibold ${IDLE_TONE} ${className}`}
  >
    <Icon name="user" class="size-4" />
    <span data-initials hidden></span>
  </span>
);
