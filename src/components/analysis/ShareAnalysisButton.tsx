"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

interface ShareAnalysisButtonProps {
  analysisId?: string;
  variant?: "primary" | "ghost";
}

export function ShareAnalysisButton({ analysisId, variant = "ghost" }: ShareAnalysisButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!analysisId) return null;

  const onShare = async () => {
    const url = `${window.location.origin}/analisis/${analysisId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copia este enlace:", url);
    }
  };

  const base =
    "inline-flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors";
  const styles =
    variant === "primary"
      ? "bg-foreground text-paper hover:bg-foreground/90"
      : "border border-border text-foreground hover:bg-secondary";

  return (
    <button type="button" onClick={onShare} className={`${base} ${styles}`}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? "Enlace copiado" : "Compartir análisis"}
    </button>
  );
}
