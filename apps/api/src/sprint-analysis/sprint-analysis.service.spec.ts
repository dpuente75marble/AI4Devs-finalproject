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
      {
        sprint: 'Sprint 2',
        storyPoints: 21,
        teamName: 'Gerencia Riesgo',
        projectName: 'Riesgo',
      },
    ]);
    prisma.sprintCapacity.findMany.mockResolvedValue([
      {
        sprint: 'Sprint 2',
        teamName: 'Gerencia Riesgo',
        projectName: 'Riesgo',
        availablePoints: 20,
      },
    ]);
    prisma.sprintAbsence.findMany.mockResolvedValue([
      {
        sprint: 'Sprint 2',
        teamName: 'Gerencia Riesgo',
        projectName: 'Riesgo',
        absenceDays: 0,
      },
    ]);

    const result = await service.findAll();

    expect(prisma.userStory.findMany).toHaveBeenCalledWith({
      select: {
        sprint: true,
        teamName: true,
        projectName: true,
        storyPoints: true,
      },
    });
    expect(prisma.sprintCapacity.findMany).toHaveBeenCalledWith({
      select: {
        sprint: true,
        teamName: true,
        projectName: true,
        availablePoints: true,
      },
    });
    expect(prisma.sprintAbsence.findMany).toHaveBeenCalledWith({
      select: {
        sprint: true,
        teamName: true,
        projectName: true,
        absenceDays: true,
      },
    });
    expect(result).toEqual([
      {
        sprint: 'Sprint 2',
        teamName: 'Gerencia Riesgo',
        projectName: 'Riesgo',
        demand: 21,
        capacity: 20,
        absences: 0,
        adjustedCapacity: 20,
        utilization: 105,
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

  it('excludes demand when user stories lack team or project', async () => {
    prisma.userStory.findMany.mockResolvedValue([
      {
        sprint: 'Sprint 2',
        storyPoints: 10,
        teamName: null,
        projectName: null,
      },
    ]);
    prisma.sprintCapacity.findMany.mockResolvedValue([
      {
        sprint: 'Sprint 2',
        teamName: 'Gerencia Riesgo',
        projectName: 'Riesgo',
        availablePoints: 20,
      },
    ]);
    prisma.sprintAbsence.findMany.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([
      {
        sprint: 'Sprint 2',
        teamName: 'Gerencia Riesgo',
        projectName: 'Riesgo',
        demand: 0,
        capacity: 20,
        absences: 0,
        adjustedCapacity: 20,
        utilization: 0,
        status: 'HEALTHY',
      },
    ]);
  });
});
