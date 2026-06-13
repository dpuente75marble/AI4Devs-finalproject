import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { buildSprintAnalysisRows } from './domain/sprint-analysis.utils';
import type { SprintAnalysisRow } from './domain/sprint-analysis.types';

@Injectable()
export class SprintAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SprintAnalysisRow[]> {
    const [userStories, capacities, absences] = await Promise.all([
      this.prisma.userStory.findMany({
        select: { sprint: true, storyPoints: true },
      }),
      this.prisma.sprintCapacity.findMany({
        select: { sprint: true, availablePoints: true },
      }),
      this.prisma.sprintAbsence.findMany({
        select: { sprint: true, absenceDays: true },
      }),
    ]);

    return buildSprintAnalysisRows(
      userStories.map(({ sprint, storyPoints }) => ({
        sprint: sprint ?? '',
        storyPoints,
      })),
      capacities,
      absences,
    );
  }
}
