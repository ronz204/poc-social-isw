import { Html } from "@elysia/html";
import type { GetWeatherOutput } from "@app/local-weather/get-weather/get-weather.schema";

// `safe` escapes the place name, which comes from a third-party data set.
export const WeatherPanel = ({ weather }: { weather: GetWeatherOutput }) => {
  if (weather.status === "unavailable") {
    return (
      <div class="rounded-2xl bg-slate-200 p-6 text-slate-600">
        <p>Weather is not available right now</p>
      </div>
    );
  }

  const { location, reading } = weather;
  return (
    <div class="rounded-2xl bg-linear-to-br from-amber-300 to-orange-400 p-6 text-slate-900">
      {location.name && (
        <p class="text-sm font-medium">
          📍 <span safe>{location.name}</span>
        </p>
      )}
      <p class="text-6xl font-bold">{Math.round(reading.temperature)}°C</p>
      <p class="mt-2 inline-block rounded-full bg-white/40 px-3 py-1 text-sm">
        💨 Wind {Math.round(reading.windSpeed)} km/h
      </p>
      {location.isDefault && <p class="mt-4 text-xs">Showing San José (default location)</p>}
    </div>
  );
};
