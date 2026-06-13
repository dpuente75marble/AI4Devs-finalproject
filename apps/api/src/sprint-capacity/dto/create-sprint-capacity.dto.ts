import { ApiProperty } from '@nestjs/swagger';
import { ALLOWED_TEAM_NAMES, PROJECTS_BY_TEAM_NAME } from '../constants';

export class CreateSprintCapacityDto {
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

  @ApiProperty({ example: 40, minimum: 1 })
  availablePoints!: number;
}
