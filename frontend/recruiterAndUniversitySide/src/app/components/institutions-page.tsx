import { useTheme } from "./theme-context";
import { Navbar } from "./navbar";
import { InstitutionsHero } from "./institutions-hero";
import { InstitutionsProblem } from "./institutions-problem";
import { Footer } from "./footer";

export function InstitutionsPage() {
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
      <InstitutionsHero />
      <InstitutionsProblem />
      <Footer />
    </div>
  );
}