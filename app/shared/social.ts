import { z } from "zod";
import {
  UsernameSchema,
  IdSchema,
  ChatContentSchema,
} from "./types.js";

export const ChatMessage = z.object({
  id: z.number().int(),
  date: z.number().int(),
  content: ChatContentSchema,
  username: UsernameSchema,
});
export type ChatMessage = z.infer<typeof ChatMessage>;

export const ChatSendPayloadSchema = z.object({
  draft: ChatContentSchema,
});
export type ChatSendPayload = z.infer<typeof ChatSendPayloadSchema>;

export const GameList = z.object({
  gameId: IdSchema,
  playerCount: z.number().int(),
  state: z.string().nonempty(),
});
export type GameList = z.infer<typeof GameList>;
