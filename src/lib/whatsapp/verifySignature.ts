import crypto from "node:crypto";

const TIMESTAMP_TOLERANCE_SECONDS = 300;

function hmacHex(key: Buffer, payload: string): string {
  return crypto.createHmac("sha256", key).update(payload).digest("hex");
}

function deriveDecodedKey(raw: string): Buffer {
  if (raw.startsWith("whsec_")) {
    return Buffer.from(raw.slice("whsec_".length), "base64");
  }
  return Buffer.from(raw, "base64");
}

/**
 * Verifies a Zavu webhook signature.
 *
 * Per docs: header `X-Zavu-Signature: t=<unix>,v1=<hex>`, payload `${t}.${body}`,
 * HMAC-SHA256, secret used as UTF-8 bytes (the `whsec_` prefix is part of the secret).
 *
 * NOTE: aggressive diagnostic logs are currently on. Strip after verification stable.
 */
export function verifyZavuSignature(headers: Headers, rawBody: string): boolean {
  const secret = process.env.ZAVU_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[wa/sig] ZAVU_WEBHOOK_SECRET is not set");
    return false;
  }

  // All request headers, for diagnosis.
  const allHeaders: Record<string, string> = {};
  headers.forEach((value, key) => {
    allHeaders[key] = value;
  });
  console.log("[wa/sig] ALL headers:", JSON.stringify(allHeaders));

  // Secret identification — first 10 + last 4 of the raw env var, plus length.
  const secLen = secret.length;
  const secFingerprint = `${secret.slice(0, 10)}…${secret.slice(-4)} (len=${secLen})`;
  console.log("[wa/sig] secret fingerprint:", secFingerprint);

  // Body hash so we can compare what Vercel hands us vs what Zavu sent.
  const bodySha = crypto.createHash("sha256").update(rawBody).digest("hex");
  console.log("[wa/sig] body len:", rawBody.length, "sha256:", bodySha);

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

  console.log("[wa/sig] received v1:", signature);

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  const skew = now - ts;
  console.log("[wa/sig] ts:", ts, "now:", now, "skew(s):", skew);
  if (Math.abs(skew) > TIMESTAMP_TOLERANCE_SECONDS) {
    console.warn("[wa/sig] timestamp outside tolerance");
    return false;
  }

  const event = headers.get("x-zavu-event") ?? "";
  const keyLit = Buffer.from(secret, "utf8");
  const keyDec = deriveDecodedKey(secret);

  const payloads = [
    { name: "ts.body", value: `${timestamp}.${rawBody}` },
    { name: "body", value: rawBody },
    { name: "ts+body", value: `${timestamp}${rawBody}` },
    { name: "event.ts.body", value: `${event}.${timestamp}.${rawBody}` },
  ];

  for (const p of payloads) {
    const litSig = hmacHex(keyLit, p.value);
    const decSig = hmacHex(keyDec, p.value);
    const litMatch = litSig === signature ? "  ✓ MATCH (literal)" : "";
    const decMatch = decSig === signature ? "  ✓ MATCH (decoded)" : "";
    console.log(`[wa/sig] payload=${p.name} lit=${litSig.slice(0, 12)} dec=${decSig.slice(0, 12)}${litMatch}${decMatch}`);
    if (litSig === signature || decSig === signature) {
      return true;
    }
  }

  return false;
}
