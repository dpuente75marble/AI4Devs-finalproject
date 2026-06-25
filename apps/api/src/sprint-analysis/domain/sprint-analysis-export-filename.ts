export function buildSprintAnalysisExportFilename(date = new Date()): string {
  const utcDate = date.toISOString().slice(0, 10);

  return `sprint-analysis-${utcDate}.xlsx`;
}
