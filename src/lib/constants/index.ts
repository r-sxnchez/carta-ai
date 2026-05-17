const WA_NUMBER = (process.env.NEXT_PUBLIC_CARTA_WA_NUMBER ?? "573001234567").replace(/\D/g, "");
const WA_PREFILL = "Hola Carta, quiero verificar una afirmación";

export const WHATSAPP_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_PREFILL)}`;

export const MAX_CLAIM_LENGTH = 2000;

export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
export const ACCEPTED_IMAGE_MIME = ["image/png", "image/jpeg", "image/webp", "image/heic"];

export const MAX_WA_REPLY_CHARS = 900;
