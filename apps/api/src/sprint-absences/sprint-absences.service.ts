import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { validateSprintAbsenceInput } from './utils/validate-sprint-absence-input';

@Injectable()
export class SprintAbsencesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.sprintAbsence.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data,
      total: data.length,
    };
  }

  async create(input: {
    sprint?: unknown;
    teamName?: unknown;
    projectName?: unknown;
    absenceDays?: unknown;
    reason?: unknown;
  }) {
    const validation = validateSprintAbsenceInput(input);

    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    return this.prisma.sprintAbsence.create({
      data: validation.data,
    });
  }
}
