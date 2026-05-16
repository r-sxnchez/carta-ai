/**
 * Carta — Constitutional corpus inspection & MVP ingestion
 *
 * Usage:
 *   npm run analyze:constitucion   → inspect repository (fast, no full load)
 *   npm run load:constitucion      → load MVP constitutional subset only
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

// ─── Paths ───────────────────────────────────────────────────────────────────

const DATA_ROOT = path.join(process.cwd(), "data", "constitucion");
const REPO_ROOT = path.join(DATA_ROOT, "legalize-co");
const CO_DIR = path.join(REPO_ROOT, "co");

/** Primary MVP source — consolidated 1991 Constitution (vigente) */
const CP_1991 = "CONSTITUCION-POLITICA-CP-1991.md";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FileEntry {
  fileName: string;
  fullPath: string;
  relativePath: string;
  sizeBytes: number;
  depth: number;
}

interface FrontmatterSummary {
  identifier?: string;
  title?: string;
  rank?: string;
  status?: string;
  country?: string;
  publication_date?: string;
}

export interface ConstitutionDocument {
  content: string;
  metadata: {
    fileName: string;
    path: string;
    identifier?: string;
    title?: string;
    rank?: string;
    status?: string;
    articleNumber?: string;
    chunkType?: "full_text" | "article";
  };
}

interface AnalyzeOptions {
  /** Read YAML frontmatter only for constitutional candidates (~103 files) */
  deepFrontmatter?: boolean;
}

// ─── CLI ───────────────────────────────────────────────────────────────────────

const mode = process.argv[2] ?? "analyze";

// ─── Filesystem helpers ────────────────────────────────────────────────────────

function listTopLevelDirs(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function walkMarkdownFiles(dir: string, base = dir): FileEntry[] {
  if (!fs.existsSync(dir)) return [];

  const entries: FileEntry[] = [];

  for (const name of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, name);
    const stat = fs.statSync(fullPath);
    const relativePath = path.relative(base, fullPath);

    if (stat.isDirectory()) {
      entries.push(...walkMarkdownFiles(fullPath, base));
      continue;
    }

    if (!name.endsWith(".md")) continue;

    entries.push({
      fileName: name,
      fullPath,
      relativePath,
      sizeBytes: stat.size,
      depth: relativePath.split(path.sep).length - 1,
    });
  }

  return entries;
}

function inferDocType(fileName: string): string {
  if (fileName.startsWith("CONSTITUCION")) return "CONSTITUCION";
  if (fileName.startsWith("ACTO-LEGISLATIVO")) return "ACTO-LEGISLATIVO";
  if (fileName.startsWith("LEY-")) return "LEY";
  if (fileName.startsWith("DECRETO")) return "DECRETO";
  if (fileName.startsWith("RESOLUCION")) return "RESOLUCION";
  return "OTHER";
}

function readFrontmatter(filePath: string): FrontmatterSummary {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  return {
    identifier: data.identifier as string | undefined,
    title: data.title as string | undefined,
    rank: data.rank as string | undefined,
    status: data.status as string | undefined,
    country: data.country as string | undefined,
    publication_date: data.publication_date as string | undefined,
  };
}

function logSection(title: string) {
  console.log("\n" + "═".repeat(60));
  console.log(`  ${title}`);
  console.log("═".repeat(60));
}

function logTable(rows: [string, string | number][], labelWidth = 28) {
  for (const [label, value] of rows) {
    console.log(`  ${label.padEnd(labelWidth)} ${value}`);
  }
}

// ─── Analysis ──────────────────────────────────────────────────────────────────

export function analyzeCorpus(options: AnalyzeOptions = {}) {
  const { deepFrontmatter = true } = options;

  logSection("CARTA — Legal corpus inspection");

  if (!fs.existsSync(REPO_ROOT)) {
    console.error(`\n  ✗ Repository not found at:\n    ${REPO_ROOT}`);
    console.error(
      "\n  Clone legalize-co into data/constitucion/legalize-co first.\n"
    );
    process.exit(1);
  }

  // 1. Top-level structure
  logSection("1. Top-level directories");
  logTable([
    ["data/constitucion/", listTopLevelDirs(DATA_ROOT).join(", ") || "(empty)"],
    ["legalize-co/", listTopLevelDirs(REPO_ROOT).join(", ") || "(empty)"],
    ["legalize-co/co/", "flat — all norms in one folder (no subdirs)"],
  ]);

  // 2. Fast inventory (filename only — avoids reading 71k file bodies)
  logSection("2. Markdown inventory (filename scan)");
  const coFiles = fs
    .readdirSync(CO_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => ({
      fileName,
      fullPath: path.join(CO_DIR, fileName),
      relativePath: fileName,
      sizeBytes: fs.statSync(path.join(CO_DIR, fileName)).size,
      depth: 0,
    }));

  const totalMd = coFiles.length;
  const totalBytes = coFiles.reduce((s, f) => s + f.sizeBytes, 0);

  logTable([
    ["Total .md files", totalMd.toLocaleString()],
    ["Total size", `${(totalBytes / 1024 / 1024).toFixed(1)} MB`],
    ["Folder depth", "0 (flat corpus — ideal for simple filtering)"],
    ["Country", "co (Colombia only in this clone)"],
  ]);

  // 3. Distribution by document type (inferred from filename)
  logSection("3. Distribution by document type (filename prefix)");
  const byType: Record<string, number> = {};
  for (const f of coFiles) {
    const t = inferDocType(f.fileName);
    byType[t] = (byType[t] || 0) + 1;
  }

  const sortedTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes) {
    const pct = ((count / totalMd) * 100).toFixed(1);
    const bar = "█".repeat(Math.min(40, Math.round((count / totalMd) * 40)));
    console.log(
      `  ${type.padEnd(20)} ${String(count).padStart(6)}  (${pct}%)  ${bar}`
    );
  }

  // 4. Constitutional candidates
  logSection("4. Constitutional candidates");
  const constitutional = coFiles.filter(
    (f) =>
      f.fileName.startsWith("CONSTITUCION") ||
      f.fileName.startsWith("ACTO-LEGISLATIVO")
  );

  logTable([
    ["CONSTITUCION-* files", coFiles.filter((f) => f.fileName.startsWith("CONSTITUCION")).length],
    ["ACTO-LEGISLATIVO-* files", coFiles.filter((f) => f.fileName.startsWith("ACTO-LEGISLATIVO")).length],
    ["Combined constitutional pool", constitutional.length],
    ["Noise excluded (LEY+DECRETO+…)", (totalMd - constitutional.length).toLocaleString()],
    ["Noise reduction", `${(((totalMd - constitutional.length) / totalMd) * 100).toFixed(1)}% of corpus dropped`],
  ]);

  console.log("\n  CONSTITUCION files:");
  for (const f of coFiles.filter((x) => x.fileName.startsWith("CONSTITUCION"))) {
    const kb = (f.sizeBytes / 1024).toFixed(0);
    const marker = f.fileName === CP_1991 ? "  ← MVP PRIMARY" : "  ← historical (exclude)";
    console.log(`    • ${f.fileName} (${kb} KB)${marker}`);
  }

  // 5. Deep frontmatter on constitutional subset only (~103 files, fast)
  if (deepFrontmatter) {
    logSection("5. Frontmatter analysis (constitutional subset only)");
    const ranks: Record<string, number> = {};
    const statuses: Record<string, number> = {};
    const post1991InForce: string[] = [];

    for (const f of constitutional) {
      const fm = readFrontmatter(f.fullPath);
      if (fm.rank) ranks[fm.rank] = (ranks[fm.rank] || 0) + 1;
      if (fm.status) statuses[fm.status] = (statuses[fm.status] || 0) + 1;

      if (f.fileName.startsWith("ACTO-LEGISLATIVO")) {
        const year = Number(f.fileName.match(/-(\d{4})\.md$/)?.[1] ?? 0);
        if (year >= 1991 && fm.status === "in_force") {
          post1991InForce.push(f.fileName.replace(".md", ""));
        }
      }
    }

    console.log("\n  rank:");
    for (const [k, v] of Object.entries(ranks)) console.log(`    ${k}: ${v}`);

    console.log("\n  status:");
    for (const [k, v] of Object.entries(statuses)) console.log(`    ${k}: ${v}`);

    console.log(`\n  Post-1991 actos legislativos vigentes: ${post1991InForce.length}`);
    if (post1991InForce.length > 0 && post1991InForce.length <= 35) {
      console.log(`    ${post1991InForce.join(", ")}`);
    }
  }

  // 6. CP-1991 article density
  logSection("6. Constitución Política 1991 — article density");
  const cpPath = path.join(CO_DIR, CP_1991);
  let articleCount = 0;
  if (fs.existsSync(cpPath)) {
    const raw = fs.readFileSync(cpPath, "utf-8");
    const { data, content } = matter(raw);
    const articleMatches = content.match(/^##### \*\*Artículo\s+/gm) ?? [];
    articleCount = articleMatches.length;
    logTable([
      ["File", CP_1991],
      ["rank", String(data.rank ?? "—")],
      ["status", String(data.status ?? "—")],
      ["last_updated", String(data.last_updated ?? "—")],
      ["modification_count", String(data.modification_count ?? "—")],
      ["Articles detected", articleMatches.length],
      ["Recommended RAG chunks", `~${articleMatches.length} (one per article)`],
      ["Source", String(data.source ?? "SUIN-Juriscol")],
    ]);
  }

  // 7. MVP recommendation
  logSection("7. MVP corpus recommendation");
  console.log(`
  TIER 1 — USE FOR HACKATHON (required):
    • ${CP_1991}
    • Split into ~${articleCount} article-level chunks for retrieval
    • Already consolidated (reforms folded into main text)
    • Answers: separation of powers, Congress, President, rights, etc.

  TIER 2 — OPTIONAL (post-MVP):
    • Post-1991 ACTO-LEGISLATIVO with status: in_force (~30 files)
    • Only if you need isolated reform texts / citations to specific reforms
    • Most reforms are already reflected in CP-1991 (modification_count: 249)

  EXCLUDE (noise):
    • LEY-* (${byType["LEY"]?.toLocaleString() ?? "?"} files) — ordinary legislation
    • DECRETO-* (${byType["DECRETO"]?.toLocaleString() ?? "?"} files) — executive decrees
    • Historical constitutions (1861, 1886)
    • Repealed actos legislativos (pre-1991 reforms)

  Corpus reduction: 71,900 → 1 file (~${articleCount} chunks) = 99.99% noise removed
`);
}

// ─── MVP load ──────────────────────────────────────────────────────────────────

/** Split CP-1991 into article-level documents for future RAG chunking */
export function splitConstitutionByArticle(
  rawContent: string,
  baseMetadata: Partial<ConstitutionDocument["metadata"]>
): ConstitutionDocument[] {
  const { content } = matter(rawContent);

  // Handles: Artículo 1., Artículo 22A., Artículo transitorio 5., etc.
  const parts = content.split(/(?=^##### \*\*Artículo\s+)/m).filter((p) => p.trim());

  const chunks: ConstitutionDocument[] = [];

  for (const part of parts) {
    const headerMatch = part.match(
      /^##### \*\*Artículo\s+((?:transitorio\s+)?[\wº°]+)\.?/
    );
    if (!headerMatch) continue;

    const articleNumber = headerMatch[1].replace(/\s+/g, " ").trim();

    chunks.push({
      content: part.trim(),
      metadata: {
        ...baseMetadata,
        fileName: baseMetadata.fileName ?? CP_1991,
        path: baseMetadata.path ?? "",
        articleNumber,
        chunkType: "article",
      },
    });
  }

  return chunks;
}

export interface MvpLoadOptions {
  /** Include post-1991 in-force actos legislativos (default: false for hackathon) */
  includeReformActs?: boolean;
  /** Split CP-1991 into per-article chunks (default: true) */
  splitArticles?: boolean;
}

export function loadMvpCorpus(options: MvpLoadOptions = {}): ConstitutionDocument[] {
  const { includeReformActs = false, splitArticles = true } = options;
  const documents: ConstitutionDocument[] = [];

  const cpPath = path.join(CO_DIR, CP_1991);
  if (!fs.existsSync(cpPath)) {
    throw new Error(`MVP file not found: ${cpPath}`);
  }

  const raw = fs.readFileSync(cpPath, "utf-8");
  const { data } = matter(raw);

  const baseMeta = {
    fileName: CP_1991,
    path: cpPath,
    identifier: data.identifier as string | undefined,
    title: data.title as string | undefined,
    rank: data.rank as string | undefined,
    status: data.status as string | undefined,
  };

  if (splitArticles) {
    const articles = splitConstitutionByArticle(raw, baseMeta);
    if (articles.length > 0) {
      documents.push(...articles);
    } else {
      console.warn("  ⚠ No articles parsed — falling back to full document.");
      documents.push({ content: raw, metadata: { ...baseMeta, chunkType: "full_text" } });
    }
  } else {
    documents.push({ content: raw, metadata: { ...baseMeta, chunkType: "full_text" } });
  }

  if (includeReformActs) {
    const actos = fs
      .readdirSync(CO_DIR)
      .filter((f) => f.startsWith("ACTO-LEGISLATIVO") && f.endsWith(".md"));

    for (const fileName of actos) {
      const year = Number(fileName.match(/-(\d{4})\.md$/)?.[1] ?? 0);
      if (year < 1991) continue;

      const fullPath = path.join(CO_DIR, fileName);
      const { data: actData, content } = matter(fs.readFileSync(fullPath, "utf-8"));
      if (actData.status !== "in_force") continue;

      documents.push({
        content,
        metadata: {
          fileName,
          path: fullPath,
          identifier: actData.identifier as string | undefined,
          title: actData.title as string | undefined,
          rank: actData.rank as string | undefined,
          status: actData.status as string | undefined,
          chunkType: "full_text",
        },
      });
    }
  }

  return documents;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function runLoad() {
  logSection("CARTA — Loading MVP constitutional corpus");
  const start = Date.now();

  const docs = loadMvpCorpus({ includeReformActs: false, splitArticles: true });

  const articles = docs.filter((d) => d.metadata.chunkType === "article");
  const sample = articles[112] ?? docs[0]; // Art. 113 area — Congress / dissolution

  logTable([
    ["Documents loaded", docs.length],
    ["Article chunks", articles.length],
    ["Load time", `${((Date.now() - start) / 1000).toFixed(2)}s`],
    ["Source", CP_1991],
  ]);

  console.log("\n  Sample chunk (useful for dissolution-of-Congress queries):");
  if (sample) {
    console.log(`    Article: ${sample.metadata.articleNumber ?? "—"}`);
    console.log(`    Preview: ${sample.content.slice(0, 280).replace(/\n/g, " ")}…`);
  }

  console.log("\n  ✓ MVP corpus ready for RAG ingestion (embeddings not run yet).\n");
}

function isDirectRun(): boolean {
  const script = process.argv[1]?.replace(/\\/g, "/") ?? "";
  return script.includes("loadConstitucion");
}

if (isDirectRun()) {
  if (mode === "load") {
    runLoad();
  } else {
    analyzeCorpus({ deepFrontmatter: true });
  }
}
