import { ApiProperty } from '@nestjs/swagger';

export class SprintAbsenceResponseDto {
  @ApiProperty({ example: 'clxyz123' })
  id!: string;

  @ApiProperty({ example: 'Sprint 1' })
  sprint!: string;

  @ApiProperty({ example: 'Gerencia Ahorro' })
  teamName!: string;

  @ApiProperty({ example: 'Pasarelas' })
  projectName!: string;

  @ApiProperty({ example: 3 })
  absenceDays!: number;

  @ApiProperty({ example: 'Team offsite' })
  reason!: string;

  @ApiProperty({ example: '2026-06-13T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-13T10:00:00.000Z' })
  updatedAt!: Date;
}

export class ListSprintAbsenceResponseDto {
  @ApiProperty({ type: [SprintAbsenceResponseDto] })
  data!: SprintAbsenceResponseDto[];

  @ApiProperty({ example: 1 })
  total!: number;
}
