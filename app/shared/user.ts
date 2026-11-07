import { z } from "zod";
import {
  EmailSchema,
  UsernameSchema,
  NameSchema,
  PasswordSchema,
  IdShema,
  DatetimeSchema,
  BioSchema,
  MessageSchema,
  JwtTokenSchema,
  AvatarUrlSchema,
} from "./types.js";

export const RegisterPostSchema = z.object({
  username: UsernameSchema,
  name: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});
export type RegisterPost = z.infer<typeof RegisterPostSchema>;

export const LoginPostSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});
export type LoginPost = z.infer<typeof LoginPostSchema>;

export const UserPublicSchema = z.object({
  id: IdShema,
  name: NameSchema,
  email: EmailSchema,
});
export type UserPublic = z.infer<typeof UserPublicSchema>;

export const UserProfileSchema = z.object({
  id: IdShema,
  name: NameSchema,
  email: EmailSchema,
  username: UsernameSchema,
  createdAt: DatetimeSchema,
  bio: BioSchema,
  avatarURL: AvatarUrlSchema,
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const RegisterResponseSchema = z.object({
  message: MessageSchema,
  user: UserPublicSchema,
  access_token: JwtTokenSchema,
});
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const LoginResponseSchema = z.object({
  access_token: JwtTokenSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const JwtPayloadSchema = z.object({
  sub: z.string(),
  username: UsernameSchema,
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
