"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { MAX_CLAIM_LENGTH } from "@/lib/constants";

const EXAMPLES = [
  "El gobierno puede cambiar la Constitución sin aprobación del Congreso.",
  "El presidente puede disolver el Congreso por decreto.",
  "Los alcaldes pueden ignorar sentencias de la Corte.",
];

interface ClaimInputProps {
  onSubmit: (claim: string) => void;
  isLoading: boolean;
  initialValue?: string;
  hint?: string;
}

export function ClaimInput({ onSubmit, isLoading, initialValue, hint }: ClaimInputProps) {
  const [claim, setClaim] = useState(initialValue ?? "");
  const trimmed = claim.trim();
  const canSubmit = trimmed.length > 0 && !isLoading;

  const submit = () => {
    if (canSubmit) onSubmit(trimmed);
  };

  return (
    <div className="border-t-4 border-primary bg-card p-5 sm:p-8">
      <label htmlFor="claim-input" className="block font-serif text-xl font-bold text-foreground">
        Pega una afirmación política
      </label>
      <p className="mt-2 text-sm text-muted-foreground">
        Mensaje de WhatsApp, tweet, propuesta de gobierno o cualquier texto que quieras verificar.
      </p>
      {hint && (
        <p className="mt-3 border-l-2 border-primary bg-primary/5 px-3 py-2 text-xs text-foreground">
          {hint}
        </p>
      )}

      <textarea
        id="claim-input"
        value={claim}
        onChange={(e) => setClaim(e.target.value.slice(0, MAX_CLAIM_LENGTH))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder='Ej: "El presidente puede cerrar el Congreso por decreto."'
        rows={4}
        disabled={isLoading}
        className="mt-5 w-full resize-none border-2 border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none disabled:opacity-50"
      />

      {!claim && (
        <div className="mt-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Prueba con
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setClaim(example)}
                className="border-2 border-border px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5"
              >
                {example.length > 35 ? `${example.slice(0, 35)}…` : example}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {claim ? (
            <span>{claim.length} / {MAX_CLAIM_LENGTH}</span>
          ) : (
            <>
              <kbd className="border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px]">
                Ctrl
              </kbd>{" "}+{" "}
              <kbd className="border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 border-2 border-primary bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Verificar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
