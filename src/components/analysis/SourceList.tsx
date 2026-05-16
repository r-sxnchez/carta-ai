import { EvidenceCard } from "./EvidenceCard";
import type { ConstitutionalSource } from "@/types/analysis";

export function SourceList({ sources }: { sources: ConstitutionalSource[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Evidencia constitucional</h3>
        <span className="text-xs text-muted-foreground">
          {sources.length} fragmento{sources.length !== 1 ? "s" : ""} recuperado
          {sources.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {sources.map((source, i) => (
          <EvidenceCard key={source.documentId} source={source} index={i} />
        ))}
      </div>
    </div>
  );
}
