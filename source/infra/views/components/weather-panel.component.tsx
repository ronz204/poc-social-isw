import { Html } from "@elysia/html";
import type { GetWeatherOutput } from "@app/local-weather/get-weather/get-weather.schema";
import { FriendlyMessage } from "./friendly-message.component";
import { Icon } from "./icon.component";

// `safe` escapes the place name, which comes from a third-party data set.
export const WeatherPanel = ({ weather }: { weather: GetWeatherOutput }) => {
  if (weather.status === "unavailable") {
    return <FriendlyMessage icon="cloud-off" text="Weather is not available right now" />;
  }

  const { location, reading } = weather;
  return (
    <div class="flex flex-col gap-2.5 rounded-panel bg-linear-[160deg,var(--color-sun),var(--color-sun-warm)] p-5">
      {location.name && (
        <p class="flex items-center gap-1.5 text-sm font-bold">
          <Icon name="map-pin" class="size-4" />
          <span safe>{location.name}</span>
        </p>
      )}
      <p class="font-display text-[64px] leading-[1.2] font-bold">{Math.round(reading.temperature)}°C</p>
      <p class="flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1.75 text-sm font-bold">
        <Icon name="wind" class="size-4" />
        Wind {Math.round(reading.windSpeed)} km/h
      </p>
      {location.isDefault && <p class="text-xs font-semibold">Showing San José (default location)</p>}
    </div>
  );
};
