/**
 * Diagnose Supabase + pgvector retrieval (run from project root).
 *   npm run debug:retrieval
 */

import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

function normalizeSupabaseUrl(url: string): string {
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

function env(name: string): string | undefined {
  return process.env[name]?.trim();
}

async function countDocuments(
  label: string,
  url: string,
  key: string
): Promise<number | null> {
  const client = createClient(normalizeSupabaseUrl(url), key);
  const { count, error } = await client
    .from("documents")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.log(`  ${label}: SELECT failed — ${error.message} (code: ${error.code})`);
    return null;
  }
  return count ?? 0;
}

async function testRpc(
  label: string,
  url: string,
  key: string,
  embedding: number[]
) {
  const client = createClient(normalizeSupabaseUrl(url), key);
  const { data, error } = await client.rpc("match_documents", {
    query_embedding: embedding,
    match_count: 5,
  });

  if (error) {
    console.log(`  ${label}: RPC failed — ${error.message} (code: ${error.code})`);
    if (error.code === "PGRST202") {
      console.log("    → Function not in schema cache. Re-run supabase/schema.sql in SQL Editor.");
    }
    return;
  }

  const rows = data ?? [];
  console.log(`  ${label}: RPC returned ${rows.length} row(s)`);
  if (rows.length > 0) {
    const top = rows[0] as {
      id: number;
      similarity?: number;
      metadata?: { articleNumber?: string };
    };
    console.log(
      `    top: id=${top.id} similarity=${top.similarity?.toFixed(4)} article=${top.metadata?.articleNumber ?? "?"}`
    );
  }
}

async function main() {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  const openaiKey = env("OPENAI_API_KEY");

  console.log("\n═══ Carta retrieval diagnostics ═══\n");

  if (!url || !anonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  console.log("Supabase URL:", normalizeSupabaseUrl(url));

  // 1. Row counts (anon vs service role)
  console.log("\n1. Document count (detects RLS blocking anon reads)");
  if (serviceKey) {
    const serviceCount = await countDocuments("service_role", url, serviceKey);
    const anonCount = await countDocuments("anon", url, anonKey);
    if (serviceCount !== null && anonCount !== null && serviceCount > 0 && anonCount === 0) {
      console.log(
        "\n  ⚠ RLS LIKELY ISSUE: service_role sees rows, anon sees 0."
      );
      console.log("    Fix: run updated supabase/schema.sql (RLS read policy).\n");
    }
  } else {
    await countDocuments("anon", url, anonKey);
    console.log("  (Set SUPABASE_SERVICE_ROLE_KEY in .env.local to compare with service_role)");
  }

  // 2. Sample row via service role
  if (serviceKey) {
    console.log("\n2. Sample row (service_role)");
    const admin = createClient(normalizeSupabaseUrl(url), serviceKey);
    const { data: sample, error } = await admin
      .from("documents")
      .select("id, metadata, embedding")
      .limit(1)
      .single();

    if (error) {
      console.log("  ", error.message);
    } else if (sample) {
      const emb = sample.embedding as number[] | string | null;
      const len = Array.isArray(emb) ? emb.length : typeof emb === "string" ? "string (pgvector)" : 0;
      console.log(`  id=${sample.id} article=${(sample.metadata as { articleNumber?: string })?.articleNumber}`);
      console.log(`  embedding type=${typeof emb} length=${len}`);
    }
  }

  // 3. Query embedding
  if (!openaiKey) {
    console.log("\n3. Skipping RPC test — no OPENAI_API_KEY");
    return;
  }

  console.log("\n3. Query embedding");
  const openai = new OpenAI({ apiKey: openaiKey });
  const query = "Es la paz un derecho fundamental del ser humano de acuerdo a la Constitución?";
  const embRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const embedding = embRes.data[0].embedding;
  console.log(`  model=text-embedding-3-small dimensions=${embedding.length}`);
  if (embedding.length !== 1536) {
    console.log("  ⚠ Expected 1536 dimensions — update vector(1536) in schema if different.");
  }

  // 4. RPC with both keys
  console.log("\n4. match_documents RPC");
  await testRpc("anon", url, anonKey, embedding);
  if (serviceKey) {
    await testRpc("service_role", url, serviceKey, embedding);
  }

  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
