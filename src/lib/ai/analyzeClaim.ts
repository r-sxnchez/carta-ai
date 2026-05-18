import OpenAI from "openai";
import { retrieveRelevantDocuments } from "@/lib/rag/retrieve";
import { CONSTITUTIONAL_REASONING_SYSTEM_PROMPT } from "@/prompts/constitutionalReasoning";
import { supabase } from "@/lib/supabase";
import type { AnalysisResult, ConstitutionalSource } from "@/types/analysis";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = "gpt-4.1-mini";
const RETRIEVAL_COUNT = 6;

function buildConstitutionalContext(
  docs: Awaited<ReturnType<typeof retrieveRelevantDocuments>>
): string {
  if (docs.length === 0) {
    return "No se encontraron artículos constitucionales relevantes para este análisis.";
  }

  return docs
    .map((doc, i) => {
      const article = (doc.metadata as { articleNumber?: string })?.articleNumber;
      const label = article ? `Artículo ${article}` : `Fragmento ${i + 1}`;
      return `[${label}] (similitud: ${doc.similarity.toFixed(3)})\n${doc.content}`;
    })
    .join("\n\n---\n\n");
}

interface LLMOutput {
  constitutionalPlausibility: AnalysisResult["constitutionalPlausibility"];
  reasoning: string;
  whatsappSummary?: string;
  institutionalConstraints: string[];
  constitutionalArticles: string[];
  manipulationSignals: string[];
  confidence: AnalysisResult["confidence"];
}

function meanSimilarity(sources: ConstitutionalSource[]): number | undefined {
  if (sources.length === 0) return undefined;
  const sum = sources.reduce((acc, s) => acc + (s.similarity ?? 0), 0);
  return sum / sources.length;
}

async function persistAnalysis(result: AnalysisResult): Promise<string | undefined> {
  try {
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        claim: result.claim,
        result,
        retrieval_quality: result.meta?.retrievalQuality ?? null,
        model: result.meta?.model ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.warn("[analyses] persist failed:", error.message);
      return undefined;
    }
    return data?.id;
  } catch (err) {
    console.warn("[analyses] persist threw:", err);
    return undefined;
  }
}

export async function analyzeClaim(claim: string): Promise<AnalysisResult> {
  const retrievedDocs = await retrieveRelevantDocuments(claim, RETRIEVAL_COUNT);

  const constitutionalContext = buildConstitutionalContext(retrievedDocs);

  const userMessage = `
CLAIM TO ANALYZE:
"${claim}"

CONSTITUTIONAL EVIDENCE:
${constitutionalContext}
`.trim();

  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: CONSTITUTIONAL_REASONING_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.1,
  });

  const raw = completion.choices[0].message.content;
  if (!raw) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = JSON.parse(raw) as LLMOutput;

  const sources: ConstitutionalSource[] = retrievedDocs.map((doc) => ({
    documentId: doc.id,
    articleNumber: (doc.metadata as { articleNumber?: string })?.articleNumber,
    content: doc.content,
    similarity: doc.similarity,
  }));

  const result: AnalysisResult = {
    claim,
    constitutionalPlausibility: parsed.constitutionalPlausibility,
    reasoning: parsed.reasoning,
    whatsappSummary: parsed.whatsappSummary?.trim() || undefined,
    institutionalConstraints: parsed.institutionalConstraints ?? [],
    constitutionalArticles: parsed.constitutionalArticles ?? [],
    manipulationSignals: parsed.manipulationSignals ?? [],
    confidence: parsed.confidence,
    sources,
    meta: {
      createdAt: new Date().toISOString(),
      model: MODEL,
      retrievalQuality: meanSimilarity(sources),
    },
  };

  const id = await persistAnalysis(result);
  if (id) {
    result.meta = { ...result.meta, id };
  }

  return result;
}

export async function getAnalysisById(id: string): Promise<AnalysisResult | null> {
  const { data, error } = await supabase
    .from("analyses")
    .select("id, claim, result, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const stored = data.result as AnalysisResult;
  return {
    ...stored,
    meta: {
      ...(stored.meta ?? {}),
      id: data.id,
      createdAt: stored.meta?.createdAt ?? data.created_at,
    },
  };
}
