import { Module } from '@nestjs/common';
import { MockTextExtractor } from './application/mock-text-extractor';
import { RefinementService } from './application/refinement.service';
import { MockRefinementProvider } from './domain/mock-refinement-provider';
import { RefinementController } from './refinement.controller';

@Module({
  controllers: [RefinementController],
  providers: [
    MockTextExtractor,
    MockRefinementProvider,
    {
      provide: RefinementService,
      useFactory: (
        textExtractor: MockTextExtractor,
        refinementProvider: MockRefinementProvider,
      ) => new RefinementService(textExtractor, refinementProvider),
      inject: [MockTextExtractor, MockRefinementProvider],
    },
  ],
})
export class RefinementModule {}
