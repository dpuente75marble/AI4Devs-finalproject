import ExcelJS from 'exceljs';
import type { SprintAnalysisRow } from './sprint-analysis.types';
import { buildSprintAnalysisWorkbook } from './build-sprint-analysis-workbook';

const SPRINT_ANALYSIS_SHEET_NAME = 'Sprint Analysis';

const EXPECTED_HEADERS = [
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

const sampleRow: SprintAnalysisRow = {
  sprint: 'Sprint 2',
  teamName: 'Gerencia Riesgo',
  projectName: 'Riesgo',
  demand: 21,
  capacity: 20,
  absences: 0,
  adjustedCapacity: 20,
  utilization: 105,
  status: 'OVERLOADED',
};

type ParsedWorkbook = {
  sheetName: string;
  rows: (string | number | null)[][];
};

function getCellValue(cell: ExcelJS.Cell): string | number | null {
  const value = cell.value;

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && 'result' in value) {
    const result = value.result;
    if (typeof result === 'number' || typeof result === 'string') {
      return result;
    }
  }

  return String(value);
}

async function readSprintAnalysisWorkbook(
  buffer: Buffer,
): Promise<ParsedWorkbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  const rows: (string | number | null)[][] = [];

  worksheet.eachRow((row) => {
    const rowValues: (string | number | null)[] = [];

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= EXPECTED_HEADERS.length) {
        rowValues.push(getCellValue(cell));
      }
    });

    rows.push(rowValues);
  });

  return {
    sheetName: worksheet.name,
    rows,
  };
}

describe('buildSprintAnalysisWorkbook', () => {
  it('creates a workbook buffer', async () => {
    const buffer = await buildSprintAnalysisWorkbook([sampleRow]);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('creates one sheet named Sprint Analysis', async () => {
    const buffer = await buildSprintAnalysisWorkbook([sampleRow]);
    const workbook = await readSprintAnalysisWorkbook(buffer);

    expect(workbook.sheetName).toBe(SPRINT_ANALYSIS_SHEET_NAME);
  });

  it('creates 9 columns in the header row', async () => {
    const buffer = await buildSprintAnalysisWorkbook([sampleRow]);
    const workbook = await readSprintAnalysisWorkbook(buffer);
    const headerRow = workbook.rows[0];

    expect(headerRow).toHaveLength(9);
  });

  it('writes the correct header labels', async () => {
    const buffer = await buildSprintAnalysisWorkbook([sampleRow]);
    const workbook = await readSprintAnalysisWorkbook(buffer);
    const headerRow = workbook.rows[0];

    expect(headerRow).toEqual([...EXPECTED_HEADERS]);
  });

  it('maps a sprint analysis row to the correct Excel cells', async () => {
    const buffer = await buildSprintAnalysisWorkbook([sampleRow]);
    const workbook = await readSprintAnalysisWorkbook(buffer);
    const dataRow = workbook.rows[1];

    expect(dataRow).toEqual([
      'Sprint 2',
      'Gerencia Riesgo',
      'Riesgo',
      21,
      20,
      0,
      20,
      '105.00%',
      'OVERLOADED',
    ]);
  });

  it('formats utilization null as em dash', async () => {
    const rowWithNullUtilization: SprintAnalysisRow = {
      ...sampleRow,
      utilization: null,
      status: 'OVERLOADED',
    };

    const buffer = await buildSprintAnalysisWorkbook([rowWithNullUtilization]);
    const workbook = await readSprintAnalysisWorkbook(buffer);
    const utilizationCell = workbook.rows[1][7];

    expect(utilizationCell).toBe('—');
  });

  it('formats utilization 105 as 105.00%', async () => {
    const buffer = await buildSprintAnalysisWorkbook([sampleRow]);
    const workbook = await readSprintAnalysisWorkbook(buffer);
    const utilizationCell = workbook.rows[1][7];

    expect(utilizationCell).toBe('105.00%');
  });

  it('creates only header row when input array is empty', async () => {
    const buffer = await buildSprintAnalysisWorkbook([]);
    const workbook = await readSprintAnalysisWorkbook(buffer);

    expect(workbook.rows).toHaveLength(1);
    expect(workbook.rows[0]).toEqual([...EXPECTED_HEADERS]);
  });
});
