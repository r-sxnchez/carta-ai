import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SIGNAL_LABELS: Record<string, string> = {
  fear_framing: "Encuadre de miedo",
  unsupported_certainty: "Certeza sin fundamento",
  oversimplification: "Sobresimplificación",
  emotional_amplification: "Amplificación emocional",
  false_dilemma: "Falso dilema",
  institutional_distortion: "Distorsión institucional",
};

export function ManipulationSignalsCard({ signals }: { signals: string[] }) {
  if (signals.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-amber-700">
        <AlertTriangle className="size-4 shrink-0" />
        <span className="text-sm font-medium">Señales de manipulación detectadas</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {signals.map((signal) => (
          <Badge
            key={signal}
            variant="outline"
            className="h-auto py-0.5 text-xs bg-amber-100 text-amber-800 border-amber-300"
          >
            {SIGNAL_LABELS[signal] ?? signal}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-amber-700/80 leading-relaxed">
        El encuadre de esta afirmación contiene patrones asociados a la desinformación.
        Verifique la evidencia constitucional de forma independiente.
      </p>
    </div>
  );
}
