import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, BookOpen, Scale, Eye, Shield, FileText } from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: FileText,
    title: "Envía la afirmación",
    description:
      "Escribe, pega o reenvía el mensaje político que deseas verificar. Texto, propuesta de ley, o mensaje viral.",
  },
  {
    step: "02",
    icon: Search,
    title: "Búsqueda constitucional",
    description:
      "Carta busca semánticamente en la Constitución Política de 1991 los artículos más relevantes para tu consulta.",
  },
  {
    step: "03",
    icon: Scale,
    title: "Análisis institucional",
    description:
      "Un modelo razona sobre la plausibilidad constitucional, identifica qué rama del poder es competente, y detecta señales de manipulación.",
  },
  {
    step: "04",
    icon: Eye,
    title: "Inspecta la evidencia",
    description:
      "Cada conclusión viene acompañada de los artículos constitucionales exactos. Verifica por tu cuenta.",
  },
];

const PRINCIPLES = [
  {
    icon: BookOpen,
    title: "La evidencia primero",
    description:
      "Ninguna conclusión aparece sin respaldo constitucional explícito. La fuente siempre es visible.",
  },
  {
    icon: Scale,
    title: "Institucionalmente neutral",
    description:
      "Carta analiza plausibilidad constitucional, no verdad política. No toma posiciones partidistas.",
  },
  {
    icon: Eye,
    title: "Razonamiento trazable",
    description:
      "Cada paso del análisis es visible. El ciudadano puede leer los artículos y juzgar por sí mismo.",
  },
  {
    icon: Shield,
    title: "Incertidumbre precisa",
    description:
      'Distinguimos entre "plausible", "implausible", "incierto" y "depende del contexto". Sin certeza falsa.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">Carta</span>
            <Badge
              variant="outline"
              className="h-auto py-0 text-xs text-muted-foreground"
            >
              Beta
            </Badge>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/verify">Verificar</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <Badge
            variant="outline"
            className="h-auto py-1 px-3 mb-6 text-xs text-muted-foreground"
          >
            Verificación constitucional · Colombia
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight max-w-2xl mx-auto mb-5">
            Trace political claims with constitutional evidence.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Reenvía mensajes políticos, screenshots o afirmaciones y recibe análisis
            constitucional fundamentado con evidencia transparente.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild className="gap-2 w-full sm:w-auto">
              <Link href="/verify">
                Verificar una afirmación
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-muted-foreground"
              disabled
            >
              WhatsApp — Próximamente
            </Button>
          </div>
        </section>

        {/* Problem framing */}
        <section className="border-y border-border bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                label: "El problema",
                text: "Las afirmaciones políticas virales se difunden más rápido de lo que cualquier verificador puede responder.",
              },
              {
                label: "La fuente de verdad",
                text: "La Constitución Política de Colombia de 1991 es el marco definitivo de las competencias institucionales.",
              },
              {
                label: "La solución",
                text: "Carta recupera evidencia constitucional relevante y analiza las afirmaciones en tiempo real.",
              },
            ].map(({ label, text }) => (
              <div key={label} className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Cómo funciona</h2>
            <p className="text-sm text-muted-foreground">
              Cuatro pasos desde la afirmación hasta la evidencia constitucional.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
              <div
                key={step}
                className="rounded-xl border border-border bg-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center size-9 rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/60">{step}</span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Demo preview */}
        <section className="border-y border-border bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
            <div className="text-center mb-10 space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">El análisis</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Cada resultado es estructurado, trazable, y fundamentado en texto constitucional real.
              </p>
            </div>

            <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="h-1 bg-red-500" />
              <div className="p-6 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center h-auto py-1 px-3 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                    Constitucionalmente implausible
                  </span>
                  <span className="inline-flex items-center h-5 px-2 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Alta confianza
                  </span>
                </div>

                <blockquote className="border-l-2 border-border pl-4 text-sm text-muted-foreground italic leading-relaxed">
                  &ldquo;El presidente puede disolver el Congreso mediante decreto.&rdquo;
                </blockquote>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Análisis constitucional
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    La Constitución no otorga al Presidente la facultad de disolver el
                    Congreso. Los artículos 139–141 establecen la continuidad del Congreso
                    incluso durante estados de excepción, donde mantiene plenas facultades
                    constitucionales.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["Artículo 139", "Artículo 213"].map((a) => (
                    <span
                      key={a}
                      className="text-xs font-mono px-2 py-1 rounded border border-border bg-muted text-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-xs text-amber-700 font-medium">
                    Señal detectada: Distorsión institucional
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Evidencia constitucional
                    </p>
                    <span className="text-xs text-muted-foreground">6 fragmentos</span>
                  </div>
                  <div className="rounded-xl border border-border p-3 flex items-start gap-3">
                    <div className="flex items-center justify-center size-7 rounded-lg bg-muted shrink-0">
                      <BookOpen className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        Artículo 213{" "}
                        <span className="ml-1 font-mono text-emerald-700">61%</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        ...el Congreso se reunirá por derecho propio, con la plenitud de sus
                        atribuciones constitucionales y legales...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Principios</h2>
            <p className="text-sm text-muted-foreground">
              Carta es infraestructura cívica, no árbitro de la verdad política.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRINCIPLES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-5 flex gap-4"
              >
                <div className="flex items-center justify-center size-9 rounded-lg bg-muted shrink-0">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              ¿Tienes una afirmación para verificar?
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Ingresa el texto y en segundos recibes análisis constitucional fundamentado.
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link href="/verify">
                Verificar ahora
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            Carta · Verificación constitucional para ciudadanos colombianos
          </span>
          <span className="text-xs text-muted-foreground">
            Constitución Política de Colombia, 1991
          </span>
        </div>
      </footer>
    </div>
  );
}
