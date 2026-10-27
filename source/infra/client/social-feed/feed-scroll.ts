const posts = document.querySelector<HTMLElement>("#feed-posts");
const statusRow = document.querySelector<HTMLElement>("#feed-status");

// Infinite scroll: when the status row comes into view and more posts remain, append the next page.
if (posts && statusRow) {
  let nextPage = 2;
  let hasMore = statusRow.dataset.hasMore === "true";
  let loading = false;

  const loadNext = async () => {
    if (loading || !hasMore) return;
    loading = true;
    statusRow.textContent = "Loading more posts";
    try {
      const response = await fetch(`/feed?page=${nextPage}`);
      if (!response.ok) throw new Error(`status ${response.status}`);
      const body = (await response.json()) as { html: string; hasMore: boolean };
      posts.insertAdjacentHTML("beforeend", body.html);
      nextPage++;
      hasMore = body.hasMore;
      statusRow.textContent = hasMore ? "" : "No more posts";
      // The row may still be in view after the append; watching it again re-checks.
      if (hasMore) {
        observer.unobserve(statusRow);
        observer.observe(statusRow);
      }
    } catch {
      // No re-check here: the observer fires again only when the row leaves and re-enters the view, so a failure never loops.
      statusRow.textContent = "Could not load more posts";
    } finally {
      loading = false;
    }
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) void loadNext();
  });
  if (hasMore) observer.observe(statusRow);
}
