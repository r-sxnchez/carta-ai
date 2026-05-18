import crypto from "node:crypto";

const TIMESTAMP_TOLERANCE_SECONDS = 300;

/**
 * Decode a Zavu webhook secret. Zavu uses the `whsec_<base64>` convention
 * (same as Svix): the actual HMAC key is the base64-decoded body, not the
 * string with the prefix.
 */
function deriveSecretKey(raw: string): { key: Buffer; mode: "decoded" | "literal" } {
  if (raw.startsWith("whsec_")) {
    const body = raw.slice("whsec_".length);
    try {
      return { key: Buffer.from(body, "base64"), mode: "decoded" };
    } catch {
      // Fall through to literal.
    }
  }
  return { key: Buffer.from(raw, "utf8"), mode: "literal" };
}

function hmacHex(key: Buffer, payload: string): string {
  return crypto.createHmac("sha256", key).update(payload).digest("hex");
}

/**
 * Verifies a Zavu webhook signature.
 *
 * Header format (Stripe-style, single header):
 *   X-Zavu-Signature: t=<unix_seconds>,v1=<hex_hmac_sha256>
 *
 * Signed payload: `${timestamp}.${rawBody}`.
 * Secret: `whsec_<base64>` — base64-decoded body is the HMAC key.
 */
export function verifyZavuSignature(headers: Headers, rawBody: string): boolean {
  const secret = process.env.ZAVU_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[wa/sig] ZAVU_WEBHOOK_SECRET is not set");
    return false;
  }

  const header = headers.get("x-zavu-signature");
  if (!header) {
    console.warn("[wa/sig] missing x-zavu-signature header");
    return false;
  }

  let timestamp: string | undefined;
  let signature: string | undefined;
  for (const part of header.split(",")) {
    const trimmed = part.trim();
    if (trimmed.startsWith("t=")) timestamp = trimmed.slice(2);
    else if (trimmed.startsWith("v1=")) signature = trimmed.slice(3);
  }
  if (!timestamp || !signature) {
    console.warn("[wa/sig] could not parse t=/v1= from header:", header);
    return false;
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > TIMESTAMP_TOLERANCE_SECONDS) {
    console.warn("[wa/sig] timestamp outside tolerance:", { ts, now });
    return false;
  }

  const payload = `${timestamp}.${rawBody}`;
  const derived = deriveSecretKey(secret);

  const expected = hmacHex(derived.key, payload);
  const literalExpected = hmacHex(Buffer.from(secret, "utf8"), payload);

  console.log("[wa/sig] received:", signature.slice(0, 16));
  console.log("[wa/sig] expected(decoded):", expected.slice(0, 16), "mode:", derived.mode);
  console.log("[wa/sig] expected(literal):", literalExpected.slice(0, 16));

  const recv = Buffer.from(signature, "utf8");
  const want = Buffer.from(expected, "utf8");
  if (recv.length === want.length && crypto.timingSafeEqual(recv, want)) return true;

  const wantLit = Buffer.from(literalExpected, "utf8");
  if (recv.length === wantLit.length && crypto.timingSafeEqual(recv, wantLit)) {
    console.warn("[wa/sig] matched via LITERAL secret — Zavu is not using whsec_ base64 convention");
    return true;
  }

  return false;
}
