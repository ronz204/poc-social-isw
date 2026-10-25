import { Elysia } from "elysia";
import { html } from "@elysia/html";
import { staticPlugin } from "@elysia/static";
import { container, EnvToken } from "./dock";
import { HomeView } from "@infra/views/home.view";

const { PORT } = container.resolve(EnvToken);

new Elysia()
  .use(html())
  .use(staticPlugin({ assets: "public", prefix: "/public" }))
  .get("/", () => HomeView())
  .listen(PORT);

console.log(`Listening on http://localhost:${PORT}`);
