import { cn } from "@/lib/utils";

type LogoVariant = "default" | "light";

const PALETTES: Record<LogoVariant, { primary: string; accent: string; check: string; label: string }> = {
  default: { primary: "#1A1815", accent: "#C4A052", check: "#FFFFFF", label: "text-muted-foreground" },
  light: { primary: "#F7F4EE", accent: "#C4A052", check: "#1A1815", label: "text-white/60" },
};

export function CartaLogo({
  variant = "default",
  className,
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  const { primary, accent, check, label } = PALETTES[variant];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Carta"
        className="shrink-0"
      >
        <rect x="4" y="8" width="6" height="20" fill={primary} />
        <rect x="13" y="8" width="6" height="20" fill={primary} />
        <rect x="22" y="8" width="6" height="20" fill={primary} />
        <rect x="2" y="4" width="28" height="4" fill={primary} />
        <circle cx="26" cy="24" r="6" fill={accent} />
        <path d="M23 24L25 26L29 22" stroke={check} strokeWidth="2" strokeLinecap="square" />
      </svg>

      <div className="flex flex-col leading-none">
        <span className="font-serif text-lg font-bold tracking-tight" style={{ color: primary }}>
          CARTA
        </span>
        <span className={cn("text-[9px] font-medium uppercase tracking-[0.2em]", label)}>
          Verificacion
        </span>
      </div>
    </div>
  );
}
