import OpenAI from "openai";
import { supabase } from "../supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEBUG = process.env.DEBUG_RAG === "1" || process.env.DEBUG_RAG === "true";

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  const embedding = response.data[0].embedding;

  if (DEBUG) {
    console.log("[rag] embedding dimensions:", embedding.length);
    console.log("[rag] embedding sample:", embedding.slice(0, 3).map((n) => n.toFixed(6)));
  }

  return embedding;
}

export interface RetrievedDocument {
  id: number;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export async function retrieveRelevantDocuments(
  query: string,
  matchCount = 5
): Promise<RetrievedDocument[]> {
  if (DEBUG) console.log("[rag] query:", query);

  const embedding = await generateEmbedding(query);

  // Quick visibility: can anon read any rows? (empty → RLS or empty table)
  if (DEBUG) {
    const { count, error: countError } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.warn("[rag] documents count error:", countError.message, countError.code);
    } else {
      console.log("[rag] documents visible to client:", count ?? 0);
    }
  }

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: matchCount,
  });

  if (error) {
    console.error("[rag] match_documents error:", error.message, "code:", error.code);
    if (error.code === "PGRST202") {
      console.error(
        "[rag] RPC not found — run supabase/schema.sql in the Supabase SQL editor."
      );
    }
    throw error;
  }

  const rows = (data ?? []) as RetrievedDocument[];

  if (DEBUG) {
    console.log("[rag] rows returned:", rows.length);
    for (const row of rows) {
      const article = (row.metadata as { articleNumber?: string })?.articleNumber;
      console.log(
        `[rag]   id=${row.id} similarity=${row.similarity?.toFixed(4) ?? "null"} article=${article ?? "?"}`
      );
    }
    if (rows[0]) {
      console.log("[rag] first content preview:", rows[0].content.slice(0, 200).replace(/\n/g, " "));
    }
  }

  return rows;
}
