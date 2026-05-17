import {
  Scale,
  Landmark,
  Brain,
  AlertTriangle,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import type {
  AnalysisResult,
  ConfidenceLevel,
  PlausibilityVerdict,
} from "@/types/analysis";

const VERDICT_CONFIG: Record<
  PlausibilityVerdict,
  { label: string; bg: string; fg: string; bar: string }
> = {
  plausible: { label: "Plausible", bg: "bg-success", fg: "text-white", bar: "border-success" },
  implausible: { label: "Implausible", bg: "bg-destructive", fg: "text-white", bar: "border-destructive" },
  uncertain: { label: "Incierto", bg: "bg-muted", fg: "text-foreground", bar: "border-muted-foreground" },
  context_dependent: {
    label: "Depende del contexto",
    bg: "bg-gold",
    fg: "text-ink",
    bar: "border-gold",
  },
};

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string; segments: number; tone: string }> = {
  high: { label: "Alta", segments: 3, tone: "bg-success" },
  medium: { label: "Media", segments: 2, tone: "bg-gold" },
  low: { label: "Baja", segments: 1, tone: "bg-destructive" },
};

function VerdictHeader({
  verdict,
  confidence,
  claim,
}: {
  verdict: PlausibilityVerdict;
  confidence: ConfidenceLevel;
  claim: string;
}) {
  const v = VERDICT_CONFIG[verdict];
  const c = CONFIDENCE_CONFIG[confidence];

  return (
    <div className={`border-t-4 ${v.bar} bg-card p-6`}>
      <div className="flex flex-wrap items-center gap-2">
        <Scale className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Plausibilidad constitucional
        </h3>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-widest ${v.bg} ${v.fg}`}>
          {v.label}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Confianza
          </span>
          <div className="flex gap-1" aria-label={`Confianza ${c.label}`}>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-2 w-6 ${i <= c.segments ? c.tone : "bg-secondary"}`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-foreground">{c.label}</span>
        </div>
      </div>

      <blockquote className="mt-5 border-l-2 border-border pl-4 font-serif text-base italic leading-relaxed text-muted-foreground">
        &ldquo;{claim}&rdquo;
      </blockquote>
    </div>
  );
}

function EvidenceSection({ sources }: { sources: AnalysisResult["sources"] }) {
  if (sources.length === 0) return null;

  return (
    <section className="border-t-4 border-gold bg-card p-6">
      <header className="flex flex-wrap items-center gap-2">
        <Landmark className="h-4 w-4 text-gold" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Evidencia constitucional
        </h3>
        <span className="ml-1 bg-gold px-2 py-0.5 font-mono text-xs font-bold text-ink">
          {sources.length}
        </span>
      </header>

      <ul className="mt-5 space-y-4">
        {sources.map((src, i) => (
          <li
            key={`${src.documentId}-${i}`}
            className="border-l-4 border-gold bg-background p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-gold">
                  {src.articleNumber ? `Artículo ${src.articleNumber}` : `Fragmento #${i + 1}`}
                </span>
              </div>
              <span className="font-mono text-xs text-success">
                {Math.round(src.similarity * 100)}% match
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{src.content}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArticlesCited({ articles }: { articles: string[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="border-t-4 border-border bg-card p-6">
      <header className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Artículos citados
        </h3>
      </header>
      <div className="mt-4 flex flex-wrap gap-2">
        {articles.map((article) => (
          <span
            key={article}
            className="border border-border bg-background px-3 py-1 font-mono text-xs text-foreground"
          >
            {article}
          </span>
        ))}
      </div>
    </section>
  );
}

function Reasoning({ reasoning }: { reasoning: string }) {
  return (
    <section className="border-t-4 border-primary bg-card p-6">
      <header className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Cadena de razonamiento
        </h3>
      </header>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {reasoning}
      </p>
    </section>
  );
}

function InstitutionalConstraints({ constraints }: { constraints: string[] }) {
  if (constraints.length === 0) return null;
  return (
    <section className="border-t-4 border-success bg-card p-6">
      <header className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-success" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Restricciones institucionales
        </h3>
      </header>
      <ul className="mt-4 space-y-3">
        {constraints.map((c, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-success" />
            <span className="leading-relaxed">{c}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ManipulationSignals({ signals }: { signals: string[] }) {
  if (signals.length === 0) return null;
  return (
    <section className="border-t-4 border-destructive bg-card p-6">
      <header className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Señales de manipulación
        </h3>
      </header>
      <ul className="mt-4 space-y-3">
        {signals.map((s, i) => (
          <li
            key={i}
            className="flex items-start gap-3 border-l-4 border-destructive bg-background p-4"
          >
            <span className="shrink-0 bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
              Señal
            </span>
            <p className="text-sm leading-relaxed text-foreground">{s}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AnalysisDisplay({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-5">
      <VerdictHeader
        verdict={result.constitutionalPlausibility}
        confidence={result.confidence}
        claim={result.claim}
      />
      {/* Evidence dominates visually — placed above reasoning */}
      <EvidenceSection sources={result.sources} />
      <ArticlesCited articles={result.constitutionalArticles} />
      <Reasoning reasoning={result.reasoning} />
      <InstitutionalConstraints constraints={result.institutionalConstraints} />
      <ManipulationSignals signals={result.manipulationSignals} />
    </div>
  );
}
