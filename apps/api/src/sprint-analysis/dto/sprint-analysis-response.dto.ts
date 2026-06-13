import { ApiProperty } from '@nestjs/swagger';

export enum SprintAnalysisStatusDto {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  OVERLOADED = 'OVERLOADED',
}

export class SprintAnalysisRowDto {
  @ApiProperty({ example: 'Sprint 4' })
  sprint!: string;

  @ApiProperty({
    example: 42,
    description: 'Sum of story points for the sprint',
  })
  demand!: number;

  @ApiProperty({
    example: 40,
    description: 'Sum of available points configured for the sprint',
  })
  capacity!: number;

  @ApiProperty({
    example: 3,
    description: 'Sum of absence days registered for the sprint',
  })
  absences!: number;

  @ApiProperty({
    example: 37,
    description: 'max(0, capacity - absences)',
  })
  adjustedCapacity!: number;

  @ApiProperty({
    example: 113.51,
    nullable: true,
    description:
      'Demand as a percentage of adjusted capacity; null when demand > 0 and adjusted capacity is 0',
  })
  utilization!: number | null;

  @ApiProperty({
    enum: SprintAnalysisStatusDto,
    example: SprintAnalysisStatusDto.OVERLOADED,
  })
  status!: SprintAnalysisStatusDto;
}
