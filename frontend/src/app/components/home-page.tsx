import { useTheme } from "./theme-context";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { Pathways } from "./pathways";
import { HowItWorks } from "./how-it-works";
import { Advantages } from "./advantages";
import { MatchingVisual } from "./matching-visual";
import { CTASection } from "./cta-section";
import { Footer } from "./footer";

export function HomePage() {
  const { theme } = useTheme();
  return (
    <div
      className={
        theme === "dark"
          ? "min-h-screen bg-[#0a0a0f] text-gray-100"
          : "min-h-screen bg-white text-gray-900"
      }
    >
      <Navbar />
      <Hero />
      <Pathways />
      <HowItWorks />
      <Advantages />
      <MatchingVisual />
      <CTASection />
      <Footer />
    </div>
  );
}
