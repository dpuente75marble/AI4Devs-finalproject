import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { DEFAULT_AUTH_COOKIE_NAME } from '../auth.constants';
import { AuthenticatedUser } from '../types/authenticated-user';
import { extractJwtFromAuthCookie } from '../utils/extract-jwt-from-cookie';

type JwtPayload = {
  sub: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) =>
        extractJwtFromAuthCookie(
          req,
          configService.get<string>(
            'AUTH_COOKIE_NAME',
            DEFAULT_AUTH_COOKIE_NAME,
          ),
        ),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
    };
  }
}
