"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { ACCEPTED_IMAGE_MIME, MAX_IMAGE_BYTES } from "@/lib/constants";
import type { ExtractedClaim } from "@/lib/multimodal";

interface ImageUploadProps {
  onExtracted: (result: ExtractedClaim) => void;
  disabled?: boolean;
}

type UploadState =
  | { phase: "idle" }
  | { phase: "preview"; file: File; previewUrl: string }
  | { phase: "extracting"; file: File; previewUrl: string }
  | { phase: "error"; message: string };

const ACCEPT_ATTR = ACCEPTED_IMAGE_MIME.join(",");
const HUMAN_MAX = `${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB`;

export function ImageUpload({ onExtracted, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ phase: "idle" });
  const [isDragging, setIsDragging] = useState(false);

  const reset = useCallback(() => {
    if (state.phase === "preview" || state.phase === "extracting") {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ phase: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }, [state]);

  const validate = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_MIME.includes(file.type)) {
      return "Formato no soportado. Usa PNG, JPEG, WEBP o HEIC.";
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return `La imagen supera el máximo de ${HUMAN_MAX}.`;
    }
    return null;
  };

  const runExtraction = useCallback(
    async (file: File, previewUrl: string) => {
      setState({ phase: "extracting", file, previewUrl });
      try {
        const form = new FormData();
        form.append("image", file);
        const res = await fetch("/api/extract", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "No pudimos analizar la imagen.");
        }
        onExtracted(data as ExtractedClaim);
        URL.revokeObjectURL(previewUrl);
        setState({ phase: "idle" });
        if (inputRef.current) inputRef.current.value = "";
      } catch (err) {
        URL.revokeObjectURL(previewUrl);
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Error inesperado.",
        });
      }
    },
    [onExtracted]
  );

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setState({ phase: "error", message: err });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      // Skip preview pause; go straight to extracting. Preview shows during the call.
      void runExtraction(file, previewUrl);
    },
    [runExtraction]
  );

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const isBusy = state.phase === "extracting";
  const isDisabled = disabled || isBusy;

  return (
    <div className="border-2 border-dashed border-border bg-card">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={onPick}
        disabled={isDisabled}
      />

      {(state.phase === "idle" || state.phase === "error") && (
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isDisabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`flex w-full flex-col items-center justify-center gap-2 px-4 py-8 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isDragging ? "bg-primary/5" : "hover:bg-secondary"
          }`}
        >
          <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden />
          <p className="text-sm font-bold text-foreground">
            Sube una captura de pantalla
          </p>
          <p className="text-xs text-muted-foreground">
            Arrastra una imagen aquí o haz clic. PNG, JPEG, WEBP. Máx {HUMAN_MAX}.
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Extraemos el texto y la afirmación política
          </p>
        </button>
      )}

      {(state.phase === "preview" || state.phase === "extracting") && (
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
          <div className="relative h-32 w-full shrink-0 overflow-hidden border border-border bg-secondary sm:h-28 sm:w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.previewUrl}
              alt="Vista previa"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              Leyendo la imagen…
            </p>
            <p className="truncate text-sm text-foreground">{state.file.name}</p>
            <p className="text-xs text-muted-foreground">
              Identificando texto y afirmación política.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-1 self-start text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {state.phase === "error" && (
        <div className="border-t-2 border-destructive bg-destructive/5 px-4 py-3">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-destructive">
            <ImageIcon className="h-3 w-3" />
            No se pudo leer la imagen
          </p>
          <p className="mt-1 text-sm text-foreground">{state.message}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
          >
            <X className="h-3 w-3" />
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
