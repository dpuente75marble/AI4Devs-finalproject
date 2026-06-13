import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { DUPLICATE_CAPACITY_MESSAGE } from './constants';
import { validateSprintCapacityInput } from './utils/validate-sprint-capacity-input';

@Injectable()
export class SprintCapacityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.sprintCapacity.findMany({
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
    availablePoints?: unknown;
  }) {
    const validation = validateSprintCapacityInput(input);

    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    try {
      return await this.prisma.sprintCapacity.create({
        data: validation.data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(DUPLICATE_CAPACITY_MESSAGE);
      }

      throw error;
    }
  }
}
