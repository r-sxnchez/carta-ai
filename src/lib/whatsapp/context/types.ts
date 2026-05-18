import type { AnalysisResult, PlausibilityVerdict } from "@/types/analysis";

export interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
  at: number;
}

export interface LastAnalysisContext {
  id?: string;
  claim: string;
  verdict: PlausibilityVerdict;
  summary: string;
}

export interface ConversationThread {
  userId: string;
  turns: ConversationTurn[];
  lastAnalysis?: LastAnalysisContext;
  updatedAt: number;
}

export function analysisToContext(result: AnalysisResult): LastAnalysisContext {
  return {
    id: result.meta?.id,
    claim: result.claim,
    verdict: result.constitutionalPlausibility,
    summary:
      result.whatsappSummary?.trim() ||
      result.reasoning.replace(/\s+/g, " ").trim().slice(0, 280),
  };
}
