import {
  DEFAULT_LOCAL_CORS_ORIGINS,
  resolveCorsOrigins,
} from './cors-origins.utils';

describe('resolveCorsOrigins', () => {
  it('returns default local Vite origins when env is undefined', () => {
    expect(resolveCorsOrigins(undefined)).toEqual([
      ...DEFAULT_LOCAL_CORS_ORIGINS,
    ]);
  });

  it('returns default local Vite origins when env is empty or whitespace', () => {
    expect(resolveCorsOrigins('')).toEqual([...DEFAULT_LOCAL_CORS_ORIGINS]);
    expect(resolveCorsOrigins('   ')).toEqual([...DEFAULT_LOCAL_CORS_ORIGINS]);
  });

  it('parses a comma-separated list of origins', () => {
    expect(
      resolveCorsOrigins(
        'http://localhost:5173,https://deliveryops-ai.vercel.app',
      ),
    ).toEqual(['http://localhost:5173', 'https://deliveryops-ai.vercel.app']);
  });

  it('trims whitespace around each origin', () => {
    expect(
      resolveCorsOrigins(
        ' http://localhost:5173 , https://deliveryops-ai.vercel.app ',
      ),
    ).toEqual(['http://localhost:5173', 'https://deliveryops-ai.vercel.app']);
  });

  it('ignores empty segments from trailing commas', () => {
    expect(
      resolveCorsOrigins('http://localhost:5173,https://example.com,'),
    ).toEqual(['http://localhost:5173', 'https://example.com']);
  });
});
