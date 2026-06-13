import { validateSprintAbsenceInput } from './validate-sprint-absence-input';

describe('validateSprintAbsenceInput', () => {
  it('accepts Gerencia Riesgo with project Riesgo and trims text fields', () => {
    const result = validateSprintAbsenceInput({
      sprint: '  Sprint 1  ',
      teamName: ' Gerencia Riesgo ',
      projectName: ' Riesgo ',
      absenceDays: 3,
      reason: '  Training  ',
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toEqual({
        sprint: 'Sprint 1',
        teamName: 'Gerencia Riesgo',
        projectName: 'Riesgo',
        absenceDays: 3,
        reason: 'Training',
      });
    }
  });

  it('accepts Gerencia Ahorro with project Pasarelas', () => {
    const result = validateSprintAbsenceInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Ahorro',
      projectName: 'Pasarelas',
      absenceDays: 2,
      reason: 'Team offsite',
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.projectName).toBe('Pasarelas');
    }
  });

  it('rejects Gerencia Riesgo with project Pasarelas', () => {
    const result = validateSprintAbsenceInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Riesgo',
      projectName: 'Pasarelas',
      absenceDays: 3,
      reason: 'Invalid combo',
    });

    expect(result).toEqual({
      valid: false,
      message: 'projectName is not allowed for the selected teamName',
    });
  });

  it('rejects teamName outside catalog', () => {
    const result = validateSprintAbsenceInput({
      sprint: 'Sprint 1',
      teamName: 'Platform Team',
      projectName: 'Riesgo',
      absenceDays: 3,
      reason: 'Unknown team',
    });

    expect(result).toEqual({
      valid: false,
      message: 'teamName must be a valid gerencia',
    });
  });

  it('rejects missing sprint', () => {
    const result = validateSprintAbsenceInput({
      teamName: 'Gerencia Riesgo',
      projectName: 'Riesgo',
      absenceDays: 3,
      reason: 'No sprint',
    });

    expect(result).toEqual({
      valid: false,
      message: 'sprint is required',
    });
  });

  it('rejects empty reason', () => {
    const result = validateSprintAbsenceInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Ahorro',
      projectName: 'Ahorro',
      absenceDays: 3,
      reason: '   ',
    });

    expect(result).toEqual({
      valid: false,
      message: 'reason is required',
    });
  });

  it('rejects reason longer than 100 characters', () => {
    const result = validateSprintAbsenceInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Ahorro',
      projectName: 'Ahorro',
      absenceDays: 3,
      reason: 'a'.repeat(101),
    });

    expect(result).toEqual({
      valid: false,
      message: 'reason must be at most 100 characters',
    });
  });

  it('rejects zero absenceDays', () => {
    const result = validateSprintAbsenceInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Riesgo',
      projectName: 'Riesgo',
      absenceDays: 0,
      reason: 'Zero days',
    });

    expect(result).toEqual({
      valid: false,
      message: 'absenceDays must be greater than 0',
    });
  });

  it('rejects non-integer absenceDays', () => {
    const result = validateSprintAbsenceInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Riesgo',
      projectName: 'Riesgo',
      absenceDays: 2.5,
      reason: 'Half day',
    });

    expect(result).toEqual({
      valid: false,
      message: 'absenceDays must be a positive integer',
    });
  });

  it('rejects sprint longer than 100 characters', () => {
    const result = validateSprintAbsenceInput({
      sprint: 'a'.repeat(101),
      teamName: 'Gerencia Riesgo',
      projectName: 'Riesgo',
      absenceDays: 3,
      reason: 'Long sprint name',
    });

    expect(result).toEqual({
      valid: false,
      message: 'sprint must be at most 100 characters',
    });
  });
});
