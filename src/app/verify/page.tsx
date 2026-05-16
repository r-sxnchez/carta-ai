"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisCard } from "@/components/analysis/AnalysisCard";
import type { AnalysisResult } from "@/types/analysis";

const EXAMPLE_CLAIMS = [
  "El presidente puede disolver el Congreso mediante decreto.",
  "El gobierno puede aumentar los impuestos sin aprobación del Congreso.",
  "Los colombianos tienen derecho constitucional a la salud gratuita.",
];

function ResultSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-1 bg-zinc-200 animate-pulse" />
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    const trimmed = claim.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Error al analizar");
      }

      setResult(data as AnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  function handleExample(example: string) {
    setClaim(example);
    setResult(null);
    setError(null);
  }

  const canSubmit = claim.trim().length > 0 && !loading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            <span className="text-sm">Carta</span>
          </Link>
          <span className="text-sm font-medium text-foreground">Verificar afirmación</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Input section */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-foreground">Análisis constitucional</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa una afirmación política, propuesta de ley o mensaje viral para analizar
              su plausibilidad constitucional.
            </p>
          </div>

          <Textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
            }}
            placeholder="Ej: El presidente puede disolver el Congreso mediante decreto."
            className="min-h-[120px] resize-none text-sm leading-relaxed"
            disabled={loading}
          />

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              {claim.length > 0 ? `${claim.length} / 2000 caracteres` : "Ctrl+Enter para analizar"}
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={!canSubmit}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analizando…
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  Analizar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Example claims */}
        {!result && !loading && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Ejemplos
            </p>
            <div className="space-y-2">
              {EXAMPLE_CLAIMS.map((example) => (
                <button
                  key={example}
                  onClick={() => handleExample(example)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  &ldquo;{example}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && <ResultSkeleton />}

        {/* Result */}
        {result && !loading && <AnalysisCard result={result} />}
      </main>
    </div>
  );
}
