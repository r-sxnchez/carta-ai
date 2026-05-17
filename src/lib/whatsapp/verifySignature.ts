import crypto from "node:crypto";

const TIMESTAMP_TOLERANCE_SECONDS = 300;
const DEBUG = process.env.ZAVU_DEBUG_SIGNATURE === "1";

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

  if (DEBUG) {
    const headerDump: Record<string, string> = {};
    headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith("x-zavu") || key.toLowerCase().includes("signature")) {
        headerDump[key] = value;
      }
    });
    console.log("[wa/sig/debug] headers:", JSON.stringify(headerDump));
    console.log("[wa/sig/debug] secret head:", secret.slice(0, 6) + "…", "len:", secret.length);
    console.log("[wa/sig/debug] body len:", rawBody.length, "head:", rawBody.slice(0, 120));
  }

  const header = headers.get("x-zavu-signature");
  if (!header) {
    if (DEBUG) console.warn("[wa/sig/debug] missing x-zavu-signature header");
    return false;
  }

  let timestamp: string | undefined;
  let signature: string | undefined;
  for (const part of header.split(",")) {
    const trimmed = part.trim();
    if (trimmed.startsWith("t=")) timestamp = trimmed.slice(2);
    else if (trimmed.startsWith("v1=")) signature = trimmed.slice(3);
  }

  if (DEBUG) {
    console.log("[wa/sig/debug] parsed t:", timestamp, "v1 head:", signature?.slice(0, 12));
  }

  if (!timestamp || !signature) {
    if (DEBUG) console.warn("[wa/sig/debug] could not parse t=/v1= from header:", header);
    return false;
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > TIMESTAMP_TOLERANCE_SECONDS) {
    if (DEBUG) console.warn("[wa/sig/debug] timestamp outside tolerance:", { ts, now });
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  if (DEBUG) {
    console.log("[wa/sig/debug] expected head:", expected.slice(0, 12), "received head:", signature.slice(0, 12));
    console.log("[wa/sig/debug] expected len:", expected.length, "received len:", signature.length);
  }

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
