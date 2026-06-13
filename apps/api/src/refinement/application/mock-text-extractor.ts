import type { TextExtractor } from './text-extractor.interface';
import { validatePdfFile } from './pdf-validator';

const MOCK_REQUIREMENT_SUFFIX =
  'The system must support sprint planning workflows.';

export function buildMockExtractedText(filename: string): string {
  return [
    'Business requirement extracted from uploaded PDF:',
    filename,
    '',
    MOCK_REQUIREMENT_SUFFIX,
  ].join('\n');
}

export class MockTextExtractor implements TextExtractor {
  async extract(file: Express.Multer.File): Promise<string> {
    validatePdfFile(file);

    return buildMockExtractedText(file.originalname);
  }
}
