import { Html } from "@elysia/html";
import type { GetWeatherOutput } from "@app/local-weather/get-weather/get-weather.schema";
import type { GetFeedPageOutput } from "@app/social-feed/get-feed-page/get-feed-page.schema";
import { Chat } from "./components/chat.component";
import { FeedPosts } from "./components/feed-posts.component";
import { LivePosts } from "./components/live-posts.component";
import { WeatherPanel } from "./components/weather-panel.component";

// Placeholder page; the three-panel layout replaces it in the page-shell slice.
export const HomeView = ({ weather, feed }: { weather: GetWeatherOutput; feed: GetFeedPageOutput }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>poc-social-isw</title>
      <link rel="stylesheet" href="/public/css/app.css" />
    </head>
    <body class="bg-slate-100 text-slate-900">
      <h1 class="p-4 text-2xl font-bold">poc-social-isw</h1>
      <div class="max-w-xs p-4">
        <WeatherPanel weather={weather} />
      </div>
      <main class="max-w-xl space-y-3 p-4">
        <LivePosts />
        <FeedPosts feed={feed} />
      </main>
      <aside class="max-w-sm p-4">
        <Chat />
      </aside>
      <script src="/public/js/app.js"></script>
    </body>
  </html>
);
