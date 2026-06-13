export const ALLOWED_STATUSES = [
  'draft',
  'ready',
  'in_progress',
  'done',
  'blocked',
] as const;

export type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export const REQUIRED_CSV_COLUMNS = [
  'external_id',
  'title',
  'story_points',
  'status',
] as const;

export const ALLOWED_CSV_COLUMNS = new Set([
  'external_id',
  'title',
  'description',
  'story_points',
  'status',
  'sprint',
  'team_name',
  'project_name',
]);

export const MAX_CSV_FILE_SIZE_BYTES = 1024 * 1024;
export const MAX_CSV_DATA_ROWS = 200;
