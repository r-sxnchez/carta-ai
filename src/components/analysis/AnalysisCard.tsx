import { Building2, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConstitutionalPlausibilityBadge, VerdictBarColor } from "./ConstitutionalPlausibilityBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ManipulationSignalsCard } from "./ManipulationSignalsCard";
import { SourceList } from "./SourceList";
import type { AnalysisResult } from "@/types/analysis";

export function AnalysisCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-4">
      {/* Verdict + Reasoning */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <VerdictBarColor verdict={result.constitutionalPlausibility} />
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <ConstitutionalPlausibilityBadge verdict={result.constitutionalPlausibility} />
            <ConfidenceBadge level={result.confidence} />
          </div>

          <blockquote className="border-l-2 border-border pl-4 text-sm text-muted-foreground italic leading-relaxed">
            &ldquo;{result.claim}&rdquo;
          </blockquote>

          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Análisis constitucional
            </p>
            <p className="text-sm text-foreground leading-relaxed">{result.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Institutional Constraints */}
      {result.institutionalConstraints.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground shrink-0" />
            <h3 className="text-sm font-medium text-foreground">
              Restricciones institucionales
            </h3>
          </div>
          <ul className="space-y-2">
            {result.institutionalConstraints.map((constraint, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-2 size-1 rounded-full bg-muted-foreground/50 shrink-0" />
                <span className="leading-relaxed">{constraint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Constitutional Articles */}
      {result.constitutionalArticles.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-muted-foreground shrink-0" />
            <h3 className="text-sm font-medium text-foreground">Artículos citados</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.constitutionalArticles.map((article) => (
              <Badge
                key={article}
                variant="outline"
                className="h-auto py-0.5 text-xs font-mono"
              >
                {article}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Manipulation Signals */}
      <ManipulationSignalsCard signals={result.manipulationSignals} />

      {/* Evidence Sources */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SourceList sources={result.sources} />
      </div>
    </div>
  );
}
