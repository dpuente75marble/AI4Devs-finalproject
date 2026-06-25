import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DEFAULT_AUTH_COOKIE_NAME } from '../auth.constants';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const values: Record<string, string> = {
          JWT_SECRET: 'test-jwt-secret',
          AUTH_COOKIE_NAME: DEFAULT_AUTH_COOKIE_NAME,
        };

        return values[key] ?? defaultValue;
      }),
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          JWT_SECRET: 'test-jwt-secret',
          AUTH_COOKIE_NAME: DEFAULT_AUTH_COOKIE_NAME,
        };

        if (values[key] === undefined) {
          throw new Error(`Missing config: ${key}`);
        }

        return values[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  it('maps JWT payload sub to authenticated userId', () => {
    expect(strategy.validate({ sub: 'clx000demo000000000000001' })).toEqual({
      userId: 'clx000demo000000000000001',
    });
  });

  it('reads JWT exclusively from the auth cookie extractor', () => {
    const jwtFromRequest = (
      strategy as unknown as {
        _jwtFromRequest: (req: {
          cookies: Record<string, string>;
          headers: Record<string, string>;
        }) => string | null;
      }
    )._jwtFromRequest;

    expect(
      jwtFromRequest({
        cookies: { [DEFAULT_AUTH_COOKIE_NAME]: 'cookie.jwt.token' },
        headers: { authorization: 'Bearer header.jwt.token' },
      }),
    ).toBe('cookie.jwt.token');
  });
});
