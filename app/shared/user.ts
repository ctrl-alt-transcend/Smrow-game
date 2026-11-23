import { z } from "zod";
import {
  EmailSchema,
  UsernameSchema,
  NameSchema,
  PasswordSchema,
  IdSchema,
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
  id: IdSchema,
  name: NameSchema,
  username: UsernameSchema,
  email: EmailSchema,
});
export type UserPublic = z.infer<typeof UserPublicSchema>;

export const UserProfileSchema = z.object({
  id: IdSchema,
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

export const UpdateProfileSchema = UserProfileSchema
  .omit({ id: true, createdAt: true, avatarURL: true })
  .partial()
  .refine((d) => Object.keys(d).length > 0, "Nothing to update");

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

const imageSizeLimit = 2 * 1024 * 1024 // 2MB

export const UploadImageSchema = z
.instanceof(File)
.refine(
  (file) =>
  [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif"
  ].includes(file.type),
  { message: "Invalid image file type" }
)
.refine((file) => file.size <= imageSizeLimit, {
  message: "Image size should not exceed 5MB",
});
export type UploadImage = z.infer<typeof UploadImageSchema>;

export const FriendSchema = z.object({
  id: IdSchema,
  username: UsernameSchema,
  avatar: AvatarUrlSchema,
  bio: BioSchema,
})
export type Friend = z.infer<typeof FriendSchema>;

export const PublicProfileSchema = z.object({
  username: UsernameSchema,
  name: NameSchema,
  bio: BioSchema,
  avatar: AvatarUrlSchema,
  createdAt: DatetimeSchema,
})
export type PublicProfile = z.infer<typeof PublicProfileSchema>;

export const FriendStatusSchema = FriendSchema.extend({
  isOnline: z.boolean(),
});
export type FriendStatus = z.infer<typeof FriendStatusSchema>;
