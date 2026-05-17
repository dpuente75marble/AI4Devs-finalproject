import { ApiProperty } from '@nestjs/swagger';

export class UserStoryResponseDto {
  @ApiProperty({ example: 'clxyz123' })
  id!: string;

  @ApiProperty({ example: 'US-101' })
  externalId!: string;

  @ApiProperty({ example: 'Login de usuario' })
  title!: string;

  @ApiProperty({ example: 'Como usuario quiero iniciar sesión' })
  description!: string;

  @ApiProperty({ example: 5 })
  storyPoints!: number;

  @ApiProperty({ example: 'ready' })
  status!: string;

  @ApiProperty({ example: 'Sprint 1', nullable: true })
  sprint!: string | null;

  @ApiProperty({ example: 'csv' })
  source!: string;

  @ApiProperty({ example: '2026-05-17T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-17T10:00:00.000Z' })
  updatedAt!: Date;
}

export class ListUserStoriesResponseDto {
  @ApiProperty({ type: [UserStoryResponseDto] })
  data!: UserStoryResponseDto[];

  @ApiProperty({ example: 1 })
  total!: number;
}
