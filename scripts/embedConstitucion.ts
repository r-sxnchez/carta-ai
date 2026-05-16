/**
 * Embed MVP constitutional corpus (CP-1991 articles) into Supabase.
 *
 * Usage (from project root):
 *   npm run embed:constitucion           → embed all ~486 articles
 *   npm run embed:constitucion -- --limit 5   → test with 5 chunks
 */

import path from "path";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { loadMvpCorpus } from "./loadConstitucion";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name} in .env.local — add it before running embed:constitucion.`
    );
  }
  return value;
}

/** Supabase client expects the project URL, not the REST API path */
function normalizeSupabaseUrl(url: string): string {
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

const supabaseUrl = normalizeSupabaseUrl(requireEnv("NEXT_PUBLIC_SUPABASE_URL"));
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: requireEnv("OPENAI_API_KEY"),
});

const limitArg = process.argv.indexOf("--limit");
const limit =
  limitArg !== -1 ? Number(process.argv[limitArg + 1]) : undefined;

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

async function main() {
  console.log("Loading MVP constitutional corpus...");
  const docs = loadMvpCorpus({ splitArticles: true });
  const toEmbed =
    limit && limit > 0 ? docs.slice(0, limit) : docs;

  console.log(`Embedding ${toEmbed.length} of ${docs.length} article chunks...\n`);

  let inserted = 0;

  for (const doc of toEmbed) {
    const label =
      doc.metadata.articleNumber ?? doc.metadata.fileName;
    console.log(`  → Artículo ${label}`);

    const embedding = await generateEmbedding(doc.content);

    const { error } = await supabase.from("documents").insert({
      content: doc.content,
      metadata: doc.metadata,
      embedding,
    });

    if (error) {
      console.error(`  ✗ Supabase error (${label}):`, error.message);
      if (error.message.includes("documents")) {
        console.error(
          "\n  Hint: create the table first — run supabase/schema.sql in the Supabase SQL editor.\n"
        );
      }
      process.exit(1);
    }

    inserted++;
  }

  console.log(`\n✓ Inserted ${inserted} documents.\n`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
