import { Html } from "@elysia/html";
import { Icon } from "./icon.component";
import { NameField } from "./name-field.component";

// The brand on the left; on the right the visitor's name and the connection pill, only when the page has a socket.
// On narrow screens the name field wraps to a second row. `data-state` drives the pill colors, and the client script
// changes it with the label.
export const Header = ({ connection }: { connection: boolean }) => (
  <header class="flex flex-wrap items-center gap-x-3 gap-y-2.5 border-b border-border bg-surface px-4 py-3.5 lg:flex-nowrap lg:px-7">
    <div class="mr-auto flex items-center gap-2.5">
      <span class="flex size-9.5 items-center justify-center rounded-field bg-accent text-on-accent">
        <Icon name="smile" class="size-6" />
      </span>
      <span class="font-display text-[22px] font-bold lg:text-[26px]">Happy</span>
    </div>
    {connection && (
      <>
        <NameField />
        <div
          id="connection"
          data-state="connecting"
          class="flex items-center gap-2 rounded-full bg-warning-bg px-3.5 py-1.75 text-warning-text data-[state=closed]:bg-error-bg data-[state=closed]:text-error-text data-[state=open]:bg-success-bg data-[state=open]:text-success-text"
        >
          <span class="size-2 rounded-full bg-current"></span>
          <span id="connection-status" role="status" class="text-[13px] font-bold">
            Connecting
          </span>
        </div>
      </>
    )}
  </header>
);
