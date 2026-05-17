import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { CartaLogo } from "./CartaLogo";
import { WHATSAPP_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar({ variant = "default" }: { variant?: "default" | "blue" }) {
  const isBlue = variant === "blue";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        isBlue ? "bg-primary" : "bg-background/90 backdrop-blur-sm border-b border-border"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <CartaLogo variant={isBlue ? "light" : "default"} />
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70",
              isBlue ? "text-white" : "text-foreground"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <Link
            href="/verificar"
            className={cn(
              "border-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors",
              isBlue
                ? "border-white text-white hover:bg-white hover:text-primary"
                : "border-foreground text-foreground hover:bg-foreground hover:text-background"
            )}
          >
            Verificar
          </Link>
        </div>
      </nav>
    </header>
  );
}
