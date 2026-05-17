"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { CartaLogo } from "@/components/layout/CartaLogo";
import { ClaimInput } from "@/components/shared/ClaimInput";
import { AnalysisDisplay } from "@/components/analysis/AnalysisDisplay";
import { AnalysisSkeleton } from "@/components/analysis/AnalysisSkeleton";
import { WHATSAPP_URL } from "@/lib/constants";
import type { AnalysisResult } from "@/types/analysis";

const WHATSAPP_GREEN = "#25D366";

export default function VerificarPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (claim: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setHasSubmitted(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "El análisis falló.");
      setResult(data as AnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setHasSubmitted(false);
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-primary">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4 text-white/60" />
            <CartaLogo variant="light" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-colors hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            {hasSubmitted && (
              <button
                type="button"
                onClick={handleReset}
                className="border border-white/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
              >
                Nueva
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 pb-20 sm:px-6 sm:py-10">
        {!hasSubmitted && (
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Verificación constitucional
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              ¿Qué te dijeron ahora?
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Pega el mensaje, tweet o noticia que quieras verificar.
              Te mostramos si tiene sustento en la Constitución.
            </p>
          </div>
        )}

        {!hasSubmitted && (
          <div
            className="mb-8 flex items-center gap-4 border-l-4 bg-card p-4"
            style={{ borderLeftColor: WHATSAPP_GREEN }}
          >
            <MessageCircle className="h-5 w-5 shrink-0" style={{ color: WHATSAPP_GREEN }} />
            <p className="text-sm text-muted-foreground">
              También puedes{" "}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-foreground underline"
              >
                escribirnos al WhatsApp
              </a>{" "}
              y verificamos por ti.
            </p>
          </div>
        )}

        {!result && !isLoading && (
          <ClaimInput onSubmit={handleSubmit} isLoading={isLoading} />
        )}

        {isLoading && (
          <div className="mt-2">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Buscando evidencia constitucional...
            </p>
            <AnalysisSkeleton />
          </div>
        )}

        {error && !isLoading && (
          <div className="mt-4 border-l-4 border-destructive bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-destructive">
              Error
            </p>
            <p className="mt-2 text-sm text-foreground">{error}</p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-3 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {result && !isLoading && (
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-success">
              Análisis completado
            </p>
            <AnalysisDisplay result={result} />

            <div className="mt-8 border-t-4 border-border bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Este análisis se basa en el texto constitucional y en los marcos institucionales vigentes. Todas las fuentes son inspeccionables.{" "}
                <span className="font-bold text-foreground">
                  Carta no reemplaza la asesoría legal.
                </span>
              </p>
            </div>
          </div>
        )}

        <footer className="mt-12 border-t border-border pt-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Fuentes: Constitución Política de Colombia 1991 · Corte Constitucional
          </p>
        </footer>
      </main>
    </div>
  );
}
