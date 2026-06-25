import { parse } from 'csv-parse/sync';
import {
  ALLOWED_CSV_COLUMNS,
  MAX_CSV_DATA_ROWS,
  REQUIRED_CSV_COLUMNS,
} from '../constants';

export type CsvRow = Record<string, string>;

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsvParseError';
  }
}

export function parseCsv(buffer: Buffer): { rows: CsvRow[] } {
  const content = buffer.toString('utf-8').trim();

  if (!content) {
    throw new CsvParseError('CSV file is empty');
  }

  let rows: CsvRow[];

  try {
    rows = parse(content, {
      columns: (header: string[]) => {
        const normalized = header.map((column) => column.trim());

        const missing = REQUIRED_CSV_COLUMNS.filter(
          (column) => !normalized.includes(column),
        );
        if (missing.length > 0) {
          throw new CsvParseError(
            `Missing required columns: ${missing.join(', ')}`,
          );
        }

        const unknown = normalized.filter(
          (column) => column && !ALLOWED_CSV_COLUMNS.has(column),
        );
        if (unknown.length > 0) {
          throw new CsvParseError(`Unknown columns: ${unknown.join(', ')}`);
        }

        return normalized;
      },
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error) {
    if (error instanceof CsvParseError) {
      throw error;
    }
    throw new CsvParseError('Invalid CSV format');
  }

  if (rows.length === 0) {
    throw new CsvParseError('CSV file contains no data rows');
  }

  if (rows.length > MAX_CSV_DATA_ROWS) {
    throw new CsvParseError(
      `CSV exceeds maximum of ${MAX_CSV_DATA_ROWS} data rows`,
    );
  }

  return { rows };
}
