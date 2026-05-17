import { CsvParseError, parseCsv } from './parse-csv';

const VALID_CSV = `external_id,title,description,story_points,status,sprint
US-101,Login de usuario,Como usuario quiero iniciar sesión,5,ready,Sprint 1
US-102,Recuperar contraseña,,3,draft,Sprint 1`;

describe('parseCsv', () => {
  it('parses valid CSV rows', () => {
    const { rows } = parseCsv(Buffer.from(VALID_CSV));

    expect(rows).toHaveLength(2);
    expect(rows[0].external_id).toBe('US-101');
    expect(rows[1].title).toBe('Recuperar contraseña');
  });

  it('throws when required columns are missing', () => {
    const csv = `external_id,story_points,status
US-101,5,ready`;

    expect(() => parseCsv(Buffer.from(csv))).toThrow(CsvParseError);
    expect(() => parseCsv(Buffer.from(csv))).toThrow(
      'Missing required columns: title',
    );
  });

  it('throws when CSV is empty', () => {
    expect(() => parseCsv(Buffer.from('   '))).toThrow('CSV file is empty');
  });

  it('throws when CSV has no data rows', () => {
    const csv = 'external_id,title,story_points,status';

    expect(() => parseCsv(Buffer.from(csv))).toThrow(
      'CSV file contains no data rows',
    );
  });
});
