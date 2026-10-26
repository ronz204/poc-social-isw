import { z } from "zod";

export const getWeatherInput = z.object({ ip: z.string() });
export type GetWeatherInput = z.infer<typeof getWeatherInput>;

const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  name: z.string().optional(),
  isDefault: z.boolean(),
});

const readingSchema = z.object({
  temperature: z.number(), // °C
  windSpeed: z.number(), // km/h
});

export const getWeatherOutput = z.discriminatedUnion("status", [
  z.object({ status: z.literal("ok"), location: locationSchema, reading: readingSchema }),
  z.object({ status: z.literal("unavailable") }),
]);
export type GetWeatherOutput = z.infer<typeof getWeatherOutput>;
