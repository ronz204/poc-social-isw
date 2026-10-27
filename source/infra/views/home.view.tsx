import { Html } from "@elysia/html";
import type { PropsWithChildren } from "@kitajs/html";
import type { GetWeatherOutput } from "@app/local-weather/get-weather/get-weather.schema";
import type { GetFeedPageOutput } from "@app/social-feed/get-feed-page/get-feed-page.schema";
import { Chat } from "./components/chat.component";
import { FeedPosts } from "./components/feed-posts.component";
import { Head } from "./components/head.component";
import { Header } from "./components/header.component";
import { Icon, type IconName } from "./components/icon.component";
import { LivePosts } from "./components/live-posts.component";
import { WeatherPanel } from "./components/weather-panel.component";

// A titled white card. On wide screens the page itself does not scroll, so `body` lets a panel scroll on its own.
const Panel = ({
  id,
  icon,
  title,
  class: extra,
  body,
  children,
}: PropsWithChildren<{ id: string; icon: IconName; title: string; class: string; body: string }>) => (
  <section id={id} class={`flex min-h-0 flex-col rounded-panel border border-border bg-surface shadow-panel ${extra}`}>
    <h2 class="flex items-center gap-2.5 px-[22px] pt-[18px] pb-2 font-display text-[19px] font-semibold">
      <span class="flex size-[30px] items-center justify-center rounded-[10px] bg-accent-tint text-accent">
        <Icon name={icon} class="size-4" />
      </span>
      {title}
    </h2>
    <div class={`flex min-h-0 flex-1 flex-col gap-3.5 px-[22px] pt-2 pb-[22px] ${body}`}>{children}</div>
  </section>
);

// Narrow screens stack feed, weather, chat with `order-*`; from `lg` up the source order is the column order.
export const HomeView = ({ weather, feed }: { weather: GetWeatherOutput; feed: GetFeedPageOutput }) => (
  <html lang="en">
    <Head />
    <body class="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <Header connection />
      <div class="flex flex-1 flex-col gap-4 p-4 lg:grid lg:min-h-0 lg:grid-cols-[320px_1fr_380px] lg:gap-6 lg:p-6">
        <Panel id="weather-panel" icon="cloud-sun" title="Weather" class="order-2 lg:order-none lg:self-start" body="">
          <WeatherPanel weather={weather} />
        </Panel>
        <Panel id="feed-panel" icon="newspaper" title="Feed" class="order-1 lg:order-none" body="scroll-soft lg:overflow-y-auto">
          <LivePosts />
          <FeedPosts feed={feed} />
        </Panel>
        <Panel id="chat-panel" icon="messages-square" title="Chat" class="order-3 lg:order-none" body="">
          <Chat />
        </Panel>
      </div>
      <script src="/public/js/app.js"></script>
    </body>
  </html>
);
