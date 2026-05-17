/**
 * Normalize a constitutional article (or any legal text) coming from the
 * RAG store, which contains markdown artifacts like `##### **Artículo X.**`,
 * stray `**bold**` markers, and irregular whitespace.
 *
 * Returns clean paragraphs suitable for editorial rendering.
 */
export function cleanLegalText(raw: string): string {
  if (!raw) return "";

  return raw
    // Drop markdown heading hashes at line starts (###, #####, etc.)
    .replace(/^#{1,6}\s+/gm, "")
    // Strip bold/italic asterisks and underscores around words
    .replace(/\*{1,3}([^*\n]+?)\*{1,3}/g, "$1")
    .replace(/_{1,3}([^_\n]+?)_{1,3}/g, "$1")
    // Stray standalone asterisks
    .replace(/\*/g, "")
    // Collapse 3+ blank lines into a single paragraph break
    .replace(/\n{3,}/g, "\n\n")
    // Trim spaces on each line without losing paragraph structure
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

/**
 * Drop the leading "Artículo N." header line from a cleaned article body so
 * the expanded panel doesn't repeat what the card header already shows.
 */
export function stripArticleHeading(cleaned: string): string {
  return cleaned
    .replace(/^Artículo\s+(?:transitorio\s+)?[\wº°]+\.?\s*/i, "")
    .trim();
}
