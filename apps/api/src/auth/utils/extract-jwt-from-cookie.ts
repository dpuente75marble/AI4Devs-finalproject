import type { Request } from 'express';
import { DEFAULT_AUTH_COOKIE_NAME } from '../auth.constants';

export function extractJwtFromAuthCookie(
  req: Request,
  cookieName: string = DEFAULT_AUTH_COOKIE_NAME,
): string | null {
  const token: unknown = req.cookies?.[cookieName];

  if (typeof token !== 'string' || token.length === 0) {
    return null;
  }

  return token;
}

export function extractBearerToken(req: Request): string | null {
  const authorization = req.headers.authorization;

  if (typeof authorization !== 'string') {
    return null;
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}
