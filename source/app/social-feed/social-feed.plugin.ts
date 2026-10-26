import { Elysia } from "elysia";
import type { GetFeedPageHandler } from "./get-feed-page/get-feed-page.handler";

// Gives a route the feed page it asks for. A missing or unreadable page reads as NaN, which the handler turns into page 1.
export const socialFeedPlugin = (getFeedPage: GetFeedPageHandler) =>
  new Elysia({ name: "social-feed" }).decorate("feedPage", (page: string | undefined) =>
    getFeedPage.execute({ page: Number(page) }),
  );
