export interface ConstitutionalSource {
  documentId: number;
  articleNumber?: string;
  content: string;
  similarity: number;
}

export type PlausibilityVerdict =
  | "plausible"
  | "implausible"
  | "uncertain"
  | "context_dependent";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface AnalysisResult {
  claim: string;
  constitutionalPlausibility: PlausibilityVerdict;
  reasoning: string;
  institutionalConstraints: string[];
  constitutionalArticles: string[];
  manipulationSignals: string[];
  confidence: ConfidenceLevel;
  sources: ConstitutionalSource[];
}
