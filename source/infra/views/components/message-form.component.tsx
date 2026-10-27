import { Html } from "@elysia/html";
import { Icon } from "./icon.component";
import { VisitorAvatar } from "./visitor-avatar.component";

const FIELD =
  "flex flex-1 items-center rounded-field border border-border-control bg-bg px-3.5 py-3 text-muted has-[:disabled]:bg-disabled-bg has-[:disabled]:text-disabled";
const INPUT =
  "min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-muted disabled:placeholder:text-disabled";

// The visitor's avatar, the text field and the round send button, shared by the publish form and the chat form.
// The author name is not asked here: it comes from the header field.
// The client script fills `#<id>-error` with the server's error; the pill hides itself while it is empty.
export const MessageForm = ({
  id,
  textPlaceholder,
  sendLabel,
}: {
  id: string;
  textPlaceholder: string;
  sendLabel: string;
}) => (
  <form id={`${id}-form`} class="flex flex-col gap-2.5">
    <div class="flex items-center gap-2.5">
      <VisitorAvatar class="size-9 text-sm" />
      <label class={FIELD}>
        <input id={`${id}-text`} name="text" placeholder={textPlaceholder} class={INPUT} />
      </label>
      <button
        type="submit"
        aria-label={sendLabel}
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent shadow-send disabled:bg-disabled-bg disabled:text-disabled disabled:shadow-none"
      >
        <Icon name="send" class="size-5" />
      </button>
    </div>
    <div class="flex items-center gap-2 rounded-field bg-error-bg px-3.5 py-2.5 text-error-text has-[p:empty]:hidden">
      <Icon name="circle-alert" class="size-4 shrink-0" />
      <p id={`${id}-error`} role="status" class="text-[13px] font-semibold"></p>
    </div>
  </form>
);
