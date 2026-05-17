import { NextRequest, NextResponse } from "next/server";
import {
  extractClaimFromImage,
  isVisionConfigured,
  VisionApiError,
  VisionConfigError,
} from "@/lib/multimodal";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/heic"]);

export async function POST(request: NextRequest) {
  if (!isVisionConfigured()) {
    return NextResponse.json(
      {
        error:
          "La extracción multimodal no está disponible. Falta configurar OPENAI_API_KEY en el servidor.",
      },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Se esperaba multipart/form-data con un archivo en el campo 'image'." },
      { status: 400 }
    );
  }

  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No se recibió ninguna imagen en el campo 'image'." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "La imagen está vacía." }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: `La imagen supera el máximo de ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.` },
      { status: 413 }
    );
  }

  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json(
      { error: "Formato no soportado. Usa PNG, JPEG, WEBP o HEIC." },
      { status: 415 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mime};base64,${base64}`;

  try {
    const extracted = await extractClaimFromImage(dataUrl);
    return NextResponse.json(extracted);
  } catch (err) {
    if (err instanceof VisionConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    const isDev = process.env.NODE_ENV !== "production";
    if (err instanceof VisionApiError) {
      console.error("[api/extract] vision error:", err.message);
      return NextResponse.json(
        {
          error: isDev
            ? `Vision: ${err.message}`
            : "No pudimos analizar la imagen. Intenta de nuevo en un momento.",
        },
        { status: 502 }
      );
    }
    console.error("[api/extract] unexpected:", err);
    return NextResponse.json(
      {
        error: isDev
          ? `Error inesperado: ${err instanceof Error ? err.message : String(err)}`
          : "Error inesperado al procesar la imagen.",
      },
      { status: 500 }
    );
  }
}
