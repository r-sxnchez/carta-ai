import { Scale, Eye, Landmark, ShieldOff, Link2 } from "lucide-react";

const PRINCIPLES = [
  {
    icon: Scale,
    title: "La evidencia primero",
    description: "Te mostramos los artículos de la Constitución antes de cualquier conclusión.",
  },
  {
    icon: Eye,
    title: "Todo es visible",
    description: "Puedes ver exactamente cómo llegamos a cada resultado. Sin cajas negras.",
  },
  {
    icon: Landmark,
    title: "Fuente oficial",
    description: "Usamos la Constitución de Colombia 1991. No opiniones, no interpretaciones.",
  },
  {
    icon: ShieldOff,
    title: "Sin agenda política",
    description: "No tomamos partido. La evidencia habla por sí sola.",
  },
  {
    icon: Link2,
    title: "Verificable",
    description: "Cada cita tiene su fuente. Puedes comprobar todo tú mismo.",
  },
];

export function Principles() {
  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Por qué confiar en Carta
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl">
            No te pedimos que{" "}
            <span className="italic text-primary">confíes ciegamente.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Carta está diseñada para que puedas verificar todo por ti mismo.
            Te damos las herramientas, tú decides.
          </p>
        </div>

        <ul className="lg:col-span-7">
          {PRINCIPLES.map(({ icon: Icon, title, description }, i) => (
            <li
              key={title}
              className="flex items-start gap-5 border-b border-border py-5 last:border-b-0"
            >
              <span className="w-6 shrink-0 font-mono text-xs font-bold text-gold tabular-nums">
                0{i + 1}
              </span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
