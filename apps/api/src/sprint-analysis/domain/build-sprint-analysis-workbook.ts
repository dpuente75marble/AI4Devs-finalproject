import ExcelJS from 'exceljs';
import type { SprintAnalysisRow } from './sprint-analysis.types';

const SPRINT_ANALYSIS_SHEET_NAME = 'Sprint Analysis';

const SPRINT_ANALYSIS_EXPORT_HEADERS = [
  'Sprint',
  'Gerencia / Team',
  'Proyecto',
  'Demand',
  'Capacity',
  'Absences',
  'Adjusted Capacity',
  'Utilization %',
  'Status',
] as const;

function formatUtilizationForExport(utilization: number | null): string {
  if (utilization === null) {
    return '—';
  }

  return `${utilization.toFixed(2)}%`;
}

function mapRowToExportCells(row: SprintAnalysisRow): (string | number)[] {
  return [
    row.sprint,
    row.teamName,
    row.projectName,
    row.demand,
    row.capacity,
    row.absences,
    row.adjustedCapacity,
    formatUtilizationForExport(row.utilization),
    row.status,
  ];
}

export async function buildSprintAnalysisWorkbook(
  rows: SprintAnalysisRow[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(SPRINT_ANALYSIS_SHEET_NAME);

  worksheet.addRow([...SPRINT_ANALYSIS_EXPORT_HEADERS]);

  for (const row of rows) {
    worksheet.addRow(mapRowToExportCells(row));
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}
