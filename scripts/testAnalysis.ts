import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const { analyzeClaim } = await import("../src/lib/ai/analyzeClaim");

  const claim =
    process.argv[2] ?? "El presidente puede disolver el Congreso mediante decreto.";

  console.log("═".repeat(60));
  console.log("CARTA — Constitutional Reasoning Engine");
  console.log("═".repeat(60));
  console.log(`\nClaim: "${claim}"\n`);
  console.log("Retrieving constitutional evidence and analyzing...\n");

  const result = await analyzeClaim(claim);

  console.log("─".repeat(60));
  console.log("ANALYSIS RESULT");
  console.log("─".repeat(60));
  console.log(JSON.stringify(result, null, 2));

  console.log("\n" + "─".repeat(60));
  console.log("SUMMARY");
  console.log(`  Plausibility : ${result.constitutionalPlausibility.toUpperCase()}`);
  console.log(`  Confidence   : ${result.confidence}`);
  console.log(`  Articles     : ${result.constitutionalArticles.join(", ") || "none cited"}`);
  console.log(`  Sources      : ${result.sources.length} constitutional fragments retrieved`);

  if (result.manipulationSignals.length > 0) {
    console.log(`  Signals      : ${result.manipulationSignals.join(", ")}`);
  }

  console.log("\n" + "═".repeat(60));
}

main().catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
