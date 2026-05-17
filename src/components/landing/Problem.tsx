const PAIN_POINTS = [
  {
    num: "01",
    title: "No tienes tiempo",
    text: "Tienes trabajo, familia, vida. No puedes pasarte horas investigando cada afirmación que te llega.",
    border: "border-primary",
    label: "text-primary",
  },
  {
    num: "02",
    title: "No sabes en quién confiar",
    text: "Los medios tienen agenda. Los políticos mienten. Las redes amplifican lo falso. ¿A quién le crees?",
    border: "border-destructive",
    label: "text-destructive",
  },
  {
    num: "03",
    title: "Te sientes manipulado",
    text: "Y lo peor: sabes que probablemente ya compartiste algo falso sin darte cuenta. Como todos.",
    border: "border-gold",
    label: "text-gold",
  },
];

export function Problem() {
  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-destructive">
            El problema real
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Estás cansado de no saber{" "}
            <span className="italic text-primary">qué es verdad.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground lg:text-lg">
            Cada día te llegan mensajes, tweets, noticias. Todos dicen cosas diferentes.
            Todos dicen tener la razón. Y tú no tienes tiempo de leer 391 artículos de la Constitución para verificar.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {PAIN_POINTS.map(({ num, title, text, border, label }) => (
            <article key={num} className={`border-l-4 bg-card p-6 lg:p-8 ${border}`}>
              <span className={`text-xs font-bold uppercase tracking-widest ${label}`}>{num}</span>
              <h3 className="mt-3 font-serif text-xl font-bold text-foreground lg:text-2xl">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            La solución
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </section>
  );
}
