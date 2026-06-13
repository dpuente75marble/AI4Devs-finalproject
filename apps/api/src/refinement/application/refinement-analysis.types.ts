export interface RefinementAnalysisResult {
  sourceText: string;
  refinedStory: string;
  acceptanceCriteria: string[];
  gaps: string[];
  provider: string;
}
