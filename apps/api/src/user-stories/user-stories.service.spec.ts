import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { UserStoriesService } from './user-stories.service';

describe('UserStoriesService', () => {
  let service: UserStoriesService;
  let prisma: {
    userStory: { createMany: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      userStory: { createMany: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserStoriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UserStoriesService);
  });

  function csvFile(content: string, name = 'stories.csv'): Express.Multer.File {
    return {
      fieldname: 'file',
      originalname: name,
      encoding: '7bit',
      mimetype: 'text/csv',
      size: Buffer.byteLength(content),
      buffer: Buffer.from(content),
      destination: '',
      filename: name,
      path: '',
      stream: null as never,
    };
  }

  it('imports extended CSV with team_name and project_name', async () => {
    prisma.userStory.createMany.mockResolvedValue({ count: 1 });

    const csv = `external_id,title,description,story_points,status,sprint,team_name,project_name
US-201,Riesgo scoring,,8,ready,Sprint 2,Gerencia Riesgo,Riesgo`;

    const result = await service.importFromCsv(csvFile(csv));

    expect(result).toEqual({
      imported: 1,
      failed: 0,
      errors: [],
    });
    expect(prisma.userStory.createMany).toHaveBeenCalledWith({
      data: [
        {
          externalId: 'US-201',
          title: 'Riesgo scoring',
          description: '',
          storyPoints: 8,
          status: 'ready',
          sprint: 'Sprint 2',
          teamName: 'Gerencia Riesgo',
          projectName: 'Riesgo',
          source: 'csv',
        },
      ],
    });
  });

  it('imports legacy CSV without team_name and project_name', async () => {
    prisma.userStory.createMany.mockResolvedValue({ count: 1 });

    const csv = `external_id,title,description,story_points,status,sprint
US-101,Login,,5,ready,Sprint 1`;

    const result = await service.importFromCsv(csvFile(csv));

    expect(result).toEqual({
      imported: 1,
      failed: 0,
      errors: [],
    });
    expect(prisma.userStory.createMany).toHaveBeenCalledWith({
      data: [
        {
          externalId: 'US-101',
          title: 'Login',
          description: '',
          storyPoints: 5,
          status: 'ready',
          sprint: 'Sprint 1',
          teamName: null,
          projectName: null,
          source: 'csv',
        },
      ],
    });
  });

  it('rejects non-csv files', async () => {
    await expect(
      service.importFromCsv(csvFile('not csv', 'stories.txt')),
    ).rejects.toThrow(BadRequestException);
  });
});
