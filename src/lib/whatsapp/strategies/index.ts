import { analyzeClaim } from "@/lib/ai/analyzeClaim";
import { MAX_CLAIM_LENGTH } from "@/lib/constants";
import type { AnalysisResult } from "@/types/analysis";
import { analysisToContext, type ConversationThread } from "../context/types";
import { formatForWhatsApp } from "../formatResponse";
import type { RouteDecision } from "../router/types";

export interface StrategyResult {
  text: string;
  lastAnalysis?: ReturnType<typeof analysisToContext>;
}

function publicBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_CARTA_URL ?? "").trim();
}

function analysisLink(id?: string): string | null {
  const base = publicBaseUrl().replace(/\/+$/, "");
  if (!id || !base) return null;
  return `${base}/analisis/${id}`;
}

export async function executeStrategy(
  decision: RouteDecision,
  text: string,
  thread: ConversationThread
): Promise<StrategyResult> {
  switch (decision.mode) {
    case "greeting":
      return { text: greetingText() };
    case "onboarding":
      return { text: onboardingText() };
    case "capability_question":
      return { text: capabilityText(text) };
    case "constitutional_claim":
      return analyzeStrategy(decision.claim ?? text);
    case "follow_up":
      return { text: followUpText(thread) };
    case "clarification":
      return { text: clarificationText(thread) };
    case "unsupported_input":
      return { text: unsupportedText() };
  }
}

function greetingText(): string {
  return [
    "Hola. Soy Carta.",
    "Envíame una afirmación política (texto o captura) y la contrasto con la Constitución.",
  ].join("\n");
}

function onboardingText(): string {
  return [
    "Carta verifica afirmaciones políticas con la Constitución de 1991.",
    "Mándame la frase, cadena o captura que quieras comprobar.",
  ].join("\n");
}

function capabilityText(message: string): string {
  const norm = message.toLowerCase();
  const asksAudio = /audio|voz|nota\s+de\s+voz/.test(norm);

  if (asksAudio) {
    return "Por ahora trabajo con texto e imágenes. El audio llegará pronto. Puedes pegar la frase o enviar una captura.";
  }

  return "Sí: puedes enviar texto o capturas (tuits, cadenas, titulares). Extraigo la afirmación y la verifico constitucionalmente.";
}

function clarificationText(thread: ConversationThread): string {
  if (thread.lastAnalysis) {
    return `Sobre «${thread.lastAnalysis.claim.slice(0, 80)}${thread.lastAnalysis.claim.length > 80 ? "…" : ""}»: ¿qué parte quieres que aclare?`;
  }
  return "Envíame la afirmación completa que quieres verificar. Ejemplo: «¿El presidente puede cerrar el Congreso?»";
}

function followUpText(thread: ConversationThread): string {
  const lastUser = [...thread.turns].reverse().find((t) => t.role === "user");
  if (lastUser && /^(?:gracias|muchas\s+gracias|ok|perfecto|listo|vale)[!.\s]*$/i.test(lastUser.text.trim())) {
    return "Con gusto. Si quieres verificar otra afirmación, envíamela.";
  }

  const last = thread.lastAnalysis;
  if (!last) {
    return "Aún no tengo un análisis reciente. Envíame la afirmación que quieres verificar.";
  }

  const link = analysisLink(last.id);
  const lines = [last.summary];

  if (link) {
    lines.push("", "Análisis completo:", link);
  }

  return lines.join("\n");
}

function unsupportedText(): string {
  return "No pude procesar ese mensaje. Envíame una afirmación política en texto o captura.";
}

async function analyzeStrategy(claim: string): Promise<StrategyResult> {
  const trimmed = claim.trim().slice(0, MAX_CLAIM_LENGTH);
  if (!trimmed) {
    return { text: "No detecté una afirmación para verificar. Envíala en una frase clara." };
  }

  const result: AnalysisResult = await analyzeClaim(trimmed);
  return {
    text: formatForWhatsApp(result, publicBaseUrl()),
    lastAnalysis: analysisToContext(result),
  };
}
