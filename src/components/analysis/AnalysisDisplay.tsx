import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Info,
  Plus,
  ShieldCheck,
} from "lucide-react";
import type {
  AnalysisResult,
  ConfidenceLevel,
  ConstitutionalSource,
  PlausibilityVerdict,
} from "@/types/analysis";
import { cleanLegalText, stripArticleHeading } from "@/lib/utils/cleanLegalText";
import { getArticleUrl, parseArticleNumber } from "@/lib/utils/articleUrl";
import { ShareAnalysisButton } from "./ShareAnalysisButton";

const VERDICT_CONFIG: Record<
  PlausibilityVerdict,
  { label: string; sublabel: string; accent: string; pill: string; eyebrow: string }
> = {
  plausible: {
    label: "Plausible",
    sublabel: "Coherente con la Constitución",
    accent: "bg-success",
    pill: "bg-success text-white",
    eyebrow: "text-success",
  },
  implausible: {
    label: "Implausible",
    sublabel: "En tensión con la Constitución",
    accent: "bg-destructive",
    pill: "bg-destructive text-white",
    eyebrow: "text-destructive",
  },
  uncertain: {
    label: "Incierto",
    sublabel: "Evidencia constitucional insuficiente",
    accent: "bg-muted-foreground",
    pill: "bg-foreground text-paper",
    eyebrow: "text-muted-foreground",
  },
  context_dependent: {
    label: "Depende del contexto",
    sublabel: "Cambia según el caso específico",
    accent: "bg-gold",
    pill: "bg-gold text-ink",
    eyebrow: "text-gold",
  },
};

const CONFIDENCE_CONFIG: Record<
  ConfidenceLevel,
  { label: string; segments: number; tone: string }
> = {
  high: { label: "Alta", segments: 3, tone: "bg-success" },
  medium: { label: "Media", segments: 2, tone: "bg-gold" },
  low: { label: "Baja", segments: 1, tone: "bg-destructive" },
};

const LOW_QUALITY_THRESHOLD = 0.4;

function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground ${className}`}
    >
      {children}
    </p>
  );
}

function LegalTextParagraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  return (
    <div className="space-y-2.5 font-serif text-[14px] leading-[1.7] text-foreground/90">
      {paragraphs.map((p, i) => (
        <p key={i}>{p.trim()}</p>
      ))}
    </div>
  );
}

function SignalTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-foreground/15 bg-paper-dark/60 px-2.5 py-1 text-[11px] font-medium text-foreground/75">
      <AlertTriangle className="h-3 w-3 shrink-0 text-foreground/50" aria-hidden />
      {children}
    </span>
  );
}

function VerdictHero({
  verdict,
  confidence,
  claim,
  signals,
  analysisId,
}: {
  verdict: PlausibilityVerdict;
  confidence: ConfidenceLevel;
  claim: string;
  signals: string[];
  analysisId?: string;
}) {
  const v = VERDICT_CONFIG[verdict];
  const c = CONFIDENCE_CONFIG[confidence];

  return (
    <header className="relative pb-10">
      <div className={`absolute left-0 top-0 h-1 w-16 ${v.accent}`} aria-hidden />

      <div className="flex flex-wrap items-start justify-between gap-4 pt-8">
        <Eyebrow className={v.eyebrow}>Análisis constitucional</Eyebrow>
        <ShareAnalysisButton analysisId={analysisId} />
      </div>

      <h1 className="mt-4 max-w-4xl font-serif text-[28px] font-bold leading-[1.15] tracking-tight text-foreground sm:text-[34px] lg:text-[44px]">
        “{claim}”
      </h1>

      {signals.length > 0 && (
        <div className="mt-6">
          <Eyebrow className="mb-3">Cómo está formulada</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {signals.map((s, i) => (
              <SignalTag key={i}>{s}</SignalTag>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-border/60 pt-5">
        <div className="flex items-baseline gap-3">
          <Eyebrow>Veredicto</Eyebrow>
          <div className="flex flex-col">
            <span
              className={`inline-flex w-fit items-center px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${v.pill}`}
            >
              {v.label}
            </span>
            <span className="mt-1.5 text-[11px] italic text-muted-foreground">
              {v.sublabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Eyebrow>Confianza</Eyebrow>
          <div className="flex gap-1" aria-label={`Confianza ${c.label}`}>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-2 w-5 ${i <= c.segments ? c.tone : "bg-secondary"}`}
              />
            ))}
          </div>
          <span className="text-[12px] font-bold text-foreground">{c.label}</span>
        </div>
      </div>
    </header>
  );
}

function RetrievalQualityBanner({ quality }: { quality?: number }) {
  if (quality === undefined || quality >= LOW_QUALITY_THRESHOLD) return null;
  const pct = Math.round(quality * 100);
  return (
    <div className="mb-8 border-l-2 border-gold bg-gold/10 px-4 py-3">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground">
        <Info className="h-3.5 w-3.5 text-gold" />
        Evidencia constitucional limitada
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">
        La similitud media con los artículos recuperados es de {pct}%. El análisis se apoya en correspondencias indirectas — léelo con eso en mente y revisa las fuentes tú mismo.
      </p>
    </div>
  );
}

function Narrative({ reasoning }: { reasoning: string }) {
  const rawParagraphs = reasoning
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Fallback: if the model returned a single block, split on sentence boundaries
  // so the reader gets visual rhythm.
  const paragraphs =
    rawParagraphs.length > 1
      ? rawParagraphs
      : splitIntoChunks(reasoning, 2);

  return (
    <article>
      <Eyebrow>Razonamiento</Eyebrow>
      <div className="mt-5 space-y-5 font-serif text-[17px] leading-[1.85] text-foreground">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}

function splitIntoChunks(text: string, chunks: number): string[] {
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[\.\?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 1) return [text.trim()];
  const per = Math.ceil(sentences.length / chunks);
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += per) {
    out.push(sentences.slice(i, i + per).join(" "));
  }
  return out;
}

function findSourceForArticle(
  articleLabel: string,
  sources: ConstitutionalSource[]
): ConstitutionalSource | undefined {
  const target = parseArticleNumber(articleLabel);
  if (!target) return undefined;
  return sources.find(
    (s) => s.articleNumber && s.articleNumber.toLowerCase() === target.toLowerCase()
  );
}

function previewOf(text: string, max = 140): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max).trimEnd()}…`;
}

function ArticleCard({
  articleLabel,
  source,
}: {
  articleLabel: string;
  source?: ConstitutionalSource;
}) {
  const number = parseArticleNumber(articleLabel) ?? articleLabel;
  const headerNumber = source?.articleNumber ?? number;
  const cleaned = source ? stripArticleHeading(cleanLegalText(source.content)) : "";
  const preview = cleaned ? previewOf(cleaned) : "Texto no incluido en la evidencia recuperada.";
  const externalUrl = getArticleUrl(number);

  return (
    <details className="group bg-card transition-colors">
      <summary className="flex cursor-pointer list-none items-start gap-4 px-4 py-4 outline-none">
        <span className="shrink-0 font-mono text-[11px] font-bold tracking-widest text-gold">
          ART.
          <br />
          <span className="text-[22px] font-bold leading-none text-foreground">
            {headerNumber}
          </span>
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-serif text-[14px] leading-[1.55] text-foreground/85 group-open:text-foreground">
            {preview}
          </span>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground group-open:hidden">
            <Plus className="h-3 w-3" />
            Léelo tú mismo
          </span>
        </span>
      </summary>
      <div className="border-t border-border/60 px-4 pb-5 pt-4">
        {source ? (
          <LegalTextParagraphs text={cleaned} />
        ) : (
          <p className="font-serif text-[14px] italic leading-relaxed text-muted-foreground">
            El texto de este artículo no se incluyó en la evidencia recuperada. Puedes consultarlo en la fuente oficial.
          </p>
        )}
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
        >
          Fuente oficial
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </details>
  );
}

function Constraints({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <header className="flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
        <Eyebrow>Marco institucional</Eyebrow>
      </header>
      <ul className="mt-4 space-y-3">
        {items.map((c, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-[14px] leading-[1.65] text-foreground/85"
          >
            <span className="mt-2 h-1 w-3 shrink-0 bg-success" />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RawSources({ sources }: { sources: ConstitutionalSource[] }) {
  if (sources.length === 0) return null;
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-2 outline-none">
        <span className="flex items-center gap-2">
          <Eyebrow>Fragmentos recuperados</Eyebrow>
          <span className="font-mono text-[11px] text-muted-foreground">{sources.length}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Pasajes constitucionales usados como contexto, ordenados por similitud semántica con tu afirmación.
      </p>
      <ul className="mt-4 space-y-4">
        {sources.map((src, i) => {
          const cleaned = stripArticleHeading(cleanLegalText(src.content));
          const label = src.articleNumber
            ? `Artículo ${src.articleNumber}`
            : `Fragmento #${i + 1}`;
          return (
            <li key={`${src.documentId}-${i}`} className="border-l border-gold/60 pl-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                  {label}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {Math.round(src.similarity * 100)}%
                </span>
              </div>
              <div className="mt-2">
                <LegalTextParagraphs text={cleaned} />
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

function EvidenceExplorer({
  articles,
  sources,
  constraints,
}: {
  articles: string[];
  sources: ConstitutionalSource[];
  constraints: string[];
}) {
  return (
    <aside className="space-y-10">
      <header>
        <Eyebrow>Evidencia</Eyebrow>
        <p className="mt-2 font-serif text-[15px] leading-[1.55] text-muted-foreground">
          Fuentes constitucionales y restricciones institucionales. Léelas tú mismo — la evidencia habla por sí sola.
        </p>
      </header>

      {articles.length > 0 && (
        <section>
          <header className="flex items-baseline gap-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <Eyebrow>Artículos citados</Eyebrow>
            <span className="font-mono text-[11px] text-muted-foreground">{articles.length}</span>
          </header>
          <div className="mt-4 divide-y divide-border/60 border-y border-border/60">
            {articles.map((article) => (
              <ArticleCard
                key={article}
                articleLabel={article}
                source={findSourceForArticle(article, sources)}
              />
            ))}
          </div>
        </section>
      )}

      <Constraints items={constraints} />

      <RawSources sources={sources} />
    </aside>
  );
}

function AnalysisMetaFooter({ result }: { result: AnalysisResult }) {
  const meta = result.meta;
  const date = meta?.createdAt ? new Date(meta.createdAt) : undefined;
  const dateStr = date
    ? new Intl.DateTimeFormat("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    : undefined;
  const qualityStr =
    meta?.retrievalQuality !== undefined
      ? `${Math.round(meta.retrievalQuality * 100)}% similitud media`
      : undefined;

  const parts = [
    dateStr && `Analizado el ${dateStr}`,
    meta?.model && `modelo ${meta.model}`,
    `${result.sources.length} artículos consultados`,
    qualityStr,
  ].filter(Boolean);

  return (
    <footer className="mt-12 border-t border-border/60 pt-5">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {parts.join(" · ")}
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Esto no es asesoría legal. Es la Constitución hablando. Si algo no cuadra, revisa las fuentes tú mismo.
      </p>
    </footer>
  );
}

export function AnalysisDisplay({ result }: { result: AnalysisResult }) {
  return (
    <div>
      <VerdictHero
        verdict={result.constitutionalPlausibility}
        confidence={result.confidence}
        claim={result.claim}
        signals={result.manipulationSignals}
        analysisId={result.meta?.id}
      />

      <RetrievalQualityBanner quality={result.meta?.retrievalQuality} />

      <div className="lg:hidden mb-4 flex items-center justify-end">
        <a
          href="#evidencia"
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
        >
          Saltar a la evidencia ↓
        </a>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-7 lg:pr-4">
          <Narrative reasoning={result.reasoning} />
        </div>

        <div id="evidencia" className="lg:col-span-5">
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
            <EvidenceExplorer
              articles={result.constitutionalArticles}
              sources={result.sources}
              constraints={result.institutionalConstraints}
            />
          </div>
        </div>
      </div>

      <AnalysisMetaFooter result={result} />
    </div>
  );
}
