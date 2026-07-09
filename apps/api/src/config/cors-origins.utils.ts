export const DEFAULT_LOCAL_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
] as const;

export function resolveCorsOrigins(
  corsOriginsEnv: string | undefined,
): string[] {
  const trimmed = corsOriginsEnv?.trim();

  if (!trimmed) {
    return [...DEFAULT_LOCAL_CORS_ORIGINS];
  }

  return trimmed
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
