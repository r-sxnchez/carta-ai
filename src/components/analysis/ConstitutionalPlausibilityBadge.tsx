import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlausibilityVerdict } from "@/types/analysis";

const CONFIG: Record<
  PlausibilityVerdict,
  { label: string; barColor: string; badgeClassName: string }
> = {
  plausible: {
    label: "Constitucionalmente plausible",
    barColor: "bg-emerald-500",
    badgeClassName: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  implausible: {
    label: "Constitucionalmente implausible",
    barColor: "bg-red-500",
    badgeClassName: "bg-red-50 text-red-700 border-red-200",
  },
  uncertain: {
    label: "Evidencia insuficiente",
    barColor: "bg-amber-500",
    badgeClassName: "bg-amber-50 text-amber-700 border-amber-200",
  },
  context_dependent: {
    label: "Depende del contexto",
    barColor: "bg-blue-500",
    badgeClassName: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export function ConstitutionalPlausibilityBadge({
  verdict,
}: {
  verdict: PlausibilityVerdict;
}) {
  const { label, badgeClassName } = CONFIG[verdict];
  return (
    <Badge
      variant="outline"
      className={cn("h-auto py-1 px-3 text-sm font-medium", badgeClassName)}
    >
      {label}
    </Badge>
  );
}

export function VerdictBarColor({ verdict }: { verdict: PlausibilityVerdict }) {
  return <div className={cn("h-1 w-full rounded-t-xl", CONFIG[verdict].barColor)} />;
}
