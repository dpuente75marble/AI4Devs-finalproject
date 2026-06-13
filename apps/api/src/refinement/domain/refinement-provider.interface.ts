import type { RefinementInput, RefinementOutput } from './refinement.types';

export interface RefinementProvider {
  readonly name: string;

  refine(input: RefinementInput): Promise<RefinementOutput>;
}
