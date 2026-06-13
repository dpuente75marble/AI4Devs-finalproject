import { computeAdjustedCapacity } from './compute-adjusted-capacity';

describe('computeAdjustedCapacity', () => {
  it('returns 37 when availablePoints is 40 and totalAbsenceDays is 3', () => {
    expect(computeAdjustedCapacity(40, 3)).toBe(37);
  });

  it('returns 0 when availablePoints is 5 and totalAbsenceDays is 8', () => {
    expect(computeAdjustedCapacity(5, 8)).toBe(0);
  });

  it('returns 0 when availablePoints is 0 and totalAbsenceDays is 5', () => {
    expect(computeAdjustedCapacity(0, 5)).toBe(0);
  });
});
