"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, RotateCcw } from "lucide-react";
import { CartaLogo } from "@/components/layout/CartaLogo";
import { ClaimInput } from "@/components/shared/ClaimInput";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { AnalysisDisplay } from "@/components/analysis/AnalysisDisplay";
import { AnalysisSkeleton } from "@/components/analysis/AnalysisSkeleton";
import { WHATSAPP_URL } from "@/lib/constants";
import type { AnalysisResult } from "@/types/analysis";
import type { ExtractedClaim } from "@/lib/multimodal";

const WHATSAPP_GREEN = "#25D366";

const LOADING_MESSAGES = [
  "Leyendo tu afirmación…",
  "Buscando en la Constitución…",
  "Encontrando los artículos relevantes…",
  "Analizando la lógica institucional…",
  "Compilando el razonamiento…",
];

function LoadingProgress() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
      {LOADING_MESSAGES[index]}
    </p>
  );
}

export default function VerificarPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [seededClaim, setSeededClaim] = useState<string>("");
  const [extractionHint, setExtractionHint] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [seedCounter, setSeedCounter] = useState(0);

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

  const handleExtracted = (extracted: ExtractedClaim) => {
    setExtractionError(null);

    if (extracted.noClaimFound || !extracted.claim) {
      setExtractionError(
        "No detectamos una afirmación política verificable en la imagen. Puedes pegar el texto a mano."
      );
      return;
    }

    setSeededClaim(extracted.claim);
    setSeedCounter((n) => n + 1);

    const ctx = extracted.context ? `Origen detectado: ${extracted.context}. ` : "";
    setExtractionHint(
      `${ctx}Revísala antes de verificarla. Edítala si hace falta.`
    );
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setHasSubmitted(false);
    setIsLoading(false);
    setSeededClaim("");
    setExtractionHint(null);
    setExtractionError(null);
    setSeedCounter((n) => n + 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-primary">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
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
                className="inline-flex items-center gap-2 border border-white/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
              >
                <RotateCcw className="h-3 w-3" />
                Nueva
              </button>
            )}
          </div>
        </div>
      </header>

      <main
        className={`mx-auto w-full flex-1 px-4 sm:px-6 ${
          result && !isLoading
            ? "max-w-[1400px] py-8 pb-16 sm:py-10"
            : "max-w-3xl py-8 pb-20 sm:py-10"
        }`}
      >
        {!hasSubmitted && (
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Verificación constitucional
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              ¿Qué te dijeron ahora?
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Pégalo. Súbelo. Reenvíalo. Te decimos si tiene sustento en la Constitución — con la evidencia en la mano para que lo compruebes tú mismo.
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
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Captura o imagen reenviada
              </p>
              <ImageUpload onExtracted={handleExtracted} disabled={isLoading} />
              {extractionError && (
                <p className="mt-2 text-xs text-destructive">{extractionError}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                o
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <ClaimInput
              key={seedCounter}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              initialValue={seededClaim}
              hint={extractionHint ?? undefined}
            />
          </div>
        )}

        {isLoading && (
          <div className="mt-2">
            <LoadingProgress />
            <AnalysisSkeleton />
          </div>
        )}

        {error && !isLoading && (
          <div className="mt-4 border-l-4 border-destructive bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-destructive">
              Algo se rompió
            </p>
            <p className="mt-2 text-sm text-foreground">{error}</p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-3 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
            >
              Inténtalo de nuevo
            </button>
          </div>
        )}

        {result && !isLoading && (
          <div>
            <AnalysisDisplay result={result} />

            <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                ¿Te llegó otra cosa rara? Verifícala también.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-foreground px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-paper transition-colors hover:bg-foreground/90"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Verificar otra afirmación
              </button>
            </div>
          </div>
        )}

        {!result && (
          <footer
            className={`${hasSubmitted ? "mt-10" : "mt-12"} border-t border-border/60 pt-4`}
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Fuentes: Constitución Política de Colombia 1991 · Corte Constitucional
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}
