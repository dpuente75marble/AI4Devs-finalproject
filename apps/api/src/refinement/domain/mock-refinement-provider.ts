import type { RefinementProvider } from './refinement-provider.interface';
import type { RefinementInput, RefinementOutput } from './refinement.types';

const SHORT_TEXT_THRESHOLD = 20;

export function normalizeSourceText(sourceText: string): string {
  return sourceText.trim().replace(/\s+/g, ' ');
}

function extractKeywords(normalizedText: string): string[] {
  const matches = normalizedText.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? [];
  return [...new Set(matches)].sort();
}

function extractFirstLine(normalizedText: string): string {
  const firstSegment = normalizedText.split(/[.\n]/)[0]?.trim() ?? normalizedText;
  return firstSegment.length > 0 ? firstSegment : normalizedText;
}

function buildRefinedStory(
  firstLine: string,
  keywords: string[],
  isShort: boolean,
): string {
  if (isShort) {
    return [
      'As a Tech Lead,',
      'I want to clarify the uploaded requirement,',
      'so that the delivery team receives a minimal but actionable user story.',
    ].join(' ');
  }

  const focus = keywords[0] ?? firstLine.toLowerCase();
  return [
    'As a Tech Lead,',
    `I want ${firstLine.toLowerCase()},`,
    `so that the team can implement ${focus} with clear delivery guidance.`,
  ].join(' ');
}

function buildAcceptanceCriteria(
  firstLine: string,
  keywords: string[],
): string[] {
  const focus = keywords[0] ?? 'the requirement';
  const secondary = keywords[1] ?? focus;

  return [
    `Given ${focus} is described in the requirement document When refinement is executed Then a refined user story is generated`,
    `Given extracted content about ${secondary} When acceptance criteria are produced Then each criterion follows Given/When/Then format`,
    `Given the requirement states "${firstLine}" When the mock provider analyzes it Then gaps are identified for missing details`,
  ];
}

function buildGaps(
  firstLine: string,
  keywords: string[],
  normalizedText: string,
  isShort: boolean,
): string[] {
  const gaps: string[] = [];

  if (isShort) {
    gaps.push(
      'Insufficient input: source text is too short to infer complete business rules',
    );
    return gaps;
  }

  if (keywords.length < 3) {
    gaps.push(
      'Missing business rule detail: requirement contains limited actionable keywords',
    );
  }

  if (normalizedText.length < 80) {
    gaps.push(
      `Unclear scope for "${firstLine}": non-functional constraints are not specified`,
    );
  }

  if (!/\berror|fail|invalid|reject\b/i.test(normalizedText)) {
    gaps.push('Missing business rule for error handling and failure scenarios');
  }

  if (gaps.length === 0) {
    gaps.push(
      `Ambiguous acceptance boundary for "${keywords[0] ?? firstLine}": edge cases are not defined`,
    );
  }

  return gaps;
}

export class MockRefinementProvider implements RefinementProvider {
  readonly name = 'mock';

  async refine(input: RefinementInput): Promise<RefinementOutput> {
    const normalizedText = normalizeSourceText(input.sourceText);

    if (normalizedText.length === 0) {
      throw new Error('Source text is required');
    }

    const firstLine = extractFirstLine(normalizedText);
    const keywords = extractKeywords(normalizedText);
    const isShort = normalizedText.length < SHORT_TEXT_THRESHOLD;

    return {
      refinedStory: buildRefinedStory(firstLine, keywords, isShort),
      acceptanceCriteria: buildAcceptanceCriteria(firstLine, keywords),
      gaps: buildGaps(firstLine, keywords, normalizedText, isShort),
    };
  }
}
