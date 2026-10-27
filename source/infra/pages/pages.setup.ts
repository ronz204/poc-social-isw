import type { Express } from "express";
import { avatarTone, IDLE_TONE, initials } from "@infra/avatar";
import { ICONS } from "@infra/icons";

// Points an Express app at the EJS pages and gives every page and partial the helpers it uses.
export const pageEngine = (app: Express) => {
  app.set("view engine", "ejs");
  app.set("views", import.meta.dirname);
  Object.assign(app.locals, { icons: ICONS, initials, avatarTone, idleTone: IDLE_TONE });
};
