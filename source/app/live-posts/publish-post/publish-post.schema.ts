import { z } from "zod";

export const MAX_NAME = 30;
export const MAX_TEXT = 280;

// Only name and text are read: any other field a client sends (an id, a time) is dropped by the parse.
export const publishPostInput = z.object({
  name: z.string().trim().min(1).max(MAX_NAME),
  text: z.string().trim().min(1).max(MAX_TEXT),
});
export type PublishPostInput = z.infer<typeof publishPostInput>;

export const publishPostOutput = z.object({
  id: z.string(),
  author: z.string(),
  content: z.string(),
  time: z.string(),
});
export type PublishPostOutput = z.infer<typeof publishPostOutput>;
