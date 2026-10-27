import { Html } from "@elysia/html";
import { Icon } from "./icon.component";
import { VisitorAvatar } from "./visitor-avatar.component";

// While the name is empty or the field has focus it looks like a field; with a name it folds into a chip.
const OPEN = "has-[input:placeholder-shown]:rounded-field has-[input:placeholder-shown]:border-border-control has-[input:placeholder-shown]:bg-bg";

// The visitor's name, one field for both forms. It is not inside a form: the scripts read it by id.
// On narrow screens it takes a row of its own (the header places it); from `lg` up it sizes to its text.
export const NameField = () => (
  <label
    class={`group order-last flex w-full items-center gap-2 rounded-full border border-transparent bg-neutral-bg py-1 pr-3 pl-1 focus-within:rounded-field focus-within:border-border-control focus-within:bg-bg lg:order-none lg:w-auto ${OPEN}`}
  >
    <VisitorAvatar class="size-7 text-xs group-has-[input:placeholder-shown]:bg-transparent" />
    <input
      id="visitor-name"
      maxlength="30"
      size="8"
      placeholder="Your name"
      autocomplete="nickname"
      class="min-w-0 flex-1 bg-transparent text-sm font-extrabold text-text-primary outline-none placeholder:font-normal placeholder:text-muted lg:field-sizing-content lg:max-w-40 lg:flex-none"
    />
    <Icon name="pencil" class="size-3.5 shrink-0 text-muted group-focus-within:hidden group-has-[input:placeholder-shown]:hidden" />
  </label>
);
