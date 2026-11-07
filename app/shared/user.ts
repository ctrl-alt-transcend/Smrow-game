import { z } from "zod";
import {
  Email,
  Username,
  Name,
  Password,
  Id,
  Datetime,
  Bio,
  Message,
  JwtToken,
} from "./types.js";

export const RegisterPost = z.object({
  username: Username,
  name: Name,
  email: Email,
  password: Password,
});
export type t_registerPost = z.infer<typeof RegisterPost>;

export const LoginPost = z.object({
  email: Email,
  password: Password,
});
export type t_loginPost = z.infer<typeof LoginPost>;

export const UserPublic = z.object({
  id: Id,
  name: Name,
  email: Email,
});
export type t_userPublic = z.infer<typeof UserPublic>;

export const UserProfile = z.object({
  id: Id,
  name: Name,
  email: Email,
  username: Username,
  createdAt: Datetime,
  bio: Bio,
  avatarURL: z.httpUrl(),
});
export type t_userProfile = z.infer<typeof UserProfile>;

export const RegisterResponse = z.object({
  message: Message,
  user: UserPublic,
  access_token: JwtToken,
});
export type t_registerResponse = z.infer<typeof RegisterResponse>;

export const LoginResponse = z.object({
  access_token: JwtToken,
});
export type t_loginResponse = z.infer<typeof LoginResponse>;

export const JwtPayload = z.object({
  sub: z.string(),
  username: Username,
});
export type t_jwtPayload = z.infer<typeof JwtPayload>;
