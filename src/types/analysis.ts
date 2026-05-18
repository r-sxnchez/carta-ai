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

export interface AnalysisMeta {
  /** Stable ID for sharing/permalink. Optional — present when persistence succeeds. */
  id?: string;
  /** ISO timestamp of when the analysis was produced. */
  createdAt?: string;
  /** Model identifier that produced the analysis. */
  model?: string;
  /** Mean similarity score across the retrieved evidence (0..1). */
  retrievalQuality?: number;
}

export interface AnalysisResult {
  claim: string;
  constitutionalPlausibility: PlausibilityVerdict;
  reasoning: string;
  /** 2-3 sentence conversational summary in warm LATAM professor tone, optimized for WhatsApp. */
  whatsappSummary?: string;
  institutionalConstraints: string[];
  constitutionalArticles: string[];
  manipulationSignals: string[];
  confidence: ConfidenceLevel;
  sources: ConstitutionalSource[];
  meta?: AnalysisMeta;
}
