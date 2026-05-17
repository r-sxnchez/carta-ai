import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      {/* Ghost year — the Constitution's birth */}
      <div
        className="pointer-events-none absolute -right-12 top-12 select-none font-serif text-[14rem] font-bold leading-none text-white/[0.03] sm:text-[20rem] lg:text-[28rem]"
        aria-hidden="true"
      >
        1991
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:pt-40">
        <span className="inline-block border border-white/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
          Verificación Constitucional
        </span>

        <div className="mt-6 max-w-4xl">
          <h1 className="font-serif text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Te están mintiendo.
          </h1>
          <h1 className="mt-2 font-serif text-4xl font-bold leading-[1.08] tracking-tight text-white/50 sm:text-5xl md:text-6xl lg:text-7xl">
            Y tú puedes
          </h1>
          <h1 className="font-serif text-4xl font-bold italic leading-[1.08] tracking-tight text-gold sm:text-5xl md:text-6xl lg:text-7xl">
            comprobarlo.
          </h1>
        </div>

        <p className="mt-8 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
          Ese mensaje de WhatsApp que te reenviaron, ese tweet del político, esa noticia que suena rara…{" "}
          <strong className="text-white">Verifícalo con la Constitución en 30 segundos.</strong>
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 bg-white px-6 py-4 text-sm font-bold uppercase tracking-widest text-primary transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <MessageCircle className="h-4 w-4" />
            Verificar por WhatsApp
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          <Link
            href="/verificar"
            className="group inline-flex items-center justify-center gap-2 border-2 border-white px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-primary"
          >
            Verificar en la web
          </Link>
        </div>

        <p className="mt-4 max-w-md text-xs text-white/50">
          Te abrimos WhatsApp con un mensaje listo para enviar. Sin formularios. Sin registros.
        </p>

        <div className="mt-16 flex flex-wrap items-center gap-8 border-t border-white/10 pt-8">
          <div>
            <div className="font-serif text-3xl font-bold">391</div>
            <div className="text-xs uppercase tracking-widest text-white/50">Artículos en el corpus</div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div>
            <div className="font-serif text-3xl font-bold">1991</div>
            <div className="text-xs uppercase tracking-widest text-white/50">Constitución vigente</div>
          </div>
          <div className="hidden h-10 w-px bg-white/10 sm:block" />
          <div className="hidden sm:block">
            <div className="font-serif text-3xl font-bold">~30s</div>
            <div className="text-xs uppercase tracking-widest text-white/50">Por análisis</div>
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 1440 120"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 w-full"
        aria-hidden="true"
      >
        <path d="M0 120L1440 120L1440 0C1200 80 720 100 0 40L0 120Z" fill="var(--paper)" />
      </svg>
    </section>
  );
}
