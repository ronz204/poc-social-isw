import { Html } from "@elysia/html";
import { Icon } from "./icon.component";

// The quiet line of an empty list; the client script hides it (`hidden`) once an item arrives.
export const EmptyLine = ({ id, text }: { id?: string; text: string }) => (
  <div id={id} class="flex flex-col items-center gap-1.5 py-4 text-muted">
    <Icon name="sparkles" class="size-4.5" />
    <p class="text-[13px] font-semibold">{text}</p>
  </div>
);
