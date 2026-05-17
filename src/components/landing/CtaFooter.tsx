import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { CartaLogo } from "@/components/layout/CartaLogo";
import { WHATSAPP_URL } from "@/lib/constants";

const FOOTER_LINKS = [
  { label: "Verificar", href: "/verificar" },
  { label: "Como funciona", href: "#" },
  { label: "Contacto", href: "#" },
];

export function CtaFooter() {
  return (
    <section className="relative overflow-hidden bg-primary px-4 py-20 text-white sm:px-6 lg:py-28">
      <div
        className="pointer-events-none absolute -right-12 top-8 select-none font-serif text-[10rem] font-bold leading-none text-white/[0.03] sm:text-[14rem]"
        aria-hidden="true"
      >
        2026
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Es tu turno
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
            Deja de compartir sin saber.{" "}
            <span className="italic text-white/50">Verifica primero.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 lg:text-lg">
            La proxima vez que te llegue algo sospechoso, no lo reenvies.
            Mandanoslo a nosotros. Te decimos si tiene sustento constitucional o no.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/verificar"
              className="group inline-flex items-center justify-center gap-2 bg-white px-6 py-4 text-sm font-bold uppercase tracking-widest text-primary transition-all hover:-translate-y-0.5"
            >
              Verificar en la web
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 border-2 border-white px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              Escribenos al WhatsApp
            </a>
          </div>
        </div>

        <footer className="mt-20 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <CartaLogo variant="light" />

            <nav className="flex flex-wrap gap-x-8 gap-y-2">
              {FOOTER_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-xs font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <p className="text-xs text-white/30">2026 Carta. Hecho en Colombia.</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
