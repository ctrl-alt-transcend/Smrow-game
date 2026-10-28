import type { StringValue } from 'ms';

export const AUTH = {
  JWT_FILE: process.env.JWT_SECRET_FILE as string,
  TOKEN_EXPIRATION_TIME: process.env.TOKEN_EXPIRATION_TIME as StringValue,
} as const;

export const DB = {
  DEFAULT_DB_PORT: process.env.DEFAULT_DB_PORT as string,
  DB_PASSWORD_FILE: process.env.DB_PASSWORD_FILE as string,

  DB_HOST: process.env.DB_HOST as string,
  DB_PORT: process.env.DB_PORT as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_USER: process.env.DB_USER as string,
} as const;
