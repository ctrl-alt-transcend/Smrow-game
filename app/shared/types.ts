import * as z from "zod";

// Definition of basic type that can either be used standalone or
// inside an object. see -> ./user.ts for example.

// export const IdShema = z.uuid();
// export type Id = z.infer<typeof IdShema>;


export const RESERVED_USERNAMES = [
    'me',
    'admin',
    'settings',
    'api',
    'u',
    'home',
    'profile',
    'support',
    'game',
];


export const IdSchema = z.string().nonempty();
export type Id = z.infer<typeof IdSchema>;

export const EmailSchema = z.email("Invalid email !");
export type Email = z.infer<typeof EmailSchema>;

export const UsernameSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username too short !")
    .max(30, "Username too long !")
    .regex(/^[a-z0-9_]+$/, 'Wrong character.')
    .refine((v) => !RESERVED_USERNAMES.includes(v), 'Unavailable username');;
export type Username = z.infer<typeof UsernameSchema>;

export const NameSchema = z.string().nonempty("Can't be empty").max(20, "Name too long !");
export type Name = z.infer<typeof NameSchema>;

export const PasswordSchema = z.string().min(8, "Password too short !").max(128, "Password too long !");
export type Password = z.infer<typeof PasswordSchema>;

export const DatetimeSchema = z.iso.datetime();
export type Datetime = z.infer<typeof DatetimeSchema>;

export const BioSchema = z.string().max(1024).optional();
export type Bio = z.infer<typeof BioSchema>;

export const MessageSchema = z.string().nonempty().max(1024);
export type Message = z.infer<typeof MessageSchema>;

export const JwtTokenSchema = z.jwt();
export type JwtToken = z.infer<typeof JwtTokenSchema>;

export const AvatarUrlSchema = z.string().optional();
export type avatarURL = z.infer<typeof AvatarUrlSchema>;



