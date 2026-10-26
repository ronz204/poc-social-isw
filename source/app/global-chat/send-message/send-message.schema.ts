import { z } from "zod";

export const MAX_CHAT_NAME = 30;
export const MAX_CHAT_TEXT = 200;

// Only name and text are read: any other field a client sends (an id, a time) is dropped by the parse.
export const sendMessageInput = z.object({
  name: z.string().trim().min(1).max(MAX_CHAT_NAME),
  text: z.string().trim().min(1).max(MAX_CHAT_TEXT),
});
export type SendMessageInput = z.infer<typeof sendMessageInput>;

export const sendMessageOutput = z.object({
  id: z.string(),
  author: z.string(),
  text: z.string(),
  time: z.string(),
});
export type SendMessageOutput = z.infer<typeof sendMessageOutput>;
