import {
  ALLOWED_TEAM_NAMES,
  INVALID_PROJECT_NAME_MESSAGE,
  INVALID_TEAM_NAME_MESSAGE,
  MAX_REASON_LENGTH,
  MAX_SPRINT_ABSENCE_FIELD_LENGTH,
  PROJECTS_BY_TEAM_NAME,
  type AllowedTeamName,
} from '../constants';

export type ValidatedSprintAbsenceInput = {
  sprint: string;
  teamName: AllowedTeamName;
  projectName: string;
  absenceDays: number;
  reason: string;
};

export type SprintAbsenceValidationResult =
  | { valid: true; data: ValidatedSprintAbsenceInput }
  | { valid: false; message: string };

type SprintAbsenceInput = {
  sprint?: unknown;
  teamName?: unknown;
  projectName?: unknown;
  absenceDays?: unknown;
  reason?: unknown;
};

function parseAbsenceDays(
  value: unknown,
): { valid: true; value: number } | { valid: false; message: string } {
  if (value === undefined || value === null) {
    return { valid: false, message: 'absenceDays is required' };
  }

  if (typeof value === 'number') {
    if (!Number.isInteger(value)) {
      return {
        valid: false,
        message: 'absenceDays must be a positive integer',
      };
    }

    if (value <= 0) {
      return {
        valid: false,
        message: 'absenceDays must be greater than 0',
      };
    }

    return { valid: true, value };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return { valid: false, message: 'absenceDays is required' };
    }

    if (!/^\d+$/.test(trimmed)) {
      return {
        valid: false,
        message: 'absenceDays must be a positive integer',
      };
    }

    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return {
        valid: false,
        message: 'absenceDays must be greater than 0',
      };
    }

    return { valid: true, value: parsed };
  }

  return {
    valid: false,
    message: 'absenceDays must be a positive integer',
  };
}

function validateTextField(
  value: unknown,
  fieldName: 'sprint' | 'teamName' | 'projectName',
): { valid: true; value: string } | { valid: false; message: string } {
  if (value === undefined || value === null) {
    return { valid: false, message: `${fieldName} is required` };
  }

  if (typeof value !== 'string') {
    return { valid: false, message: `${fieldName} is required` };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: `${fieldName} is required` };
  }

  if (trimmed.length > MAX_SPRINT_ABSENCE_FIELD_LENGTH) {
    return {
      valid: false,
      message: `${fieldName} must be at most ${MAX_SPRINT_ABSENCE_FIELD_LENGTH} characters`,
    };
  }

  return { valid: true, value: trimmed };
}

function validateReason(
  value: unknown,
): { valid: true; value: string } | { valid: false; message: string } {
  if (value === undefined || value === null) {
    return { valid: false, message: 'reason is required' };
  }

  if (typeof value !== 'string') {
    return { valid: false, message: 'reason is required' };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: 'reason is required' };
  }

  if (trimmed.length > MAX_REASON_LENGTH) {
    return {
      valid: false,
      message: `reason must be at most ${MAX_REASON_LENGTH} characters`,
    };
  }

  return { valid: true, value: trimmed };
}

function isAllowedTeamName(value: string): value is AllowedTeamName {
  return (ALLOWED_TEAM_NAMES as readonly string[]).includes(value);
}

export function validateSprintAbsenceInput(
  input: SprintAbsenceInput,
): SprintAbsenceValidationResult {
  const sprintResult = validateTextField(input.sprint, 'sprint');
  if (!sprintResult.valid) {
    return sprintResult;
  }

  const teamNameResult = validateTextField(input.teamName, 'teamName');
  if (!teamNameResult.valid) {
    return teamNameResult;
  }

  if (!isAllowedTeamName(teamNameResult.value)) {
    return { valid: false, message: INVALID_TEAM_NAME_MESSAGE };
  }

  const projectNameResult = validateTextField(input.projectName, 'projectName');
  if (!projectNameResult.valid) {
    return projectNameResult;
  }

  const allowedProjects = PROJECTS_BY_TEAM_NAME[teamNameResult.value];
  if (!allowedProjects.includes(projectNameResult.value)) {
    return { valid: false, message: INVALID_PROJECT_NAME_MESSAGE };
  }

  const absenceDaysResult = parseAbsenceDays(input.absenceDays);
  if (!absenceDaysResult.valid) {
    return absenceDaysResult;
  }

  const reasonResult = validateReason(input.reason);
  if (!reasonResult.valid) {
    return reasonResult;
  }

  return {
    valid: true,
    data: {
      sprint: sprintResult.value,
      teamName: teamNameResult.value,
      projectName: projectNameResult.value,
      absenceDays: absenceDaysResult.value,
      reason: reasonResult.value,
    },
  };
}
