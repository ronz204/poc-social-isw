import type { AddressInfo } from "node:net";
import express, { type Express } from "express";
import { pageEngine } from "@infra/pages/pages.setup";

// An Express app with the EJS pages set up, listening on a free port. `stop` closes it, open connections included.
export const serve = async (mount: (app: Express) => void) => {
  const app = express();
  pageEngine(app);
  mount(app);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    server,
    url: `http://127.0.0.1:${port}`,
    wsUrl: `ws://127.0.0.1:${port}`,
    stop: () => {
      server.closeAllConnections();
      server.close();
    },
  };
};

// Polls until the check passes, so a test waits for a socket message without a fixed sleep.
export const until = async (check: () => boolean, timeout = 2000) => {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeout) throw new Error("timed out waiting for the condition");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};
