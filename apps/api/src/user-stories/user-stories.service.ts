import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { MAX_CSV_FILE_SIZE_BYTES } from './constants';
import { CsvParseError, parseCsv } from './utils/parse-csv';
import {
  validateUserStoryRow,
  type ValidatedUserStoryRow,
} from './utils/validate-user-story-row';

@Injectable()
export class UserStoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.userStory.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data,
      total: data.length,
    };
  }

  async importFromCsv(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Only .csv files are allowed');
    }

    if (file.size > MAX_CSV_FILE_SIZE_BYTES) {
      throw new BadRequestException('CSV file exceeds maximum size of 1MB');
    }

    let rows;
    try {
      ({ rows } = parseCsv(file.buffer));
    } catch (error) {
      if (error instanceof CsvParseError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const errors: { row: number; message: string }[] = [];
    const validRows: ValidatedUserStoryRow[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const result = validateUserStoryRow(row);

      if (!result.valid) {
        errors.push({ row: rowNumber, message: result.message });
        return;
      }

      validRows.push(result.data);
    });

    if (validRows.length > 0) {
      await this.prisma.userStory.createMany({
        data: validRows.map((row) => ({
          externalId: row.externalId,
          title: row.title,
          description: row.description,
          storyPoints: row.storyPoints,
          status: row.status,
          sprint: row.sprint,
          teamName: row.teamName,
          projectName: row.projectName,
          source: 'csv',
        })),
      });
    }

    return {
      imported: validRows.length,
      failed: errors.length,
      errors,
    };
  }
}
