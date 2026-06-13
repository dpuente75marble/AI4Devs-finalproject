export function computeAdjustedCapacity(
  availablePoints: number,
  totalAbsenceDays: number,
): number {
  return Math.max(0, availablePoints - totalAbsenceDays);
}
