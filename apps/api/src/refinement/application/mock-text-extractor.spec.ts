import {
  MockTextExtractor,
  buildMockExtractedText,
} from './mock-text-extractor';

function pdfFile(
  overrides: Partial<Express.Multer.File> & Pick<Express.Multer.File, 'size'>,
): Express.Multer.File {
  const content = overrides.buffer ?? Buffer.from('%PDF-1.4 mock content');
  const originalname = overrides.originalname ?? 'requirement.pdf';

  return {
    fieldname: 'file',
    originalname,
    encoding: '7bit',
    mimetype: overrides.mimetype ?? 'application/pdf',
    size: overrides.size,
    buffer: content,
    destination: '',
    filename: originalname,
    path: '',
    stream: null as never,
    ...overrides,
  };
}

describe('MockTextExtractor', () => {
  const extractor = new MockTextExtractor();

  it('returns deterministic text for a valid PDF file', async () => {
    const file = pdfFile({
      originalname: 'sprint-requirement.pdf',
      size: 128,
    });

    const text = await extractor.extract(file);

    expect(text).toBe(buildMockExtractedText('sprint-requirement.pdf'));
    expect(text).toContain('Business requirement extracted from uploaded PDF:');
    expect(text).toContain('sprint-requirement.pdf');
    expect(text).toContain(
      'The system must support sprint planning workflows.',
    );
  });

  it('returns the same text when extracting the same file twice', async () => {
    const file = pdfFile({
      originalname: 'repeatable.pdf',
      size: 256,
    });

    const first = await extractor.extract(file);
    const second = await extractor.extract(file);

    expect(second).toBe(first);
  });

  it('throws when file validation fails', async () => {
    const invalidFile = pdfFile({
      mimetype: 'text/plain',
      size: 64,
    });

    await expect(extractor.extract(invalidFile)).rejects.toThrow(
      'Only PDF files are supported',
    );
  });
});
