import { Router } from "express";
import type { GetFeedPageHandler } from "./get-feed-page/get-feed-page.handler";

// A later feed page as JSON: its cards as HTML plus whether more remain.
// A missing or unreadable page reads as NaN, which the handler turns into page 1.
export const socialFeedRouter = (getFeedPage: GetFeedPageHandler) =>
  Router().get("/feed", async (req, res) => {
    const feed = await getFeedPage.execute({ page: Number(req.query.page) });
    if (feed.status === "unavailable") {
      res.status(503).json({ html: "", hasMore: false });
      return;
    }
    // `app.render` hands the HTML back as a string; `res.render` would send it as the whole response.
    const html = await new Promise<string>((resolve, reject) =>
      req.app.render("partials/post-cards", { posts: feed.posts }, (error, cards) => (error ? reject(error) : resolve(cards))),
    );
    res.json({ html, hasMore: feed.hasMore });
  });
