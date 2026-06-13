export const MAX_SPRINT_CAPACITY_FIELD_LENGTH = 100;

export const ALLOWED_TEAM_NAMES = [
  'Gerencia Riesgo',
  'Gerencia Ahorro',
] as const;

export type AllowedTeamName = (typeof ALLOWED_TEAM_NAMES)[number];

export const PROJECTS_BY_TEAM_NAME: Record<
  AllowedTeamName,
  readonly string[]
> = {
  'Gerencia Riesgo': ['Riesgo'],
  'Gerencia Ahorro': ['Ahorro', 'Pasarelas', 'Gestionados'],
};

export const DUPLICATE_CAPACITY_MESSAGE =
  'Capacity already configured for this sprint, team and project';

export const INVALID_TEAM_NAME_MESSAGE = 'teamName must be a valid gerencia';

export const INVALID_PROJECT_NAME_MESSAGE =
  'projectName is not allowed for the selected teamName';
