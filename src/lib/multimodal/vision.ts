/**
 * Vision client backed by OpenAI's chat completions API with image input.
 */

import OpenAI from "openai";

const DEFAULT_VISION_MODEL = "gpt-4o-mini";

export class VisionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VisionConfigError";
  }
}

export class VisionApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "VisionApiError";
  }
}

export function isVisionConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new VisionConfigError(
      "OPENAI_API_KEY is not set. Add it to .env.local to enable screenshot ingestion."
    );
  }
  return new OpenAI({ apiKey });
}

interface CallVisionOptions {
  systemPrompt: string;
  userPrompt: string;
  imageDataUrl: string;
  jsonResponse?: boolean;
}

export async function callVision(opts: CallVisionOptions): Promise<string> {
  const client = getClient();
  const model = process.env.OPENAI_VISION_MODEL || DEFAULT_VISION_MODEL;

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.1,
      response_format: opts.jsonResponse ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: opts.systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: opts.userPrompt },
            { type: "image_url", image_url: { url: opts.imageDataUrl } },
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new VisionApiError("empty content in choices[0].message", 502);
    }
    return content;
  } catch (err) {
    if (err instanceof VisionApiError || err instanceof VisionConfigError) {
      throw err;
    }
    const status =
      err instanceof OpenAI.APIError && typeof err.status === "number" ? err.status : 502;
    const message = err instanceof Error ? err.message : String(err);
    throw new VisionApiError(message, status);
  }
}
