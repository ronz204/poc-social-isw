import { Elysia } from "elysia";
import { html } from "@elysia/html";
import { staticPlugin } from "@elysia/static";
import { container, EnvToken } from "./dock";
import { localWeatherPlugin } from "@app/local-weather/local-weather.plugin";
import { GetWeatherHandlerToken } from "@infra/api/weather/weather.dock";
import { HomeView } from "@infra/views/home.view";

const { PORT } = container.resolve(EnvToken);

new Elysia()
  .use(html())
  .use(staticPlugin({ assets: "public", prefix: "/public" }))
  .use(localWeatherPlugin(container.resolve(GetWeatherHandlerToken)))
  .get("/", async ({ request, server, weatherFor }) =>
    HomeView({ weather: await weatherFor(server?.requestIP(request)?.address) }),
  )
  .listen(PORT);

console.log(`Listening on http://localhost:${PORT}`);
