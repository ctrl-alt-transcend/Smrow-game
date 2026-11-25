import type { CookieOptions, Response } from 'express';

export const ACCESS_COOKIE = 'access_token';

const baseOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

export function setAuthCookie(res: Response, token: string) {
  res.cookie(ACCESS_COOKIE, token, {
    ...baseOptions(),
    maxAge: 1000 * 60 * 60, // 1h
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(ACCESS_COOKIE, baseOptions());
}
