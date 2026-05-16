"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConstitutionalSource } from "@/types/analysis";

export function EvidenceCard({
  source,
  index,
}: {
  source: ConstitutionalSource;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const similarityPct = Math.round(source.similarity * 100);
  const label = source.articleNumber
    ? `Artículo ${source.articleNumber}`
    : `Fragmento ${index + 1}`;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="mt-0.5 flex items-center justify-center size-7 rounded-lg bg-muted shrink-0">
          <BookOpen className="size-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded font-mono",
                similarityPct >= 60
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-zinc-100 text-zinc-500"
              )}
            >
              {similarityPct}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {source.content}
          </p>
        </div>
        <div className="shrink-0 text-muted-foreground pt-0.5">
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line pt-3">
            {source.content}
          </p>
        </div>
      )}
    </div>
  );
}
