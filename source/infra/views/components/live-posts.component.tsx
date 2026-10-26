import { Html } from "@elysia/html";

// The publish form and the list the client script fills as posts arrive.
export const LivePosts = () => (
  <section class="space-y-3">
    <form id="live-form" class="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
      <input id="live-name" name="name" maxlength="30" placeholder="Your name" class="w-full rounded-lg border border-slate-300 p-2" />
      <div class="flex items-center gap-2">
        <input id="live-text" name="text" placeholder="Share something" class="h-10 flex-1 rounded-lg border border-slate-300 p-2" />
        <button type="submit" aria-label="Publish" class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white">
          &#10148;
        </button>
      </div>
      <p id="live-message" class="text-sm text-amber-700" role="status"></p>
    </form>
    <p id="live-empty" class="rounded-2xl bg-slate-200 p-4 text-center text-slate-600">
      No live posts yet
    </p>
    <div id="live-posts" class="space-y-3"></div>
  </section>
);
