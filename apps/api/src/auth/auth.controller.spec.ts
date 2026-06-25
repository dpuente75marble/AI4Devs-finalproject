import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  DEFAULT_AUTH_COOKIE_NAME,
  DEFAULT_AUTH_COOKIE_SAME_SITE,
  DEFAULT_AUTH_COOKIE_SECURE,
  DEFAULT_JWT_EXPIRES_IN,
  LOGIN_SUCCESS_MESSAGE,
  LOGOUT_SUCCESS_MESSAGE,
} from './auth.constants';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; getMe: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let mockResponse: { cookie: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      getMe: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed.jwt.token'),
    };

    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const values: Record<string, string> = {
          JWT_EXPIRES_IN: DEFAULT_JWT_EXPIRES_IN,
          AUTH_COOKIE_NAME: DEFAULT_AUTH_COOKIE_NAME,
          AUTH_COOKIE_SECURE: DEFAULT_AUTH_COOKIE_SECURE,
          AUTH_COOKIE_SAME_SITE: DEFAULT_AUTH_COOKIE_SAME_SITE,
        };

        return values[key] ?? defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    controller = module.get(AuthController);
    mockResponse = {
      cookie: jest.fn(),
    };
  });

  describe('login', () => {
    it('sets an HttpOnly auth cookie on valid login without returning the token in JSON', async () => {
      authService.login.mockResolvedValue({
        user: {
          id: 'clx000demo000000000000001',
          email: 'pm@deliveryops.local',
          name: 'Demo PM',
        },
      });

      const result = await controller.login(
        {
          email: 'pm@deliveryops.local',
          password: 'DeliveryOps123!',
        },
        mockResponse as never,
      );

      expect(authService.login).toHaveBeenCalledWith(
        'pm@deliveryops.local',
        'DeliveryOps123!',
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'clx000demo000000000000001',
      });
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        DEFAULT_AUTH_COOKIE_NAME,
        'signed.jwt.token',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 60 * 1000,
        }),
      );
      expect(result).toEqual({
        user: {
          id: 'clx000demo000000000000001',
          email: 'pm@deliveryops.local',
          name: 'Demo PM',
        },
        message: LOGIN_SUCCESS_MESSAGE,
      });
      expect(result).not.toHaveProperty('token');
      expect(result).not.toHaveProperty('accessToken');
    });

    it('signs a JWT with payload containing only sub', async () => {
      authService.login.mockResolvedValue({
        user: {
          id: 'clx000demo000000000000001',
          email: 'pm@deliveryops.local',
          name: 'Demo PM',
        },
      });

      await controller.login(
        {
          email: 'pm@deliveryops.local',
          password: 'DeliveryOps123!',
        },
        mockResponse as never,
      );

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'clx000demo000000000000001',
      });

      const signCalls = jwtService.sign.mock.calls as Array<
        [Record<string, unknown>]
      >;
      const payload = signCalls[0]?.[0] ?? {};

      expect(Object.keys(payload)).toEqual(['sub']);
      expect(payload).not.toHaveProperty('email');
      expect(payload).not.toHaveProperty('name');
      expect(payload).not.toHaveProperty('role');
      expect(payload).not.toHaveProperty('tenantId');
    });

    it('returns 401 without setting a session cookie when credentials are invalid', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      await expect(
        controller.login(
          {
            email: 'unknown@deliveryops.local',
            password: 'DeliveryOps123!',
          },
          mockResponse as never,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears the auth cookie and returns a success message', () => {
      const result = controller.logout(mockResponse as never);

      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        DEFAULT_AUTH_COOKIE_NAME,
        '',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 0,
        }),
      );
      expect(result).toEqual({
        message: LOGOUT_SUCCESS_MESSAGE,
      });
    });
  });

  describe('me', () => {
    it('returns the authenticated user without passwordHash', async () => {
      authService.getMe.mockResolvedValue({
        id: 'clx000demo000000000000001',
        email: 'pm@deliveryops.local',
        name: 'Demo PM',
      });

      const result = await controller.me({
        user: { userId: 'clx000demo000000000000001' },
      } as never);

      expect(authService.getMe).toHaveBeenCalledWith(
        'clx000demo000000000000001',
      );
      expect(result).toEqual({
        user: {
          id: 'clx000demo000000000000001',
          email: 'pm@deliveryops.local',
          name: 'Demo PM',
        },
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('propagates UnauthorizedException when the user no longer exists', async () => {
      authService.getMe.mockRejectedValue(
        new UnauthorizedException('Unauthorized'),
      );

      await expect(
        controller.me({
          user: { userId: 'missing-user-id' },
        } as never),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
