export type SprintAnalysisStatus = 'HEALTHY' | 'WARNING' | 'OVERLOADED';

export type SprintAnalysisRow = {
  sprint: string;
  demand: number;
  capacity: number;
  absences: number;
  adjustedCapacity: number;
  utilization: number | null;
  status: SprintAnalysisStatus;
};

export type SprintAnalysisUserStoryInput = {
  sprint: string;
  storyPoints?: number | null;
};

export type SprintAnalysisCapacityInput = {
  sprint: string;
  availablePoints?: number | null;
};

export type SprintAnalysisAbsenceInput = {
  sprint: string;
  absenceDays?: number | null;
};
