import { createConnection } from "./connection";

// The one connection of the page; live posts, chat and the header status all listen to it.
export const connection = createConnection(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
