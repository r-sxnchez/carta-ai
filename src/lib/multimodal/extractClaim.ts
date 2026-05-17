import { callVision } from "./vision";

export interface ExtractedClaim {
  /** Verbatim text recognized in the image (OCR-style). */
  extractedText: string;
  /** The single political claim distilled from the image, ready for /api/analyze. Empty if none found. */
  claim: string;
  /** One short sentence on what the image is (tweet, news headline, WhatsApp forward, infographic, etc.). */
  context: string;
  /** True when no verifiable political claim could be extracted. */
  noClaimFound: boolean;
}

const SYSTEM_PROMPT = `Eres un asistente de extracción para Carta, una plataforma de verificación constitucional para Colombia y Latinoamérica.

Tu única tarea es leer una imagen (captura de pantalla, tuit reenviado, noticia, gráfico político, mensaje de WhatsApp) y devolver JSON estructurado.

Reglas:
- NUNCA inventes contenido que no esté en la imagen.
- Si no hay afirmación política verificable, marca noClaimFound como true y devuelve claim vacío.
- "claim" debe ser una sola oración en español, clara y autónoma, lista para verificación constitucional. Conserva el sentido literal; no opines.
- "extractedText" debe ser el texto reconocido tal cual aparece (sin traducir ni resumir).
- "context" describe brevemente el tipo de imagen (ej: "tuit del presidente", "titular de noticia", "captura de WhatsApp reenviada").
- Responde EXCLUSIVAMENTE con JSON válido. Sin markdown, sin comentarios, sin texto adicional.

Formato JSON:
{
  "extractedText": string,
  "claim": string,
  "context": string,
  "noClaimFound": boolean
}`;

const USER_PROMPT = `Analiza esta imagen y devuelve el JSON estructurado según las reglas.`;

function safeParseJson(raw: string): Partial<ExtractedClaim> {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as Partial<ExtractedClaim>;
  } catch {
    return {};
  }
}

/**
 * image -> structured claim. The image must be a data URL (data:image/...;base64,...).
 */
export async function extractClaimFromImage(imageDataUrl: string): Promise<ExtractedClaim> {
  const raw = await callVision({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: USER_PROMPT,
    imageDataUrl,
    jsonResponse: true,
  });

  const parsed = safeParseJson(raw);

  const extractedText = (parsed.extractedText ?? "").toString().trim();
  const claim = (parsed.claim ?? "").toString().trim();
  const context = (parsed.context ?? "").toString().trim();
  const noClaimFound = Boolean(parsed.noClaimFound) || claim.length === 0;

  return {
    extractedText,
    claim,
    context,
    noClaimFound,
  };
}
