export type SprintAnalysisStatus = 'HEALTHY' | 'WARNING' | 'OVERLOADED';

export type SprintAnalysisRow = {
  sprint: string;
  teamName: string;
  projectName: string;
  demand: number;
  capacity: number;
  absences: number;
  adjustedCapacity: number;
  utilization: number | null;
  status: SprintAnalysisStatus;
};

export type SprintAnalysisUserStoryInput = {
  sprint: string;
  teamName: string;
  projectName: string;
  storyPoints?: number | null;
};

export type SprintAnalysisCapacityInput = {
  sprint: string;
  teamName: string;
  projectName: string;
  availablePoints?: number | null;
};

export type SprintAnalysisAbsenceInput = {
  sprint: string;
  teamName: string;
  projectName: string;
  absenceDays?: number | null;
};

export type SprintAnalysisCombination = {
  sprint: string;
  teamName: string;
  projectName: string;
};
