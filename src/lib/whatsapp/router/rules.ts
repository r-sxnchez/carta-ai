import type { ConversationThread } from "../context/types";
import { normalize } from "./normalize";
import type { RouteDecision } from "./types";

const GREETING_ONLY =
  /^(?:hola|buenas|buen[oa]s?\s*(?:d[ií]as?|tardes|noches)|hey|qué\s*tal|que\s*tal|saludos|👋)(?:\s+carta)?[!.\s]*$/i;

const THANKS =
  /^(?:gracias|muchas\s+gracias|ok\s*gracias|perfecto\s*gracias|listo\s*gracias|de\s+nada|vale\s*gracias)[!.\s]*$/i;

const ONBOARDING =
  /(?:quiero\s+verificar|ayudame\s+a\s+verificar|necesito\s+verificar|c[oó]mo\s+(?:te\s+)?uso|empezar|comenzar)/i;

const ONBOARDING_META =
  /(?:qu[eé]\s+(?:es|hace)\s+carta|c[oó]mo\s+funciona(?:\s+carta)?|para\s+qu[eé]\s+sirves?|qui[eé]n\s+(?:eres|soy|te\s+cre[oó]))/i;

const CAPABILITY =
  /(?:puedo\s+enviar|aceptas|recibes|sirven|funciona[n]?)\s+(?:im[aá]genes?|fotos?|capturas?|screenshots?|audios?|notas?\s+de\s+voz)|(?:im[aá]genes?|fotos?|capturas?|audios?)\s+(?:sirven|funcionan|se\s+pueden)|qu[eé]\s+(?:puedo|se\s+puede)\s+enviar|qu[eé]\s+formatos?|env[ií]o\s+(?:im[aá]genes?|fotos?|capturas?)/i;

const FOLLOW_UP =
  /(?:expl[ií]came|explica|m[aá]s\s+simple|resum[eé]|resume|qu[eé]\s+significa|el\s+enlace|el\s+link|ver\s+m[aá]s|art[ií]culos?\s+citados?|lo\s+de\s+antes|eso\s+que\s+dijiste|sobre\s+eso|anterior|otra\s+vez)/i;

const CLARIFICATION =
  /(?:no\s+entend[ií]|no\s+capto|no\s+entiendo|qu[eé]\s+quieres\s+decir|a\s+qu[eé]\s+te\s+refieres|no\s+me\s+qued[oó]\s+claro)/i;

const CIVIC_CLAIM =
  /\b(?:presidente|congreso|constituci[oó]n|gobierno|reforma|ley|decreto|senado|corte|tribunal|ministro|elecci[oó]n|votar|poder|facultad|competencia|art[ií]culo\s+\d|estado\s+de\s+excepci[oó]n|cerrar\s+el\s+congreso|gobernar|impeachment|referendo|plebiscito|puede\s+(?:cerrar|disolver|gobernar|decretar)|tiene\s+(?:facultad|poder))\b/i;

function decision(mode: RouteDecision["mode"], extra?: Partial<RouteDecision>): RouteDecision {
  return { mode, source: "rules", ...extra };
}

export function matchRules(text: string, thread: ConversationThread): RouteDecision | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return decision("unsupported_input");
  }

  const norm = normalize(trimmed);

  if (GREETING_ONLY.test(norm)) {
    return decision("greeting");
  }

  if (THANKS.test(norm)) {
    return thread.lastAnalysis ? decision("follow_up") : decision("greeting");
  }

  if (ONBOARDING.test(norm) || ONBOARDING_META.test(norm)) {
    return decision("onboarding");
  }

  if (CAPABILITY.test(norm)) {
    return decision("capability_question");
  }

  if (thread.lastAnalysis && FOLLOW_UP.test(norm)) {
    return decision("follow_up");
  }

  if (CLARIFICATION.test(norm)) {
    return decision("clarification");
  }

  if (CIVIC_CLAIM.test(norm)) {
    return decision("constitutional_claim", { claim: trimmed });
  }

  if (norm.length < 8) {
    return decision("clarification");
  }

  return null;
}
