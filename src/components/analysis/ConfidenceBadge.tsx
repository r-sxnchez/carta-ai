import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/types/analysis";

const CONFIG: Record<ConfidenceLevel, { label: string; className: string }> = {
  high: {
    label: "Alta confianza",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  medium: {
    label: "Confianza media",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  low: {
    label: "Confianza baja",
    className: "bg-zinc-100 text-zinc-500 border-zinc-200",
  },
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const { label, className } = CONFIG[level];
  return (
    <Badge variant="outline" className={cn("h-auto py-0.5 text-xs font-normal", className)}>
      {label}
    </Badge>
  );
}
