export interface RefinementInput {
  sourceText: string;
}

export interface RefinementOutput {
  refinedStory: string;
  acceptanceCriteria: string[];
  gaps: string[];
}
