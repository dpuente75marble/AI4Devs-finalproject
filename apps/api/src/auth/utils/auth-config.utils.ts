import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_AUTH_COOKIE_NAME,
  DEFAULT_AUTH_COOKIE_SAME_SITE,
  DEFAULT_AUTH_COOKIE_SECURE,
  DEFAULT_JWT_EXPIRES_IN,
} from '../auth.constants';

export type AuthCookieOptions = {
  name: string;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAgeMs: number;
};

export function parseExpiresInToSeconds(expiresIn: string): number {
  const match = expiresIn.trim().match(/^(\d+)([smhd])$/);

  if (!match) {
    return 30 * 60;
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return 30 * 60;
  }
}

function parseSameSite(value: string): 'lax' | 'strict' | 'none' {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'strict' || normalized === 'none') {
    return normalized;
  }

  return 'lax';
}

export function getAuthCookieOptions(
  configService: ConfigService,
): AuthCookieOptions {
  const expiresIn = configService.get<string>(
    'JWT_EXPIRES_IN',
    DEFAULT_JWT_EXPIRES_IN,
  );

  return {
    name: configService.get<string>(
      'AUTH_COOKIE_NAME',
      DEFAULT_AUTH_COOKIE_NAME,
    ),
    secure:
      configService.get<string>(
        'AUTH_COOKIE_SECURE',
        DEFAULT_AUTH_COOKIE_SECURE,
      ) === 'true',
    sameSite: parseSameSite(
      configService.get<string>(
        'AUTH_COOKIE_SAME_SITE',
        DEFAULT_AUTH_COOKIE_SAME_SITE,
      ),
    ),
    maxAgeMs: parseExpiresInToSeconds(expiresIn) * 1000,
  };
}
