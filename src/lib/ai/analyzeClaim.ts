import OpenAI from "openai";
import { retrieveRelevantDocuments } from "@/lib/rag/retrieve";
import { CONSTITUTIONAL_REASONING_SYSTEM_PROMPT } from "@/prompts/constitutionalReasoning";
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
  institutionalConstraints: string[];
  constitutionalArticles: string[];
  manipulationSignals: string[];
  confidence: AnalysisResult["confidence"];
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

  return {
    claim,
    constitutionalPlausibility: parsed.constitutionalPlausibility,
    reasoning: parsed.reasoning,
    institutionalConstraints: parsed.institutionalConstraints ?? [],
    constitutionalArticles: parsed.constitutionalArticles ?? [],
    manipulationSignals: parsed.manipulationSignals ?? [],
    confidence: parsed.confidence,
    sources,
  };
}
