import { Html } from "@elysia/html";
import { Icon, type IconName } from "./icon.component";

// The calm card shown in place of a panel's content when its data is not available.
export const FriendlyMessage = ({ icon, text }: { icon: IconName; text: string }) => (
  <div class="flex flex-col items-center gap-3 rounded-panel bg-neutral-bg p-6 text-center">
    <span class="flex size-12 items-center justify-center rounded-full bg-surface text-muted">
      <Icon name={icon} class="size-6" />
    </span>
    <p class="text-sm font-semibold text-text-secondary">{text}</p>
  </div>
);
