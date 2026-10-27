import { Html } from "@elysia/html";
import { Icon } from "./icon.component";

// The brand on the left; the connection pill on the right only when the page has a socket.
// `data-state` drives the colors, and the client script changes it with the label.
export const Header = ({ connection }: { connection: boolean }) => (
  <header class="flex items-center justify-between border-b border-border bg-surface px-7 py-3.5">
    <div class="flex items-center gap-2.5">
      <span class="flex size-[38px] items-center justify-center rounded-field bg-accent text-on-accent">
        <Icon name="smile" class="size-6" />
      </span>
      <span class="font-display text-[22px] font-bold lg:text-[26px]">Happy</span>
    </div>
    {connection && (
      <div
        id="connection"
        data-state="connecting"
        class="flex items-center gap-2 rounded-full bg-warning-bg px-3.5 py-[7px] text-warning-text data-[state=closed]:bg-error-bg data-[state=closed]:text-error-text data-[state=open]:bg-success-bg data-[state=open]:text-success-text"
      >
        <span class="size-2 rounded-full bg-current"></span>
        <span id="connection-status" role="status" class="text-[13px] font-bold">
          Connecting
        </span>
      </div>
    )}
  </header>
);
