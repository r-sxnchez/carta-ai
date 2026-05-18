import { greetingReply, guideReply, metaReply } from "./replies";

const GREETING_ONLY =
  /^(?:hola|buenas|buen[oa]s?\s*(?:d[ií]as?|tardes|noches)|hey|qué\s*tal|que\s*tal|saludos|gracias|ok|vale|listo|👋|🙏)(?:\s+carta)?[!.\s]*$/i;

const GREETING_PREFIX =
  /^(?:hola|buenas|buen[oa]s?\s*(?:d[ií]as?|tardes|noches)|hey)[,!.\s]+/i;

const META =
  /(?:qu[eé]\s+(?:es|hace|haces)|c[oó]mo\s+funciona|para\s+qu[eé]\s+sirves?|qui[eé]n\s+(?:eres|soy|te\s+cre[oó])|qu[eé]\s+puedes?\s+hacer|qu[eé]\s+tipo\s+de|en\s+qu[eé]\s+me\s+ayudas?)/i;

const ONBOARDING =
  /(?:quiero\s+verificar|ayudame\s+a\s+verificar|necesito\s+verificar)/i;

const CIVIC_SIGNAL =
  /\b(?:presidente|congreso|constituci[oó]n|gobierno|reforma|ley|decreto|senado|corte|tribunal|ministro|elecci[oó]n|votar|poder|facultad|competencia|art[ií]culo|petro|uribe|congresistas?|legislativ|ejecutiv|judicial|estado\s+de\s+excepci[oó]n|cerrar\s+el\s+congreso|gobernar|impeachment|referendo|plebiscito)\b/i;

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function looksLikeVerifiableClaim(text: string): boolean {
  const norm = normalize(text);
  if (CIVIC_SIGNAL.test(norm)) return true;
  if (/\?/.test(text) && norm.length >= 18) return true;
  if (GREETING_PREFIX.test(text) && (CIVIC_SIGNAL.test(norm) || /\?/.test(text))) return true;
  return false;
}

function isPureGreeting(text: string): boolean {
  const norm = normalize(text);
  if (norm.length > 90) return false;
  return GREETING_ONLY.test(norm);
}

function isMetaOnly(text: string): boolean {
  const norm = normalize(text);
  if (norm.length > 160) return false;
  if (looksLikeVerifiableClaim(text)) return false;
  return META.test(norm);
}

/**
 * Returns a conversational reply when the message should not trigger analysis.
 * Returns null when the message should go to constitutional analysis.
 */
export function conversationalReply(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return guideReply("empty");
  }

  if (looksLikeVerifiableClaim(trimmed)) {
    return null;
  }

  if (isPureGreeting(trimmed) || ONBOARDING.test(normalize(trimmed))) {
    return greetingReply();
  }

  if (isMetaOnly(trimmed)) {
    return metaReply();
  }

  if (trimmed.length < 12) {
    return guideReply("short");
  }

  return null;
}
