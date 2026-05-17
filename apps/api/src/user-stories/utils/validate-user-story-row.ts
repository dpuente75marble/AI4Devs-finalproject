import { ALLOWED_STATUSES } from '../constants';
import type { CsvRow } from './parse-csv';

export type ValidatedUserStoryRow = {
  externalId: string;
  title: string;
  description: string;
  storyPoints: number;
  status: string;
  sprint: string | null;
};

export type RowValidationResult =
  | { valid: true; data: ValidatedUserStoryRow }
  | { valid: false; message: string };

export function validateUserStoryRow(row: CsvRow): RowValidationResult {
  const externalId = row.external_id?.trim();
  if (!externalId) {
    return { valid: false, message: 'external_id is required' };
  }

  const title = row.title?.trim();
  if (!title) {
    return { valid: false, message: 'title is required' };
  }

  const storyPointsRaw = row.story_points?.trim();
  if (storyPointsRaw === undefined || storyPointsRaw === '') {
    return { valid: false, message: 'story_points is required' };
  }

  if (!/^\d+$/.test(storyPointsRaw)) {
    return {
      valid: false,
      message: 'story_points must be a non-negative integer',
    };
  }

  const storyPoints = Number(storyPointsRaw);
  if (!Number.isInteger(storyPoints) || storyPoints < 0) {
    return {
      valid: false,
      message: 'story_points must be a non-negative integer',
    };
  }

  const status = row.status?.trim();
  if (!status) {
    return { valid: false, message: 'status is required' };
  }

  if (!ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
    return {
      valid: false,
      message: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
    };
  }

  const description = row.description?.trim() ?? '';
  const sprint = row.sprint?.trim() || null;

  return {
    valid: true,
    data: {
      externalId,
      title,
      description,
      storyPoints,
      status,
      sprint,
    },
  };
}
