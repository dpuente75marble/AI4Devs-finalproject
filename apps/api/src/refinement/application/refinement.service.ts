import type { RefinementProvider } from '../domain/refinement-provider.interface';
import type { TextExtractor } from './text-extractor.interface';
import type { RefinementAnalysisResult } from './refinement-analysis.types';

export class RefinementService {
  constructor(
    private readonly textExtractor: TextExtractor,
    private readonly refinementProvider: RefinementProvider,
  ) {}

  async analyze(file: Express.Multer.File): Promise<RefinementAnalysisResult> {
    const sourceText = await this.textExtractor.extract(file);
    const refinement = await this.refinementProvider.refine({ sourceText });

    return {
      sourceText,
      refinedStory: refinement.refinedStory,
      acceptanceCriteria: refinement.acceptanceCriteria,
      gaps: refinement.gaps,
      provider: this.refinementProvider.name,
    };
  }
}
