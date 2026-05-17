import { ApiProperty } from '@nestjs/swagger';

export class ImportErrorDto {
  @ApiProperty({ example: 3 })
  row!: number;

  @ApiProperty({ example: 'story_points must be a non-negative integer' })
  message!: string;
}

export class ImportUserStoriesResponseDto {
  @ApiProperty({ example: 2 })
  imported!: number;

  @ApiProperty({ example: 1 })
  failed!: number;

  @ApiProperty({ type: [ImportErrorDto] })
  errors!: ImportErrorDto[];
}
