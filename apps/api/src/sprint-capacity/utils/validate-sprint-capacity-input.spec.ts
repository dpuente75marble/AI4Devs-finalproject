import { validateSprintCapacityInput } from './validate-sprint-capacity-input';

describe('validateSprintCapacityInput', () => {
  it('accepts Gerencia Riesgo with project Riesgo and trims text fields', () => {
    const result = validateSprintCapacityInput({
      sprint: '  Sprint 1  ',
      teamName: ' Gerencia Riesgo ',
      projectName: ' Riesgo ',
      availablePoints: 40,
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toEqual({
        sprint: 'Sprint 1',
        teamName: 'Gerencia Riesgo',
        projectName: 'Riesgo',
        availablePoints: 40,
      });
    }
  });

  it('accepts Gerencia Ahorro with project Ahorro', () => {
    const result = validateSprintCapacityInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Ahorro',
      projectName: 'Ahorro',
      availablePoints: 30,
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.projectName).toBe('Ahorro');
    }
  });

  it('accepts Gerencia Ahorro with project Pasarelas', () => {
    const result = validateSprintCapacityInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Ahorro',
      projectName: 'Pasarelas',
      availablePoints: 25,
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.projectName).toBe('Pasarelas');
    }
  });

  it('rejects Gerencia Riesgo with project Pasarelas', () => {
    const result = validateSprintCapacityInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Riesgo',
      projectName: 'Pasarelas',
      availablePoints: 40,
    });

    expect(result).toEqual({
      valid: false,
      message: 'projectName is not allowed for the selected teamName',
    });
  });

  it('rejects teamName outside catalog', () => {
    const result = validateSprintCapacityInput({
      sprint: 'Sprint 1',
      teamName: 'Platform Team',
      projectName: 'Riesgo',
      availablePoints: 40,
    });

    expect(result).toEqual({
      valid: false,
      message: 'teamName must be a valid gerencia',
    });
  });

  it('rejects missing sprint', () => {
    const result = validateSprintCapacityInput({
      teamName: 'Gerencia Riesgo',
      projectName: 'Riesgo',
      availablePoints: 40,
    });

    expect(result).toEqual({
      valid: false,
      message: 'sprint is required',
    });
  });

  it('rejects empty projectName', () => {
    const result = validateSprintCapacityInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Ahorro',
      projectName: '   ',
      availablePoints: 40,
    });

    expect(result).toEqual({
      valid: false,
      message: 'projectName is required',
    });
  });

  it('rejects missing projectName', () => {
    const result = validateSprintCapacityInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Ahorro',
      availablePoints: 40,
    });

    expect(result).toEqual({
      valid: false,
      message: 'projectName is required',
    });
  });

  it('rejects sprint longer than 100 characters', () => {
    const result = validateSprintCapacityInput({
      sprint: 'a'.repeat(101),
      teamName: 'Gerencia Riesgo',
      projectName: 'Riesgo',
      availablePoints: 40,
    });

    expect(result).toEqual({
      valid: false,
      message: 'sprint must be at most 100 characters',
    });
  });

  it('rejects zero availablePoints', () => {
    const result = validateSprintCapacityInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Riesgo',
      projectName: 'Riesgo',
      availablePoints: 0,
    });

    expect(result).toEqual({
      valid: false,
      message: 'availablePoints must be greater than 0',
    });
  });

  it('rejects non-integer availablePoints', () => {
    const result = validateSprintCapacityInput({
      sprint: 'Sprint 1',
      teamName: 'Gerencia Riesgo',
      projectName: 'Riesgo',
      availablePoints: 12.5,
    });

    expect(result).toEqual({
      valid: false,
      message: 'availablePoints must be a positive integer',
    });
  });
});
