function Bar({ className = "" }: { className?: string }) {
  return <div className={`h-3 bg-secondary/80 ${className}`} />;
}

export function AnalysisSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      {/* Verdict hero placeholder */}
      <div className="relative pb-10">
        <div className="absolute left-0 top-0 h-1 w-16 bg-secondary" />
        <div className="pt-8">
          <Bar className="w-40 bg-secondary" />
          <div className="mt-5 space-y-3">
            <Bar className="h-6 w-11/12" />
            <Bar className="h-6 w-9/12" />
            <Bar className="h-6 w-7/12" />
          </div>
          <div className="mt-7 flex flex-wrap gap-x-10 gap-y-3 border-t border-border/60 pt-5">
            <Bar className="h-6 w-32" />
            <Bar className="h-6 w-40" />
          </div>
        </div>
      </div>

      {/* Two-column placeholder */}
      <div className="mt-2 grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-7 lg:pr-4">
          <Bar className="w-32" />
          <div className="mt-5 space-y-3">
            <Bar className="w-full" />
            <Bar className="w-full" />
            <Bar className="w-11/12" />
            <Bar className="w-9/12" />
            <Bar className="mt-6 w-full" />
            <Bar className="w-full" />
            <Bar className="w-10/12" />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="space-y-8">
            <Bar className="w-28" />
            <div className="divide-y divide-border/60 border-y border-border/60">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-4 px-4 py-4">
                  <div className="shrink-0 space-y-1">
                    <Bar className="h-2 w-8" />
                    <Bar className="h-6 w-10 bg-secondary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Bar className="w-full" />
                    <Bar className="w-10/12" />
                    <Bar className="w-6/12" />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <Bar className="w-40" />
              <div className="mt-3 space-y-2">
                <Bar className="w-11/12" />
                <Bar className="w-9/12" />
                <Bar className="w-10/12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
