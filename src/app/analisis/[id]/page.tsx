import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, RotateCcw } from "lucide-react";
import { CartaLogo } from "@/components/layout/CartaLogo";
import { AnalysisDisplay } from "@/components/analysis/AnalysisDisplay";
import { getAnalysisById } from "@/lib/ai/analyzeClaim";
import { WHATSAPP_URL } from "@/lib/constants";

interface AnalisisPageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalisisPage({ params }: AnalisisPageProps) {
  const { id } = await params;
  const result = await getAnalysisById(id);

  if (!result) notFound();

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
            <Link
              href="/verificar"
              className="inline-flex items-center gap-2 border border-white/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
            >
              <RotateCcw className="h-3 w-3" />
              Verificar otra
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 pb-16 sm:px-6 sm:py-10">
        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
          Análisis compartido
        </p>

        <AnalysisDisplay result={result} />

        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            ¿Quieres verificar otra cosa? Carta está aquí.
          </p>
          <Link
            href="/verificar"
            className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-foreground px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-paper transition-colors hover:bg-foreground/90"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Verifica algo tú mismo
          </Link>
        </div>
      </main>
    </div>
  );
}
