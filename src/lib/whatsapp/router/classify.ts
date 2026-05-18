import OpenAI from "openai";
import { recentTurns } from "../context/store";
import type { ConversationThread } from "../context/types";
import type { ConversationMode, RouteDecision } from "./types";

const VALID: ReadonlyArray<ConversationMode> = [
  "greeting",
  "onboarding",
  "capability_question",
  "constitutional_claim",
  "follow_up",
  "clarification",
  "unsupported_input",
];

const SYSTEM_PROMPT = `Eres el router conversacional de Carta (verificación constitucional por WhatsApp, Colombia).

Clasifica el mensaje del usuario en UN solo modo:

- greeting: saludo sin afirmación política.
- onboarding: quiere saber qué es Carta o cómo usarla.
- capability_question: pregunta qué puede enviar (imágenes, audio, formato), no una afirmación política.
- constitutional_claim: contiene una afirmación o pregunta sobre hechos político-institucionales verificables con la Constitución. Extrae el claim en "claim".
- follow_up: continúa el análisis previo (pide explicación, resumen, enlace, artículos).
- clarification: no entendió o el mensaje es demasiado vago; pide reformular.
- unsupported_input: spam, off-topic sin relación cívica, o no procesable.

REGLAS CRÍTICAS:
- NO uses constitutional_claim para saludos, capacidades, ni charla casual.
- "¿Puedo enviarte imágenes?" → capability_question.
- "¿El presidente puede cerrar el Congreso?" → constitutional_claim.
- Si hay análisis previo y el usuario pide más detalle → follow_up.
- Si dudas entre clarification y constitutional_claim, elige clarification.
- claim solo cuando mode es constitutional_claim.

Responde SOLO JSON:
{ "mode": "<modo>", "claim": "<texto o null>" }`;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function buildUserPayload(text: string, thread: ConversationThread): string {
  const turns = recentTurns(thread, 4)
    .map((t) => `${t.role === "user" ? "Usuario" : "Carta"}: ${t.text}`)
    .join("\n");

  const analysis = thread.lastAnalysis
    ? `Último análisis: "${thread.lastAnalysis.claim}" (${thread.lastAnalysis.verdict}).`
    : "Sin análisis previo.";

  return [analysis, turns ? `Historial reciente:\n${turns}` : "", `Mensaje actual: ${text}`]
    .filter(Boolean)
    .join("\n\n");
}

export async function classifyWithLlm(
  text: string,
  thread: ConversationThread
): Promise<RouteDecision> {
  try {
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPayload(text, thread) },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallback(text);

    const parsed = JSON.parse(raw) as { mode?: string; claim?: string | null };
    const mode = VALID.includes(parsed.mode as ConversationMode)
      ? (parsed.mode as ConversationMode)
      : "clarification";

    const claim =
      mode === "constitutional_claim"
        ? (parsed.claim?.trim() || text.trim())
        : undefined;

    return { mode, claim, source: "llm" };
  } catch (err) {
    console.warn("[wa/router] LLM classify failed:", err);
    return fallback(text);
  }
}

function fallback(text: string): RouteDecision {
  const trimmed = text.trim();
  if (trimmed.length < 20) {
    return { mode: "clarification", source: "llm" };
  }
  return { mode: "clarification", source: "llm" };
}
