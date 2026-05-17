import crypto from "node:crypto";

export function verifyZavuSignature(headers: Headers, rawBody: string): boolean {
  const secret = process.env.ZAVU_WEBHOOK_SECRET;
  if (!secret) return false;

  const signature = headers.get("x-zavu-signature");
  const timestamp = headers.get("x-zavu-timestamp");
  if (!signature || !timestamp) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
