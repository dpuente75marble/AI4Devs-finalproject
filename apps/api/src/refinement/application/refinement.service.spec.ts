import type { RefinementProvider } from '../domain/refinement-provider.interface';
import type { RefinementOutput } from '../domain/refinement.types';
import type { TextExtractor } from './text-extractor.interface';
import { RefinementService } from './refinement.service';

function pdfFile(name = 'requirement.pdf'): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: name,
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 128,
    buffer: Buffer.from('%PDF-1.4 mock content'),
    destination: '',
    filename: name,
    path: '',
    stream: null as never,
  };
}

describe('RefinementService', () => {
  const sourceText =
    'Business requirement extracted from uploaded PDF:\nrequirement.pdf\n\nThe system must support sprint planning workflows.';

  const refinementOutput: RefinementOutput = {
    refinedStory:
      'As a Tech Lead, I want sprint planning workflows so that the team can deliver predictably.',
    acceptanceCriteria: [
      'Given sprint planning workflows When refinement runs Then a refined user story is generated',
      'Given extracted requirement content When acceptance criteria are produced Then each criterion follows Given/When/Then format',
    ],
    gaps: ['Missing business rule for error handling and failure scenarios'],
  };

  let textExtractor: jest.Mocked<TextExtractor>;
  let refinementProvider: jest.Mocked<RefinementProvider>;
  let service: RefinementService;

  beforeEach(() => {
    textExtractor = {
      extract: jest.fn().mockResolvedValue(sourceText),
    };

    refinementProvider = {
      name: 'mock',
      refine: jest.fn().mockResolvedValue(refinementOutput),
    };

    service = new RefinementService(textExtractor, refinementProvider);
  });

  it('calls the extractor once with the uploaded file', async () => {
    const file = pdfFile();

    await service.analyze(file);

    expect(textExtractor.extract).toHaveBeenCalledTimes(1);
    expect(textExtractor.extract).toHaveBeenCalledWith(file);
  });

  it('calls the provider once with extracted source text', async () => {
    const file = pdfFile();

    await service.analyze(file);

    expect(refinementProvider.refine).toHaveBeenCalledTimes(1);
    expect(refinementProvider.refine).toHaveBeenCalledWith({ sourceText });
  });

  it('returns sourceText in the analysis result', async () => {
    const result = await service.analyze(pdfFile());

    expect(result.sourceText).toBe(sourceText);
  });

  it('returns refinedStory in the analysis result', async () => {
    const result = await service.analyze(pdfFile());

    expect(result.refinedStory).toBe(refinementOutput.refinedStory);
  });

  it('returns acceptanceCriteria in the analysis result', async () => {
    const result = await service.analyze(pdfFile());

    expect(result.acceptanceCriteria).toEqual(refinementOutput.acceptanceCriteria);
  });

  it('returns gaps in the analysis result', async () => {
    const result = await service.analyze(pdfFile());

    expect(result.gaps).toEqual(refinementOutput.gaps);
  });

  it('returns provider name from the refinement provider', async () => {
    const result = await service.analyze(pdfFile());

    expect(result.provider).toBe('mock');
  });

  it('propagates extractor errors', async () => {
    textExtractor.extract.mockRejectedValue(
      new Error('Only PDF files are supported'),
    );

    await expect(service.analyze(pdfFile())).rejects.toThrow(
      'Only PDF files are supported',
    );
    expect(refinementProvider.refine).not.toHaveBeenCalled();
  });

  it('propagates provider errors', async () => {
    refinementProvider.refine.mockRejectedValue(
      new Error('Source text is required'),
    );

    await expect(service.analyze(pdfFile())).rejects.toThrow(
      'Source text is required',
    );
    expect(textExtractor.extract).toHaveBeenCalledTimes(1);
  });
});
