import type { Response } from 'express';
import type { AuthCookieOptions } from './auth-config.utils';

export function setAuthCookie(
  res: Response,
  token: string,
  options: AuthCookieOptions,
): void {
  res.cookie(options.name, token, {
    httpOnly: true,
    secure: options.secure,
    sameSite: options.sameSite,
    path: '/',
    maxAge: options.maxAgeMs,
  });
}

export function clearAuthCookie(
  res: Response,
  options: AuthCookieOptions,
): void {
  res.cookie(options.name, '', {
    httpOnly: true,
    secure: options.secure,
    sameSite: options.sameSite,
    path: '/',
    maxAge: 0,
  });
}
