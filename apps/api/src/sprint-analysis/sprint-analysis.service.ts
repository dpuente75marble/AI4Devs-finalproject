import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { buildSprintAnalysisRows } from './domain/sprint-analysis.utils';
import type { SprintAnalysisRow } from './domain/sprint-analysis.types';

type UserStoryRecord = {
  sprint: string | null;
  storyPoints: number;
  teamName?: string | null;
  projectName?: string | null;
};

@Injectable()
export class SprintAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SprintAnalysisRow[]> {
    const [userStories, capacities, absences] = await Promise.all([
      this.prisma.userStory.findMany({
        select: { sprint: true, storyPoints: true },
      }) as Promise<UserStoryRecord[]>,
      this.prisma.sprintCapacity.findMany({
        select: {
          sprint: true,
          teamName: true,
          projectName: true,
          availablePoints: true,
        },
      }),
      this.prisma.sprintAbsence.findMany({
        select: {
          sprint: true,
          teamName: true,
          projectName: true,
          absenceDays: true,
        },
      }),
    ]);

    return buildSprintAnalysisRows(
      userStories.map(({ sprint, storyPoints, teamName, projectName }) => ({
        sprint: sprint ?? '',
        teamName: teamName ?? '',
        projectName: projectName ?? '',
        storyPoints,
      })),
      capacities,
      absences,
    );
  }
}
