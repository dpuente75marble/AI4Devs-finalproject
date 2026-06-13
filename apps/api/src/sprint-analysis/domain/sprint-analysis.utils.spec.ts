import {
  aggregateAbsencesBySprint,
  aggregateCapacityBySprint,
  aggregateDemandBySprint,
  buildSprintAnalysisRows,
  computeAdjustedCapacity,
  computeSprintStatus,
  computeUtilization,
} from './sprint-analysis.utils';

describe('sprint-analysis domain utils', () => {
  describe('computeAdjustedCapacity', () => {
    it('returns max(0, capacity - absences)', () => {
      expect(computeAdjustedCapacity(40, 3)).toBe(37);
      expect(computeAdjustedCapacity(5, 8)).toBe(0);
    });
  });

  describe('computeUtilization', () => {
    it('returns percentage rounded to 2 decimals when adjusted capacity is positive', () => {
      expect(computeUtilization(42, 37)).toBe(113.51);
    });

    it('returns 0 when demand and adjusted capacity are both 0', () => {
      expect(computeUtilization(0, 0)).toBe(0);
    });

    it('returns null when demand is positive and adjusted capacity is 0', () => {
      expect(computeUtilization(10, 0)).toBeNull();
    });
  });

  describe('computeSprintStatus', () => {
    it('returns HEALTHY for demand at or below 80% of adjusted capacity', () => {
      expect(computeSprintStatus(30, 40)).toBe('HEALTHY');
      expect(computeSprintStatus(32, 40)).toBe('HEALTHY');
    });

    it('returns WARNING for demand above 80% and at or below adjusted capacity', () => {
      expect(computeSprintStatus(33, 40)).toBe('WARNING');
      expect(computeSprintStatus(40, 40)).toBe('WARNING');
    });

    it('returns OVERLOADED when demand exceeds adjusted capacity', () => {
      expect(computeSprintStatus(42, 37)).toBe('OVERLOADED');
    });

    it('returns OVERLOADED when adjusted capacity is 0 and demand is positive', () => {
      expect(computeSprintStatus(10, 0)).toBe('OVERLOADED');
    });

    it('returns HEALTHY when adjusted capacity and demand are both 0', () => {
      expect(computeSprintStatus(0, 0)).toBe('HEALTHY');
    });
  });

  describe('aggregateDemandBySprint', () => {
    it('trims sprint names and excludes empty sprint values', () => {
      const demandBySprint = aggregateDemandBySprint([
        { sprint: '  Sprint 1  ', storyPoints: 5 },
        { sprint: 'Sprint 1', storyPoints: 3 },
        { sprint: '   ', storyPoints: 100 },
      ]);

      expect(demandBySprint.get('Sprint 1')).toBe(8);
      expect(demandBySprint.has('')).toBe(false);
      expect(demandBySprint.size).toBe(1);
    });

    it('treats null and undefined storyPoints as 0', () => {
      const demandBySprint = aggregateDemandBySprint([
        { sprint: 'Sprint 2', storyPoints: null },
        { sprint: 'Sprint 2', storyPoints: undefined },
        { sprint: 'Sprint 2', storyPoints: 4 },
      ]);

      expect(demandBySprint.get('Sprint 2')).toBe(4);
    });
  });

  describe('aggregateCapacityBySprint', () => {
    it('treats null and undefined availablePoints as 0', () => {
      const capacityBySprint = aggregateCapacityBySprint([
        { sprint: 'Sprint 3', availablePoints: null },
        { sprint: 'Sprint 3', availablePoints: 20 },
      ]);

      expect(capacityBySprint.get('Sprint 3')).toBe(20);
    });
  });

  describe('aggregateAbsencesBySprint', () => {
    it('treats null and undefined absenceDays as 0', () => {
      const absencesBySprint = aggregateAbsencesBySprint([
        { sprint: 'Sprint 4', absenceDays: null },
        { sprint: 'Sprint 4', absenceDays: 3 },
      ]);

      expect(absencesBySprint.get('Sprint 4')).toBe(3);
    });
  });

  describe('buildSprintAnalysisRows', () => {
    it('returns a HEALTHY sprint row', () => {
      const rows = buildSprintAnalysisRows(
        [{ sprint: 'Sprint 1', storyPoints: 30 }],
        [{ sprint: 'Sprint 1', availablePoints: 40 }],
        [],
      );

      expect(rows).toEqual([
        {
          sprint: 'Sprint 1',
          demand: 30,
          capacity: 40,
          absences: 0,
          adjustedCapacity: 40,
          utilization: 75,
          status: 'HEALTHY',
        },
      ]);
    });

    it('returns a WARNING sprint row', () => {
      const rows = buildSprintAnalysisRows(
        [{ sprint: 'Sprint 2', storyPoints: 33 }],
        [{ sprint: 'Sprint 2', availablePoints: 40 }],
        [],
      );

      expect(rows[0]).toMatchObject({
        sprint: 'Sprint 2',
        utilization: 82.5,
        status: 'WARNING',
      });
    });

    it('returns an OVERLOADED sprint row with adjusted capacity and rounded utilization', () => {
      const rows = buildSprintAnalysisRows(
        [{ sprint: 'Sprint 4', storyPoints: 42 }],
        [{ sprint: 'Sprint 4', availablePoints: 40 }],
        [{ sprint: 'Sprint 4', absenceDays: 3 }],
      );

      expect(rows).toEqual([
        {
          sprint: 'Sprint 4',
          demand: 42,
          capacity: 40,
          absences: 3,
          adjustedCapacity: 37,
          utilization: 113.51,
          status: 'OVERLOADED',
        },
      ]);
    });

    it('returns OVERLOADED when adjusted capacity is 0 and demand is positive', () => {
      const rows = buildSprintAnalysisRows(
        [{ sprint: 'Sprint 5', storyPoints: 10 }],
        [],
        [],
      );

      expect(rows[0]).toMatchObject({
        sprint: 'Sprint 5',
        demand: 10,
        capacity: 0,
        absences: 0,
        adjustedCapacity: 0,
        utilization: null,
        status: 'OVERLOADED',
      });
    });

    it('returns HEALTHY when adjusted capacity and demand are both 0', () => {
      const rows = buildSprintAnalysisRows([], [], []);

      expect(rows).toEqual([]);
    });

    it('handles a sprint without absences', () => {
      const rows = buildSprintAnalysisRows(
        [{ sprint: 'Sprint 6', storyPoints: 20 }],
        [{ sprint: 'Sprint 6', availablePoints: 40 }],
        [],
      );

      expect(rows[0]).toMatchObject({
        absences: 0,
        adjustedCapacity: 40,
      });
    });

    it('handles a sprint without capacity', () => {
      const rows = buildSprintAnalysisRows(
        [{ sprint: 'Sprint 7', storyPoints: 5 }],
        [],
        [],
      );

      expect(rows[0]).toMatchObject({
        demand: 5,
        capacity: 0,
        status: 'OVERLOADED',
      });
    });

    it('handles a sprint without user stories', () => {
      const rows = buildSprintAnalysisRows(
        [],
        [{ sprint: 'Sprint 8', availablePoints: 40 }],
        [],
      );

      expect(rows[0]).toMatchObject({
        demand: 0,
        capacity: 40,
        status: 'HEALTHY',
      });
    });

    it('includes the union of sprints from all sources sorted alphabetically', () => {
      const rows = buildSprintAnalysisRows(
        [{ sprint: 'Sprint C', storyPoints: 5 }],
        [{ sprint: 'Sprint A', availablePoints: 10 }],
        [{ sprint: 'Sprint B', absenceDays: 2 }],
      );

      expect(rows.map((row) => row.sprint)).toEqual([
        'Sprint A',
        'Sprint B',
        'Sprint C',
      ]);
      expect(rows[0]).toMatchObject({ demand: 0, capacity: 10, absences: 0 });
      expect(rows[1]).toMatchObject({ demand: 0, capacity: 0, absences: 2 });
      expect(rows[2]).toMatchObject({ demand: 5, capacity: 0, absences: 0 });
    });
  });
});
