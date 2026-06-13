import { ApiProperty } from '@nestjs/swagger';

export enum SprintAnalysisStatusDto {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  OVERLOADED = 'OVERLOADED',
}

export class SprintAnalysisRowDto {
  @ApiProperty({ example: 'Sprint 2' })
  sprint!: string;

  @ApiProperty({ example: 'Gerencia Riesgo' })
  teamName!: string;

  @ApiProperty({ example: 'Riesgo' })
  projectName!: string;

  @ApiProperty({
    example: 21,
    description: 'Sum of story points for the sprint, team and project',
  })
  demand!: number;

  @ApiProperty({
    example: 20,
    description:
      'Sum of available points configured for the sprint, team and project',
  })
  capacity!: number;

  @ApiProperty({
    example: 0,
    description:
      'Sum of absence days registered for the sprint, team and project',
  })
  absences!: number;

  @ApiProperty({
    example: 20,
    description: 'max(0, capacity - absences)',
  })
  adjustedCapacity!: number;

  @ApiProperty({
    example: 105,
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
