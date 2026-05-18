import { MAX_CLAIM_LENGTH } from "@/lib/constants";
import { extractClaimFromImage } from "@/lib/multimodal";
import { analyzeClaim } from "@/lib/ai/analyzeClaim";
import { processTextMessage } from "./conversation/processText";
import { appendTurn, setLastAnalysis } from "./context/store";
import { analysisToContext } from "./context/types";
import { formatForWhatsApp } from "./formatResponse";
import type { InboundMessage } from "./inboundEvent";
import {
  analysisErrorReply,
  guideReply,
  unsupportedMediaReply,
} from "./replies";
import { sendWhatsAppText } from "./zavu";

function publicBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_CARTA_URL ?? "").trim();
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
    await reply(to, guideReply("empty"));
    return;
  }

  appendTurn(to, { role: "user", text: `[imagen] ${trimmed}` });

  const result = await analyzeClaim(trimmed);
  const responseText = formatForWhatsApp(result, publicBaseUrl());
  setLastAnalysis(to, analysisToContext(result));
  appendTurn(to, { role: "assistant", text: responseText });
  await reply(to, responseText);
}

export async function handleInboundMessage(message: InboundMessage): Promise<void> {
  const { from, messageType, text, content } = message;

  console.log("[wa/inbound]", {
    id: message.messageId,
    from,
    type: messageType,
    hasText: !!text,
    hasMedia: !!content?.mediaUrl,
  });

  try {
    switch (messageType) {
      case "text": {
        if (!text?.trim()) {
          await reply(from, guideReply("empty"));
          return;
        }

        const response = await processTextMessage(from, text);
        await reply(from, response);
        return;
      }

      case "image": {
        const mediaUrl = content?.mediaUrl;
        if (!mediaUrl) {
          await reply(
            from,
            "Recibí una imagen pero no pude descargarla. Intenta de nuevo en un momento."
          );
          return;
        }

        const dataUrl = await fetchMediaAsDataUrl(mediaUrl);
        const extracted = await extractClaimFromImage(dataUrl);

        if (extracted.noClaimFound || !extracted.claim) {
          appendTurn(from, { role: "user", text: "[imagen]" });
          const msg = guideReply("image");
          appendTurn(from, { role: "assistant", text: msg });
          await reply(from, msg);
          return;
        }

        await analyzeAndReply(from, extracted.claim);
        return;
      }

      case "audio": {
        await reply(from, unsupportedMediaReply("audio"));
        return;
      }

      default: {
        await reply(from, unsupportedMediaReply("other"));
        return;
      }
    }
  } catch (err) {
    console.error("[wa/handle] failed:", err);
    await reply(from, analysisErrorReply());
  }
}
