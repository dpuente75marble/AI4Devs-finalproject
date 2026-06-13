import { ApiProperty } from '@nestjs/swagger';

export class SprintCapacityResponseDto {
  @ApiProperty({ example: 'clxyz123' })
  id!: string;

  @ApiProperty({ example: 'Sprint 1' })
  sprint!: string;

  @ApiProperty({ example: 'Gerencia Ahorro' })
  teamName!: string;

  @ApiProperty({ example: 'Pasarelas' })
  projectName!: string;

  @ApiProperty({ example: 40 })
  availablePoints!: number;

  @ApiProperty({ example: '2026-06-13T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-13T10:00:00.000Z' })
  updatedAt!: Date;
}

export class ListSprintCapacityResponseDto {
  @ApiProperty({ type: [SprintCapacityResponseDto] })
  data!: SprintCapacityResponseDto[];

  @ApiProperty({ example: 1 })
  total!: number;
}
