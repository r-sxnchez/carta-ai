import { createClient } from "@supabase/supabase-js";

/** Supabase client expects project URL, not /rest/v1 */
function normalizeSupabaseUrl(url: string): string {
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Add them to .env.local (Next.js loads this automatically; scripts must call dotenv first)."
  );
}

export const supabase = createClient(normalizeSupabaseUrl(url), key);
