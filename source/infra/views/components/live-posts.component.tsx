import { Html } from "@elysia/html";
import { EmptyLine } from "./empty-line.component";
import { MessageForm } from "./message-form.component";

// The publish form and the list the client script fills as posts arrive.
export const LivePosts = () => (
  <section class="flex flex-col gap-3.5">
    <MessageForm id="live" textPlaceholder="What's on your mind?" sendLabel="Publish" />
    <EmptyLine id="live-empty" text="No live posts yet" />
    <div id="live-posts" class="flex flex-col gap-3.5"></div>
  </section>
);
