import type { StringValue } from 'ms'

export const AUTH = {
    JWT_FILE: process.env.JWT_SECRET_FILE as string,
    TOKEN_EXPIRATION_TIME: process.env.TOKEN_EXPIRATION_TIME as StringValue,
} as const

export const DATABASE = {
    DEFAULT_DB_PORT: process.env.DEFAULT_DB_PORT,
    DB_PASSWORD_FILE: process.env.DB_PASSWORD_FILE
} as const