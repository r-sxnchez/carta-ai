/**
 * Build an outbound link for a cited constitutional article.
 *
 * We don't have título/capítulo metadata on hand, so direct URLs like
 * constitucioncolombia.com/titulo-5/capitulo-1/articulo-113 aren't possible.
 * Google site-search is a reliable fallback that lands users on the right
 * page on constitucioncolombia.com with a single click.
 */
export function getArticleUrl(articleNumber: string): string {
  const num = articleNumber.trim();
  const query = `site:constitucioncolombia.com "Artículo ${num}"`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Pull the bare article number ("113") out of strings like "Artículo 113"
 * or "Articulo 22A" so we can match cited articles against retrieved sources
 * regardless of formatting drift.
 */
export function parseArticleNumber(label: string): string | null {
  const match = label.match(/(?:art[ií]culo\s+)?((?:transitorio\s+)?[\wº°]+)/i);
  if (!match) return null;
  return match[1].replace(/\s+/g, " ").trim();
}
