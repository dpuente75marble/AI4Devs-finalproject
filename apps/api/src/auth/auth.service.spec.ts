import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AuthService } from './auth.service';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

type PublicUser = {
  id: string;
  email: string;
  name: string;
};

type LoginResult = {
  user: PublicUser;
};

const DEMO_PASSWORD = 'DeliveryOps123!';

function buildUserRecord(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: 'clx000demo000000000000001',
    name: 'Demo PM',
    email: 'pm@deliveryops.local',
    passwordHash: '$argon2id$v=19$mock$hash',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function buildPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

function buildExpectedLoginResult(user: UserRecord): LoginResult {
  return {
    user: buildPublicUser(user),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock };
  };
  let verifySpy: jest.SpiedFunction<typeof argon2.verify>;

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      user: { findUnique: jest.fn() },
    };

    verifySpy = jest.spyOn(argon2, 'verify');

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => {
    verifySpy.mockRestore();
  });

  describe('login', () => {
    it('returns the expected login response when credentials are valid', async () => {
      const user = buildUserRecord();
      prisma.user.findUnique.mockResolvedValue(user);
      verifySpy.mockResolvedValue(true);

      const result = await service.login(user.email, DEMO_PASSWORD);

      expect(result).toStrictEqual(buildExpectedLoginResult(user));
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(verifySpy).toHaveBeenCalledTimes(1);
      expect(verifySpy).toHaveBeenCalledWith(user.passwordHash, DEMO_PASSWORD);
    });

    it('looks up the user with a normalized email (trim + lowercase)', async () => {
      const user = buildUserRecord();
      prisma.user.findUnique.mockResolvedValue(user);
      verifySpy.mockResolvedValue(true);

      await service.login('  PM@DeliveryOps.Local  ', DEMO_PASSWORD);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'pm@deliveryops.local' },
      });
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('unknown@deliveryops.local', DEMO_PASSWORD),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(verifySpy).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the password is incorrect', async () => {
      const user = buildUserRecord();
      prisma.user.findUnique.mockResolvedValue(user);
      verifySpy.mockResolvedValue(false);

      await expect(
        service.login(user.email, 'WrongPassword1!'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(verifySpy).toHaveBeenCalledTimes(1);
    });

    it('rejects when argon2.verify throws an exception', async () => {
      const user = buildUserRecord();
      const error = new Error('argon2 verify failed');
      prisma.user.findUnique.mockResolvedValue(user);
      verifySpy.mockRejectedValue(error);

      await expect(service.login(user.email, DEMO_PASSWORD)).rejects.toThrow(
        error,
      );

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(verifySpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMe', () => {
    it('returns the public user without passwordHash', async () => {
      const user = buildUserRecord();
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getMe(user.id);

      expect(result).toEqual(buildPublicUser(user));
      expect(result).not.toHaveProperty('passwordHash');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('missing-user-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
