import { MAX_WA_REPLY_CHARS } from "@/lib/constants";
import type { AnalysisResult, PlausibilityVerdict } from "@/types/analysis";

const VERDICT_HEADER: Record<PlausibilityVerdict, string> = {
  plausible: "✅ Esta afirmación tiene sustento constitucional.",
  implausible: "❌ Esta afirmación no se sostiene constitucionalmente.",
  uncertain: "🤔 No hay claridad constitucional suficiente con la información disponible.",
  context_dependent: "⚖️ Esta afirmación omite restricciones constitucionales importantes.",
};

const MAX_SUMMARY_CHARS = 320;

function fallbackSummary(reasoning: string): string {
  const cleaned = reasoning
    .replace(/^#+\s.*$/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= MAX_SUMMARY_CHARS) return cleaned;
  const truncated = cleaned.slice(0, MAX_SUMMARY_CHARS);
  const lastStop = truncated.lastIndexOf(". ");
  return (lastStop > 180 ? truncated.slice(0, lastStop + 1) : truncated.trimEnd() + "…").trim();
}

function formatBody(summary: string): string {
  const sentences = summary
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= 2) return summary;

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > 200 && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks.join("\n\n");
}

function formatSignals(signals: string[]): string | null {
  const labels = signals.map((s) => s.trim()).filter(Boolean);
  if (labels.length === 0) return null;
  const joined = labels.slice(0, 2).join(", ");
  return `Detectamos: ${joined}.`;
}

function truncateReply(text: string): string {
  if (text.length <= MAX_WA_REPLY_CHARS) return text;
  return text.slice(0, MAX_WA_REPLY_CHARS - 1).trimEnd() + "…";
}

export function formatForWhatsApp(result: AnalysisResult, publicBaseUrl: string): string {
  const header = VERDICT_HEADER[result.constitutionalPlausibility];
  const rawBody = result.whatsappSummary?.trim() || fallbackSummary(result.reasoning);
  const body = formatBody(rawBody);
  const signals = formatSignals(result.manipulationSignals);

  const lines = [header, "", body];
  if (signals) {
    lines.push("", signals);
  }

  if (result.meta?.id && publicBaseUrl) {
    const base = publicBaseUrl.replace(/\/+$/, "");
    lines.push("", "Ver análisis completo:", `${base}/analisis/${result.meta.id}`);
  }

  return truncateReply(lines.join("\n"));
}
