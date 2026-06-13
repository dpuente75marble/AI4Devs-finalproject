import { Test, TestingModule } from '@nestjs/testing';
import type { RefinementAnalysisResult } from './application/refinement-analysis.types';
import { RefinementService } from './application/refinement.service';
import { RefinementController } from './refinement.controller';

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

describe('RefinementController', () => {
  let controller: RefinementController;
  let refinementService: { analyze: jest.Mock };

  const analysisResult: RefinementAnalysisResult = {
    sourceText:
      'Business requirement extracted from uploaded PDF:\nrequirement.pdf\n\nThe system must support sprint planning workflows.',
    refinedStory:
      'As a Tech Lead, I want sprint planning workflows so that the team can deliver predictably.',
    acceptanceCriteria: [
      'Given sprint planning workflows When refinement runs Then a refined user story is generated',
    ],
    gaps: ['Missing business rule for error handling and failure scenarios'],
    provider: 'mock',
  };

  beforeEach(async () => {
    refinementService = {
      analyze: jest.fn().mockResolvedValue(analysisResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefinementController],
      providers: [
        { provide: RefinementService, useValue: refinementService },
      ],
    }).compile();

    controller = module.get(RefinementController);
  });

  it('returns analysis result for a valid PDF upload', async () => {
    const file = pdfFile();

    const result = await controller.analyze(file);

    expect(result).toEqual(analysisResult);
  });

  it('calls RefinementService.analyze once with the uploaded file', async () => {
    const file = pdfFile('sprint-requirement.pdf');

    await controller.analyze(file);

    expect(refinementService.analyze).toHaveBeenCalledTimes(1);
    expect(refinementService.analyze).toHaveBeenCalledWith(file);
  });

  it('propagates service errors', async () => {
    refinementService.analyze.mockRejectedValue(
      new Error('Only PDF files are supported'),
    );

    await expect(controller.analyze(pdfFile())).rejects.toThrow(
      'Only PDF files are supported',
    );
  });
});
