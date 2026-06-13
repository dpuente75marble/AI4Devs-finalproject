import { computeAdjustedCapacity as computeAdjustedCapacityFromAbsences } from '../../sprint-absences/utils/compute-adjusted-capacity';
import type {
  SprintAnalysisAbsenceInput,
  SprintAnalysisCapacityInput,
  SprintAnalysisRow,
  SprintAnalysisStatus,
  SprintAnalysisUserStoryInput,
} from './sprint-analysis.types';

function normalizeSprint(sprint: string): string | null {
  const trimmed = sprint.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function toNumeric(value: number | null | undefined): number {
  return value ?? 0;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function aggregateDemandBySprint(
  userStories: SprintAnalysisUserStoryInput[],
): Map<string, number> {
  const demandBySprint = new Map<string, number>();

  for (const userStory of userStories) {
    const sprint = normalizeSprint(userStory.sprint);
    if (sprint === null) {
      continue;
    }

    const currentDemand = demandBySprint.get(sprint) ?? 0;
    demandBySprint.set(sprint, currentDemand + toNumeric(userStory.storyPoints));
  }

  return demandBySprint;
}

export function aggregateCapacityBySprint(
  capacities: SprintAnalysisCapacityInput[],
): Map<string, number> {
  const capacityBySprint = new Map<string, number>();

  for (const capacity of capacities) {
    const sprint = normalizeSprint(capacity.sprint);
    if (sprint === null) {
      continue;
    }

    const currentCapacity = capacityBySprint.get(sprint) ?? 0;
    capacityBySprint.set(
      sprint,
      currentCapacity + toNumeric(capacity.availablePoints),
    );
  }

  return capacityBySprint;
}

export function aggregateAbsencesBySprint(
  absences: SprintAnalysisAbsenceInput[],
): Map<string, number> {
  const absencesBySprint = new Map<string, number>();

  for (const absence of absences) {
    const sprint = normalizeSprint(absence.sprint);
    if (sprint === null) {
      continue;
    }

    const currentAbsences = absencesBySprint.get(sprint) ?? 0;
    absencesBySprint.set(
      sprint,
      currentAbsences + toNumeric(absence.absenceDays),
    );
  }

  return absencesBySprint;
}

export function computeAdjustedCapacity(
  capacity: number,
  absences: number,
): number {
  return computeAdjustedCapacityFromAbsences(capacity, absences);
}

export function computeUtilization(
  demand: number,
  adjustedCapacity: number,
): number | null {
  if (adjustedCapacity > 0) {
    return roundToTwoDecimals((demand / adjustedCapacity) * 100);
  }

  if (demand === 0) {
    return 0;
  }

  return null;
}

export function computeSprintStatus(
  demand: number,
  adjustedCapacity: number,
): SprintAnalysisStatus {
  if (adjustedCapacity === 0) {
    return demand > 0 ? 'OVERLOADED' : 'HEALTHY';
  }

  if (demand > adjustedCapacity) {
    return 'OVERLOADED';
  }

  if (demand > adjustedCapacity * 0.8) {
    return 'WARNING';
  }

  return 'HEALTHY';
}

export function buildSprintAnalysisRows(
  userStories: SprintAnalysisUserStoryInput[],
  capacities: SprintAnalysisCapacityInput[],
  absences: SprintAnalysisAbsenceInput[],
): SprintAnalysisRow[] {
  const demandBySprint = aggregateDemandBySprint(userStories);
  const capacityBySprint = aggregateCapacityBySprint(capacities);
  const absencesBySprint = aggregateAbsencesBySprint(absences);

  const sprintNames = new Set<string>([
    ...demandBySprint.keys(),
    ...capacityBySprint.keys(),
    ...absencesBySprint.keys(),
  ]);

  return Array.from(sprintNames)
    .map((sprint) => {
      const demand = demandBySprint.get(sprint) ?? 0;
      const capacity = capacityBySprint.get(sprint) ?? 0;
      const absenceTotal = absencesBySprint.get(sprint) ?? 0;
      const adjustedCapacity = computeAdjustedCapacity(capacity, absenceTotal);

      return {
        sprint,
        demand,
        capacity,
        absences: absenceTotal,
        adjustedCapacity,
        utilization: computeUtilization(demand, adjustedCapacity),
        status: computeSprintStatus(demand, adjustedCapacity),
      };
    })
    .sort((left, right) => left.sprint.localeCompare(right.sprint));
}
