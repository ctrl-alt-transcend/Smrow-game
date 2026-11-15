import { z } from "zod";
import {
  UsernameSchema,
  IdSchema,
  MessageSchema,
} from "./types.js";

export const ChatMessage = z.object({
  id: z.number().int(),
  date: z.number().int(),
  content: MessageSchema,
  username: UsernameSchema,
});
export type ChatMessage = z.infer<typeof ChatMessage>;

export const GameList = z.object({
  gameId: typeof IdSchema,
  playerCount: z.number().int(),
  state: z.string().nonempty(),
});
export type GameList = z.infer<typeof GameList>;
