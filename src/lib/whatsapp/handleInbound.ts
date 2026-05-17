import { analyzeClaim } from "@/lib/ai/analyzeClaim";
import { extractClaimFromImage } from "@/lib/multimodal";
import { MAX_CLAIM_LENGTH } from "@/lib/constants";
import { formatForWhatsApp } from "./formatResponse";
import type { InboundMessage } from "./inboundEvent";
import { sendWhatsAppText } from "./zavu";

const FALLBACK_PUBLIC_URL = "";

function publicBaseUrl(): string {
  return process.env.NEXT_PUBLIC_CARTA_URL ?? FALLBACK_PUBLIC_URL;
}

async function fetchMediaAsDataUrl(mediaUrl: string): Promise<string> {
  const apiKey = process.env.ZAVUDEV_API_KEY;
  const res = await fetch(mediaUrl, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
  });
  if (!res.ok) {
    throw new Error(`media fetch failed: ${res.status}`);
  }
  const mime = res.headers.get("content-type") ?? "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function reply(to: string, text: string): Promise<void> {
  try {
    await sendWhatsAppText(to, text);
  } catch (err) {
    console.error("[wa/reply] send failed:", err);
  }
}

async function analyzeAndReply(to: string, claim: string): Promise<void> {
  const trimmed = claim.trim().slice(0, MAX_CLAIM_LENGTH);
  if (!trimmed) {
    await reply(to, "No detecté una afirmación clara para verificar. Envíame el texto o una captura de la afirmación.");
    return;
  }

  const result = await analyzeClaim(trimmed);
  await reply(to, formatForWhatsApp(result, publicBaseUrl()));
}

export async function handleInboundMessage(message: InboundMessage): Promise<void> {
  const { from, messageType, text, content } = message;

  console.log("[wa/inbound]", {
    id: message.id,
    from,
    type: messageType,
    hasText: !!text,
    hasMedia: !!content?.mediaUrl,
  });

  try {
    switch (messageType) {
      case "text": {
        if (!text || !text.trim()) {
          await reply(from, "Recibí tu mensaje pero está vacío. Envíame la afirmación que quieres verificar.");
          return;
        }
        await analyzeAndReply(from, text);
        return;
      }

      case "image": {
        const mediaUrl = content?.mediaUrl;
        if (!mediaUrl) {
          await reply(from, "Recibí una imagen pero no pude descargarla. Intenta de nuevo en un momento.");
          return;
        }
        const dataUrl = await fetchMediaAsDataUrl(mediaUrl);
        const extracted = await extractClaimFromImage(dataUrl);
        if (extracted.noClaimFound || !extracted.claim) {
          await reply(
            from,
            "No identifiqué una afirmación política verificable en esa imagen. Envíame el texto o una captura más clara."
          );
          return;
        }
        await analyzeAndReply(from, extracted.claim);
        return;
      }

      case "audio": {
        await reply(
          from,
          "Por ahora solo proceso texto e imágenes. La verificación por audio llegará pronto."
        );
        return;
      }

      default: {
        await reply(
          from,
          "Solo entiendo texto e imágenes por ahora. Envíame la afirmación que quieres verificar."
        );
        return;
      }
    }
  } catch (err) {
    console.error("[wa/handle] failed:", err);
    await reply(from, "Algo falló de nuestro lado al verificar. Intenta de nuevo en un momento.");
  }
}
