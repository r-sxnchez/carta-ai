import crypto from "node:crypto";

const TIMESTAMP_TOLERANCE_SECONDS = 300;

/**
 * Verifies a Zavu webhook signature.
 *
 * Header: `X-Zavu-Signature: t=<unix_seconds>,v1=<hex_hmac_sha256>`
 *
 * Despite what Zavu's docs claim (`${timestamp}.${rawBody}`), Zavu actually
 * signs just the raw body. The `t=` field is informational — we still enforce
 * a 5-minute freshness window for basic replay protection.
 */
export function verifyZavuSignature(headers: Headers, rawBody: string): boolean {
  const secret = process.env.ZAVU_WEBHOOK_SECRET;
  if (!secret) return false;

  const header = headers.get("x-zavu-signature");
  if (!header) return false;

  let timestamp: string | undefined;
  let signature: string | undefined;
  for (const part of header.split(",")) {
    const trimmed = part.trim();
    if (trimmed.startsWith("t=")) timestamp = trimmed.slice(2);
    else if (trimmed.startsWith("v1=")) signature = trimmed.slice(3);
  }
  if (!signature) return false;

  if (timestamp) {
    const ts = Number(timestamp);
    if (Number.isFinite(ts)) {
      const skew = Math.abs(Math.floor(Date.now() / 1000) - ts);
      if (skew > TIMESTAMP_TOLERANCE_SECONDS) return false;
    }
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
