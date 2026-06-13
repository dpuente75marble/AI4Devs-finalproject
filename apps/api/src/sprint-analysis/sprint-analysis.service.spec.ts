import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { SprintAnalysisService } from './sprint-analysis.service';

describe('SprintAnalysisService', () => {
  let service: SprintAnalysisService;
  let prisma: {
    userStory: { findMany: jest.Mock };
    sprintCapacity: { findMany: jest.Mock };
    sprintAbsence: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      userStory: { findMany: jest.fn() },
      sprintCapacity: { findMany: jest.fn() },
      sprintAbsence: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintAnalysisService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(SprintAnalysisService);
  });

  it('reads user stories, capacities and absences and returns aggregated rows', async () => {
    prisma.userStory.findMany.mockResolvedValue([
      { sprint: 'Sprint 4', storyPoints: 42 },
    ]);
    prisma.sprintCapacity.findMany.mockResolvedValue([
      { sprint: 'Sprint 4', availablePoints: 40 },
    ]);
    prisma.sprintAbsence.findMany.mockResolvedValue([
      { sprint: 'Sprint 4', absenceDays: 3 },
    ]);

    const result = await service.findAll();

    expect(prisma.userStory.findMany).toHaveBeenCalledWith({
      select: { sprint: true, storyPoints: true },
    });
    expect(prisma.sprintCapacity.findMany).toHaveBeenCalledWith({
      select: { sprint: true, availablePoints: true },
    });
    expect(prisma.sprintAbsence.findMany).toHaveBeenCalledWith({
      select: { sprint: true, absenceDays: true },
    });
    expect(result).toEqual([
      {
        sprint: 'Sprint 4',
        demand: 42,
        capacity: 40,
        absences: 3,
        adjustedCapacity: 37,
        utilization: 113.51,
        status: 'OVERLOADED',
      },
    ]);
  });

  it('returns an empty array when no sprint data exists', async () => {
    prisma.userStory.findMany.mockResolvedValue([]);
    prisma.sprintCapacity.findMany.mockResolvedValue([]);
    prisma.sprintAbsence.findMany.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
  });
});
