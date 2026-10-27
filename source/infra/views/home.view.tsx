import { Html } from "@elysia/html";
import type { PropsWithChildren } from "@kitajs/html";
import type { GetWeatherOutput } from "@app/local-weather/get-weather/get-weather.schema";
import type { GetFeedPageOutput } from "@app/social-feed/get-feed-page/get-feed-page.schema";
import { Chat } from "./components/chat.component";
import { FeedPosts } from "./components/feed-posts.component";
import { LivePosts } from "./components/live-posts.component";
import { WeatherPanel } from "./components/weather-panel.component";

// A titled column. On wide screens the page itself does not scroll, so each panel scrolls on its own.
const Panel = ({ id, icon, title, class: extra, children }: PropsWithChildren<{ id: string; icon: string; title: string; class: string }>) => (
  <section id={id} class={`flex min-h-0 flex-col gap-3 lg:p-4 ${extra}`}>
    <h2 class="flex items-center gap-2 text-lg font-bold">
      <span aria-hidden="true">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
);

// Narrow screens stack feed, weather, chat with `order-*`; from `lg` up the source order is the column order.
export const HomeView = ({ weather, feed }: { weather: GetWeatherOutput; feed: GetFeedPageOutput }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Happy</title>
      <link rel="stylesheet" href="/public/css/app.css" />
    </head>
    <body class="flex min-h-dvh flex-col bg-slate-100 text-slate-900 lg:h-dvh lg:overflow-hidden">
      <header class="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <div class="flex items-center gap-2">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">H</span>
          <span class="text-xl font-bold">Happy</span>
        </div>
        <span id="connection-status" class="text-sm text-slate-600" role="status">
          Connecting
        </span>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4 lg:grid lg:min-h-0 lg:grid-cols-[18rem_1fr_24rem] lg:gap-0 lg:p-0">
        <Panel id="weather-panel" icon="🌤" title="Weather" class="order-2 lg:order-none lg:self-start">
          <WeatherPanel weather={weather} />
        </Panel>
        <Panel id="feed-panel" icon="📰" title="Feed" class="order-1 lg:order-none lg:overflow-y-auto">
          <LivePosts />
          <FeedPosts feed={feed} />
        </Panel>
        <Panel id="chat-panel" icon="💬" title="Chat" class="order-3 lg:order-none">
          <Chat />
        </Panel>
      </div>
      <script src="/public/js/app.js"></script>
    </body>
  </html>
);
