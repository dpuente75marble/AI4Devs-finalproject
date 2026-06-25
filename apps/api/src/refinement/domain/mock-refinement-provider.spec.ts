import { MockRefinementProvider } from './mock-refinement-provider';

const SAMPLE_SOURCE_TEXT =
  'The payment gateway must validate card transactions and notify the risk team when fraud patterns are detected.';

describe('MockRefinementProvider', () => {
  const provider = new MockRefinementProvider();

  it('exposes provider name mock', () => {
    expect(provider.name).toBe('mock');
  });

  it('throws when source text is empty', async () => {
    await expect(provider.refine({ sourceText: '' })).rejects.toThrow(
      'Source text is required',
    );
  });

  it('throws when source text is whitespace only', async () => {
    await expect(provider.refine({ sourceText: '   \n\t  ' })).rejects.toThrow(
      'Source text is required',
    );
  });

  it('returns deterministic output for the same input', async () => {
    const input = { sourceText: SAMPLE_SOURCE_TEXT };
    const first = await provider.refine(input);
    const second = await provider.refine(input);

    expect(second).toEqual(first);
  });

  it('returns identical output when called twice with the same input', async () => {
    const input = { sourceText: SAMPLE_SOURCE_TEXT };

    const results = await Promise.all([
      provider.refine(input),
      provider.refine(input),
    ]);

    expect(results[0]).toEqual(results[1]);
  });

  it('returns the same output for inputs that normalize to the same text', async () => {
    const first = await provider.refine({
      sourceText: '  Payment   gateway   validation  ',
    });
    const second = await provider.refine({
      sourceText: 'Payment gateway validation',
    });

    expect(second).toEqual(first);
  });

  it('returns a valid output shape', async () => {
    const output = await provider.refine({ sourceText: SAMPLE_SOURCE_TEXT });

    expect(typeof output.refinedStory).toBe('string');
    expect(output.refinedStory.length).toBeGreaterThan(0);
    expect(Array.isArray(output.acceptanceCriteria)).toBe(true);
    expect(output.acceptanceCriteria.length).toBeGreaterThan(0);
    expect(Array.isArray(output.gaps)).toBe(true);
    expect(output.gaps.every((gap) => typeof gap === 'string')).toBe(true);
  });

  it('includes Given, When, and Then in every acceptance criterion', async () => {
    const output = await provider.refine({ sourceText: SAMPLE_SOURCE_TEXT });

    for (const criterion of output.acceptanceCriteria) {
      expect(criterion).toMatch(/Given/i);
      expect(criterion).toMatch(/When/i);
      expect(criterion).toMatch(/Then/i);
    }
  });

  it('returns at least one gap for short source text', async () => {
    const output = await provider.refine({ sourceText: 'Pay cards' });

    expect(output.refinedStory.length).toBeGreaterThan(0);
    expect(output.gaps.length).toBeGreaterThanOrEqual(1);
    expect(
      output.gaps.some((gap) => /insufficient|short|missing/i.test(gap)),
    ).toBe(true);
  });

  it('derives output from requirement keywords and first line', async () => {
    const output = await provider.refine({ sourceText: SAMPLE_SOURCE_TEXT });

    expect(output.refinedStory).toContain('payment');
    expect(output.acceptanceCriteria.some((c) => c.includes('payment'))).toBe(
      true,
    );
  });
});
