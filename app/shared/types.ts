import * as z from "zod";

// Definition of basic type that can either be used standalone or
// inside an object. see -> ./user.ts for example.

export const Id = z.uuid();
export type t_id = z.infer<typeof Id>;

export const Email = z.email("Invalid email !");
export type t_mail = z.infer<typeof Email>;

export const Username = z.string().min(4, "Too short !").max(20, "Too long !");
export type t_username = z.infer<typeof Username>;

export const Name = z.string().min(4, "Too short !").max(20, "Too long !");
export type t_name = z.infer<typeof Name>;

export const Password = z.string().min(8, "Too short !").max(128, "Too long !");
export type t_password = z.infer<typeof Password>;

export const Datetime = z.iso.datetime();
export type t_datetime = z.infer<typeof Datetime>;

export const Bio = z.string().max(1024);
export type t_bio = z.infer<typeof Bio>;

export const Message = z.string().nonempty().max(1024);
export type t_message = z.infer<typeof Message>;

export const JwtToken = z.jwt();
export type t_jwt = z.infer<typeof JwtToken>;
