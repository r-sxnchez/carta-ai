import crypto from "node:crypto";

const TIMESTAMP_TOLERANCE_SECONDS = 300;

/**
 * Verifies a Zavu webhook signature.
 *
 * Header format (Stripe-style, single header):
 *   X-Zavu-Signature: t=<unix_seconds>,v1=<hex_hmac_sha256>
 *
 * The signed payload is `${timestamp}.${rawBody}`.
 */
export function verifyZavuSignature(headers: Headers, rawBody: string): boolean {
  const secret = process.env.ZAVU_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[wa/sig] ZAVU_WEBHOOK_SECRET is not set");
    return false;
  }

  const header = headers.get("x-zavu-signature");
  if (!header) return false;

  let timestamp: string | undefined;
  let signature: string | undefined;
  for (const part of header.split(",")) {
    const trimmed = part.trim();
    if (trimmed.startsWith("t=")) timestamp = trimmed.slice(2);
    else if (trimmed.startsWith("v1=")) signature = trimmed.slice(3);
  }
  if (!timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > TIMESTAMP_TOLERANCE_SECONDS) {
    console.warn("[wa/sig] timestamp outside tolerance window");
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
