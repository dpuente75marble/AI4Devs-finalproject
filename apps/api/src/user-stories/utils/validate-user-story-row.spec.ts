import { validateUserStoryRow } from './validate-user-story-row';

describe('validateUserStoryRow', () => {
  it('accepts a valid row', () => {
    const result = validateUserStoryRow({
      external_id: 'US-101',
      title: 'Login',
      description: 'Desc',
      story_points: '5',
      status: 'ready',
      sprint: 'Sprint 1',
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toEqual({
        externalId: 'US-101',
        title: 'Login',
        description: 'Desc',
        storyPoints: 5,
        status: 'ready',
        sprint: 'Sprint 1',
        teamName: null,
        projectName: null,
      });
    }
  });

  it('maps team_name and project_name when present', () => {
    const result = validateUserStoryRow({
      external_id: 'US-201',
      title: 'Riesgo scoring',
      story_points: '8',
      status: 'ready',
      sprint: 'Sprint 2',
      team_name: ' Gerencia Riesgo ',
      project_name: 'Riesgo',
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.teamName).toBe('Gerencia Riesgo');
      expect(result.data.projectName).toBe('Riesgo');
    }
  });

  it('stores null for missing or blank team_name and project_name', () => {
    const result = validateUserStoryRow({
      external_id: 'US-203',
      title: 'Legacy import',
      story_points: '3',
      status: 'draft',
      sprint: 'Sprint 1',
      team_name: '   ',
      project_name: '',
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.teamName).toBeNull();
      expect(result.data.projectName).toBeNull();
    }
  });

  it('rejects non-numeric story_points', () => {
    const result = validateUserStoryRow({
      external_id: 'US-101',
      title: 'Login',
      story_points: 'abc',
      status: 'ready',
    });

    expect(result).toEqual({
      valid: false,
      message: 'story_points must be a non-negative integer',
    });
  });

  it('rejects invalid status', () => {
    const result = validateUserStoryRow({
      external_id: 'US-101',
      title: 'Login',
      story_points: '3',
      status: 'invalid',
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toContain('status must be one of');
    }
  });

  it('rejects missing title', () => {
    const result = validateUserStoryRow({
      external_id: 'US-101',
      title: '   ',
      story_points: '3',
      status: 'draft',
    });

    expect(result).toEqual({
      valid: false,
      message: 'title is required',
    });
  });
});
