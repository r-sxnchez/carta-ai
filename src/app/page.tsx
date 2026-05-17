import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Principles } from "@/components/landing/Principles";
import { CtaFooter } from "@/components/landing/CtaFooter";

export default function HomePage() {
  return (
    <>
      <Navbar variant="blue" />
      <main className="flex-1">
        <Hero />
        <Problem />
        <HowItWorks />
        <Principles />
        <CtaFooter />
      </main>
    </>
  );
}
