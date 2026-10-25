import { z } from "zod";

// Bun loads .env on its own; every variable the app reads is declared here.
const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
});

export const env = schema.parse(process.env);
