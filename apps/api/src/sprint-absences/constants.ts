export const MAX_SPRINT_ABSENCE_FIELD_LENGTH = 100;

export const MAX_REASON_LENGTH = 100;

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

export const INVALID_TEAM_NAME_MESSAGE = 'teamName must be a valid gerencia';

export const INVALID_PROJECT_NAME_MESSAGE =
  'projectName is not allowed for the selected teamName';
