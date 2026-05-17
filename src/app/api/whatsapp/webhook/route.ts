import { NextRequest, NextResponse } from "next/server";
import { verifyZavuSignature } from "@/lib/whatsapp/verifySignature";
import { isInboundMessage, type InboundEvent } from "@/lib/whatsapp/inboundEvent";
import { handleInboundMessage } from "@/lib/whatsapp/handleInbound";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifyZavuSignature(req.headers, rawBody)) {
    console.warn("[wa/webhook] signature verification failed");
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  let event: InboundEvent;
  try {
    event = JSON.parse(rawBody) as InboundEvent;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  if (!isInboundMessage(event)) {
    return NextResponse.json({ ok: true });
  }

  try {
    await handleInboundMessage(event.message);
  } catch (err) {
    console.error("[wa/webhook] handler threw:", err);
  }

  return NextResponse.json({ ok: true });
}
