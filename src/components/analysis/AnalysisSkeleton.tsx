function Bar({ className = "" }: { className?: string }) {
  return <div className={`h-3 bg-secondary ${className}`} />;
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-live="polite">
      <div className="border-t-4 border-border bg-card p-6">
        <Bar className="w-44" />
        <div className="mt-5 h-8 w-32 bg-secondary" />
        <div className="mt-4 space-y-2">
          <Bar className="w-full" />
          <Bar className="w-3/4" />
        </div>
      </div>

      <div className="border-t-4 border-gold bg-card p-6">
        <Bar className="w-52" />
        <div className="mt-5 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-l-4 border-gold bg-background p-5">
              <Bar className="w-24 bg-gold/20" />
              <Bar className="mt-3 w-40" />
              <Bar className="mt-4 w-full" />
              <Bar className="mt-2 w-5/6" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t-4 border-primary bg-card p-6">
        <Bar className="w-32" />
        <div className="mt-5 space-y-2">
          <Bar className="w-full" />
          <Bar className="w-full" />
          <Bar className="w-2/3" />
        </div>
      </div>
    </div>
  );
}
