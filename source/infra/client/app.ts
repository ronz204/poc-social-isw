import "./live-posts";
import "./chat";
import { connection } from "./socket";

// Not named `status`: in the bundled classic script that would be `window.status`, which only keeps strings.
const connectionStatus = document.querySelector<HTMLElement>("#connection-status");
if (connectionStatus) {
  connection.onOpen(() => (connectionStatus.textContent = "Connected"));
  connection.onClose(() => (connectionStatus.textContent = "Offline, retrying"));
}

const feed = document.querySelector<HTMLElement>("#feed-posts");
const feedStatus = document.querySelector<HTMLElement>("#feed-status");

// Infinite scroll: when the status row comes into view and more posts remain, append the next page.
if (feed && feedStatus) {
  let nextPage = 2;
  let hasMore = feedStatus.dataset.hasMore === "true";
  let loading = false;

  const loadNext = async () => {
    if (loading || !hasMore) return;
    loading = true;
    feedStatus.textContent = "Loading more posts";
    try {
      const response = await fetch(`/feed?page=${nextPage}`);
      if (!response.ok) throw new Error(`status ${response.status}`);
      const body = (await response.json()) as { html: string; hasMore: boolean };
      feed.insertAdjacentHTML("beforeend", body.html);
      nextPage++;
      hasMore = body.hasMore;
      feedStatus.textContent = hasMore ? "" : "No more posts";
      // The row may still be in view after the append; watching it again re-checks.
      if (hasMore) {
        observer.unobserve(feedStatus);
        observer.observe(feedStatus);
      }
    } catch {
      // No re-check here: the observer fires again only when the row leaves and re-enters the view, so a failure never loops.
      feedStatus.textContent = "Could not load more posts";
    } finally {
      loading = false;
    }
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) void loadNext();
  });
  if (hasMore) observer.observe(feedStatus);
}
