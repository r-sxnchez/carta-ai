const STEPS = [
  {
    number: "01",
    title: "Pégalo",
    description: "Copia el mensaje, el tweet, la noticia. Lo que sea que quieras verificar.",
  },
  {
    number: "02",
    title: "Carta lo analiza",
    description: "Buscamos en la Constitución los artículos relevantes. Automáticamente. En segundos.",
  },
  {
    number: "03",
    title: "Tú decides",
    description: "Te mostramos la evidencia con las fuentes. Sin opiniones. Tú sacas tus conclusiones.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-ink px-4 py-20 text-paper sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Así de fácil
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
            Tres pasos.{" "}
            <span className="italic text-primary">Treinta segundos.</span>
          </h2>
        </div>

        <ol className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.number} className="relative">
              {i < STEPS.length - 1 && (
                <div
                  className="absolute right-0 top-6 hidden h-px w-full translate-x-1/2 bg-paper/10 lg:block"
                  aria-hidden="true"
                />
              )}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center bg-primary text-sm font-bold text-white">
                {step.number}
              </div>
              <h3 className="text-xl font-bold lg:text-2xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/60">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
