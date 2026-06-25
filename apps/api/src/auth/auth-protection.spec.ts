import {
  INestApplication,
  Module,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { DEFAULT_AUTH_COOKIE_NAME } from './auth.constants';
import { UserStoriesController } from '../user-stories/user-stories.controller';
import { UserStoriesService } from '../user-stories/user-stories.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          JWT_SECRET: 'test-jwt-secret',
          JWT_EXPIRES_IN: '30m',
          AUTH_COOKIE_NAME: DEFAULT_AUTH_COOKIE_NAME,
          AUTH_COOKIE_SECURE: 'false',
          AUTH_COOKIE_SAME_SITE: 'lax',
        }),
      ],
    }),
    AuthModule,
  ],
  controllers: [AppController, UserStoriesController],
  providers: [
    AppService,
    {
      provide: UserStoriesService,
      useValue: {
        findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      },
    },
  ],
})
class AuthProtectionTestModule {}

describe('Auth protection (HTTP)', () => {
  let app: INestApplication<App>;
  let authService: { login: jest.Mock; getMe: jest.Mock };
  let jwtService: JwtService;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      getMe: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthProtectionTestModule],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.init();

    jwtService = app.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/health without cookie returns 200', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200).expect({
      status: 'ok',
      service: 'deliveryops-api',
    });
  });

  it('GET /api/user-stories without cookie returns 401', async () => {
    await request(app.getHttpServer()).get('/api/user-stories').expect(401);
  });

  it('GET /api/auth/me without cookie returns 401', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('GET /api/auth/me with a valid auth cookie returns the public user', async () => {
    authService.getMe.mockResolvedValue({
      id: 'clx000demo000000000000001',
      email: 'pm@deliveryops.local',
      name: 'Demo PM',
    });

    const token = jwtService.sign({ sub: 'clx000demo000000000000001' });

    const response = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', [`${DEFAULT_AUTH_COOKIE_NAME}=${token}`])
      .expect(200);

    const body = response.body as {
      user: {
        id: string;
        email: string;
        name: string;
      };
    };

    expect(body).toEqual({
      user: {
        id: 'clx000demo000000000000001',
        email: 'pm@deliveryops.local',
        name: 'Demo PM',
      },
    });
    expect(body.user).not.toHaveProperty('passwordHash');
  });

  it('GET /api/auth/me with Authorization Bearer only returns 401', async () => {
    const token = jwtService.sign({ sub: 'clx000demo000000000000001' });

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(authService.getMe).not.toHaveBeenCalled();
  });

  it('GET /api/auth/me returns 401 when the authenticated user no longer exists', async () => {
    authService.getMe.mockRejectedValue(new UnauthorizedException());

    const token = jwtService.sign({ sub: 'missing-user-id' });

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', [`${DEFAULT_AUTH_COOKIE_NAME}=${token}`])
      .expect(401);
  });

  it('POST /api/auth/login still sets an HttpOnly auth cookie on success', async () => {
    authService.login.mockResolvedValue({
      user: {
        id: 'clx000demo000000000000001',
        email: 'pm@deliveryops.local',
        name: 'Demo PM',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'pm@deliveryops.local',
        password: 'DeliveryOps123!',
      })
      .expect(200);

    expect(response.body).toEqual({
      user: {
        id: 'clx000demo000000000000001',
        email: 'pm@deliveryops.local',
        name: 'Demo PM',
      },
      message: 'Login successful',
    });

    const setCookie = response.headers['set-cookie'];
    expect(setCookie).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${DEFAULT_AUTH_COOKIE_NAME}=`),
      ]),
    );
    expect(String(setCookie)).toContain('HttpOnly');
  });

  it('POST /api/auth/logout still clears the auth cookie', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .expect(200);

    expect(response.body).toEqual({
      message: 'Logout successful',
    });

    const setCookie = response.headers['set-cookie'];
    expect(String(setCookie)).toContain(`${DEFAULT_AUTH_COOKIE_NAME}=`);
    expect(String(setCookie)).toMatch(/Max-Age=0|Expires=/);
  });
});
