import { ApiProperty } from '@nestjs/swagger';
import { ALLOWED_TEAM_NAMES, PROJECTS_BY_TEAM_NAME } from '../constants';

export class CreateSprintAbsenceDto {
  @ApiProperty({ example: 'Sprint 1' })
  sprint!: string;

  @ApiProperty({
    example: 'Gerencia Ahorro',
    enum: ALLOWED_TEAM_NAMES,
  })
  teamName!: string;

  @ApiProperty({
    example: 'Pasarelas',
    description:
      'Gerencia Riesgo: Riesgo. Gerencia Ahorro: Ahorro, Pasarelas, Gestionados.',
    enum: [
      ...PROJECTS_BY_TEAM_NAME['Gerencia Riesgo'],
      ...PROJECTS_BY_TEAM_NAME['Gerencia Ahorro'],
    ],
  })
  projectName!: string;

  @ApiProperty({ example: 3, minimum: 1 })
  absenceDays!: number;

  @ApiProperty({ example: 'Team offsite', maxLength: 100 })
  reason!: string;
}
