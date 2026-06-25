import { computeAdjustedCapacity as computeAdjustedCapacityFromAbsences } from '../../sprint-absences/utils/compute-adjusted-capacity';
import type {
  SprintAnalysisAbsenceInput,
  SprintAnalysisCapacityInput,
  SprintAnalysisCombination,
  SprintAnalysisRow,
  SprintAnalysisStatus,
  SprintAnalysisUserStoryInput,
} from './sprint-analysis.types';

function normalizeCombination(
  sprint: string,
  teamName: string,
  projectName: string,
): SprintAnalysisCombination | null {
  const normalizedSprint = sprint.trim();
  const normalizedTeamName = teamName.trim();
  const normalizedProjectName = projectName.trim();

  if (
    normalizedSprint.length === 0 ||
    normalizedTeamName.length === 0 ||
    normalizedProjectName.length === 0
  ) {
    return null;
  }

  return {
    sprint: normalizedSprint,
    teamName: normalizedTeamName,
    projectName: normalizedProjectName,
  };
}

export function buildCombinationKey(
  sprint: string,
  teamName: string,
  projectName: string,
): string {
  return `${sprint}|${teamName}|${projectName}`;
}

function parseCombinationKey(key: string): SprintAnalysisCombination {
  const [sprint, teamName, projectName] = key.split('|');

  return {
    sprint,
    teamName,
    projectName,
  };
}

function toNumeric(value: number | null | undefined): number {
  return value ?? 0;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function compareCombinations(
  left: SprintAnalysisCombination,
  right: SprintAnalysisCombination,
): number {
  const sprintCompare = left.sprint.localeCompare(right.sprint);
  if (sprintCompare !== 0) {
    return sprintCompare;
  }

  const teamCompare = left.teamName.localeCompare(right.teamName);
  if (teamCompare !== 0) {
    return teamCompare;
  }

  return left.projectName.localeCompare(right.projectName);
}

export function aggregateDemandBySprint(
  userStories: SprintAnalysisUserStoryInput[],
): Map<string, number> {
  const demandByCombination = new Map<string, number>();

  for (const userStory of userStories) {
    const combination = normalizeCombination(
      userStory.sprint,
      userStory.teamName,
      userStory.projectName,
    );
    if (combination === null) {
      continue;
    }

    const key = buildCombinationKey(
      combination.sprint,
      combination.teamName,
      combination.projectName,
    );
    const currentDemand = demandByCombination.get(key) ?? 0;
    demandByCombination.set(
      key,
      currentDemand + toNumeric(userStory.storyPoints),
    );
  }

  return demandByCombination;
}

export function aggregateCapacityBySprint(
  capacities: SprintAnalysisCapacityInput[],
): Map<string, number> {
  const capacityByCombination = new Map<string, number>();

  for (const capacity of capacities) {
    const combination = normalizeCombination(
      capacity.sprint,
      capacity.teamName,
      capacity.projectName,
    );
    if (combination === null) {
      continue;
    }

    const key = buildCombinationKey(
      combination.sprint,
      combination.teamName,
      combination.projectName,
    );
    const currentCapacity = capacityByCombination.get(key) ?? 0;
    capacityByCombination.set(
      key,
      currentCapacity + toNumeric(capacity.availablePoints),
    );
  }

  return capacityByCombination;
}

export function aggregateAbsencesBySprint(
  absences: SprintAnalysisAbsenceInput[],
): Map<string, number> {
  const absencesByCombination = new Map<string, number>();

  for (const absence of absences) {
    const combination = normalizeCombination(
      absence.sprint,
      absence.teamName,
      absence.projectName,
    );
    if (combination === null) {
      continue;
    }

    const key = buildCombinationKey(
      combination.sprint,
      combination.teamName,
      combination.projectName,
    );
    const currentAbsences = absencesByCombination.get(key) ?? 0;
    absencesByCombination.set(
      key,
      currentAbsences + toNumeric(absence.absenceDays),
    );
  }

  return absencesByCombination;
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
  const demandByCombination = aggregateDemandBySprint(userStories);
  const capacityByCombination = aggregateCapacityBySprint(capacities);
  const absencesByCombination = aggregateAbsencesBySprint(absences);

  const combinationKeys = new Set<string>([
    ...demandByCombination.keys(),
    ...capacityByCombination.keys(),
    ...absencesByCombination.keys(),
  ]);

  return Array.from(combinationKeys)
    .map((key) => {
      const { sprint, teamName, projectName } = parseCombinationKey(key);
      const demand = demandByCombination.get(key) ?? 0;
      const capacity = capacityByCombination.get(key) ?? 0;
      const absenceTotal = absencesByCombination.get(key) ?? 0;
      const adjustedCapacity = computeAdjustedCapacity(capacity, absenceTotal);

      return {
        sprint,
        teamName,
        projectName,
        demand,
        capacity,
        absences: absenceTotal,
        adjustedCapacity,
        utilization: computeUtilization(demand, adjustedCapacity),
        status: computeSprintStatus(demand, adjustedCapacity),
      };
    })
    .sort((left, right) => compareCombinations(left, right));
}
