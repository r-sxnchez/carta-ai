import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// Enable verbose RAG logs for this script
process.env.DEBUG_RAG = "1";

async function main() {
  const { retrieveRelevantDocuments } = await import(
    "../src/lib/rag/retrieve"
  );

  const query =
    "Es la paz un derecho fundamental del ser humano de acuerdo a la Constitución?";

  console.log(`\nQuery: ${query}\n`);

  const results = await retrieveRelevantDocuments(query);

  console.log("\n── Results ──");
  console.log("count:", results.length);

  if (results.length === 0) {
    console.log(
      "\nNo matches. Run: npm run debug:retrieval\n" +
        "If service_role sees rows but anon sees 0 → re-run supabase/schema.sql (RLS policies).\n"
    );
    return;
  }

  for (const row of results) {
    const article = (row.metadata as { articleNumber?: string })?.articleNumber;
    console.log(
      `  • id=${row.id} similarity=${row.similarity.toFixed(4)} article=${article ?? "?"}`
    );
  }

  console.log("\nTop match preview:\n", results[0].content.slice(0, 400), "…\n");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
