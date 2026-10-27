import { Html } from "@elysia/html";

// The message list the client script fills as messages arrive, and the chat form under it.
export const Chat = () => (
  <section class="flex min-h-0 flex-1 flex-col gap-3">
    <p id="chat-empty" class="rounded-2xl bg-slate-200 p-4 text-center text-slate-600">
      No messages yet
    </p>
    <div id="chat-messages" class="max-h-96 min-h-0 space-y-3 overflow-y-auto lg:max-h-none lg:flex-1"></div>
    <form id="chat-form" class="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
      <input id="chat-name" name="name" maxlength="30" placeholder="Your name" class="w-full rounded-lg border border-slate-300 p-2" />
      <div class="flex items-center gap-2">
        <input id="chat-text" name="text" placeholder="Write a message" class="h-10 flex-1 rounded-lg border border-slate-300 p-2" />
        <button type="submit" aria-label="Send" class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white">
          &#10148;
        </button>
      </div>
      <p id="chat-message" class="text-sm text-amber-700" role="status"></p>
    </form>
  </section>
);
