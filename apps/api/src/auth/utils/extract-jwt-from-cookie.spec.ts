import { DEFAULT_AUTH_COOKIE_NAME } from '../auth.constants';
import {
  extractBearerToken,
  extractJwtFromAuthCookie,
} from './extract-jwt-from-cookie';

describe('extractJwtFromAuthCookie', () => {
  it('returns the JWT from the configured auth cookie', () => {
    const token = extractJwtFromAuthCookie(
      {
        cookies: {
          [DEFAULT_AUTH_COOKIE_NAME]: 'signed.jwt.token',
        },
      } as never,
      DEFAULT_AUTH_COOKIE_NAME,
    );

    expect(token).toBe('signed.jwt.token');
  });

  it('returns null when the auth cookie is missing', () => {
    const token = extractJwtFromAuthCookie(
      {
        cookies: {},
      } as never,
      DEFAULT_AUTH_COOKIE_NAME,
    );

    expect(token).toBeNull();
  });

  it('returns null when the auth cookie is empty', () => {
    const token = extractJwtFromAuthCookie(
      {
        cookies: {
          [DEFAULT_AUTH_COOKIE_NAME]: '',
        },
      } as never,
      DEFAULT_AUTH_COOKIE_NAME,
    );

    expect(token).toBeNull();
  });
});

describe('extractBearerToken', () => {
  it('extracts bearer tokens from Authorization header', () => {
    const token = extractBearerToken({
      headers: {
        authorization: 'Bearer signed.jwt.token',
      },
    } as never);

    expect(token).toBe('signed.jwt.token');
  });
});
