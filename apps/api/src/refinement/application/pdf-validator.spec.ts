import { MAX_PDF_FILE_SIZE_BYTES, validatePdfFile } from './pdf-validator';

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

describe('validatePdfFile', () => {
  it('throws when file is missing', () => {
    expect(() => validatePdfFile()).toThrow('File is required');
    expect(() => validatePdfFile(undefined)).toThrow('File is required');
  });

  it('throws when mimetype is not application/pdf', () => {
    const file = pdfFile({ mimetype: 'text/plain', size: 12 });

    expect(() => validatePdfFile(file)).toThrow('Only PDF files are supported');
  });

  it('throws when file size is zero', () => {
    const file = pdfFile({ size: 0, buffer: Buffer.alloc(0) });

    expect(() => validatePdfFile(file)).toThrow('PDF file must not be empty');
  });

  it('throws when file exceeds 10MB', () => {
    const file = pdfFile({ size: MAX_PDF_FILE_SIZE_BYTES + 1 });

    expect(() => validatePdfFile(file)).toThrow(
      'File exceeds maximum size of 10MB',
    );
  });

  it('accepts a valid PDF file', () => {
    const file = pdfFile({ size: 1024 });

    expect(() => validatePdfFile(file)).not.toThrow();
  });
});
