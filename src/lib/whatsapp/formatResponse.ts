import type { AnalysisResult, PlausibilityVerdict } from "@/types/analysis";

const VERDICT_HEADER: Record<PlausibilityVerdict, string> = {
  plausible: "La afirmación es constitucionalmente plausible.",
  implausible: "La afirmación contradice la Constitución.",
  uncertain: "Esta afirmación es ambigua sin más contexto.",
  context_dependent: "Esta afirmación depende del contexto constitucional.",
};

const MAX_SUMMARY_CHARS = 420;

function summarize(reasoning: string): string {
  const cleaned = reasoning
    .replace(/^#+\s.*$/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= MAX_SUMMARY_CHARS) return cleaned;
  const truncated = cleaned.slice(0, MAX_SUMMARY_CHARS);
  const lastStop = truncated.lastIndexOf(". ");
  return (lastStop > 200 ? truncated.slice(0, lastStop + 1) : truncated.trimEnd() + "…").trim();
}

export function formatForWhatsApp(result: AnalysisResult, publicBaseUrl: string): string {
  const header = VERDICT_HEADER[result.constitutionalPlausibility];
  const summary = summarize(result.reasoning);

  const lines = [`⚖️ ${header}`, "", summary];

  if (result.manipulationSignals.length > 0) {
    lines.push("", `Señales detectadas: ${result.manipulationSignals.slice(0, 3).join(", ")}.`);
  }

  if (result.meta?.id && publicBaseUrl) {
    const base = publicBaseUrl.replace(/\/+$/, "");
    lines.push("", "Ver análisis completo:", `${base}/analisis/${result.meta.id}`);
  }

  return lines.join("\n");
}
