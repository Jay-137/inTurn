import { ArrowRight, Play } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12 },
  }),
};

export function InstitutionsHero() {
  const { theme } = useTheme();
  const dk = theme === "dark";

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: dk
            ? "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="inline-flex items-center gap-2 mb-8"
        >
          <span
            className={`text-xs tracking-wide px-4 py-1.5 rounded-full border ${
              dk
                ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                : "border-blue-200 bg-blue-50 text-blue-600"
            }`}
          >
            For Universities & Colleges
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className={`text-4xl md:text-5xl lg:text-6xl tracking-tight max-w-3xl mx-auto ${
            dk ? "text-white" : "text-gray-900"
          }`}
          style={{ lineHeight: 1.1 }}
        >
          Modernize Your Campus{" "}
          <span className="text-blue-600">Placement Process</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className={`mt-6 text-lg md:text-xl max-w-2xl mx-auto ${
            dk ? "text-gray-400" : "text-gray-500"
          }`}
          style={{ lineHeight: 1.7 }}
        >
          Replace manual, fragmented placement systems with a structured,
          data-driven platform.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <button className="flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
            Request Demo
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            className={`flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium border transition-colors ${
              dk
                ? "border-white/10 text-gray-300 hover:bg-white/[0.04]"
                : "border-gray-300 text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Play className="w-4 h-4" />
            View Features
          </button>
        </motion.div>
      </div>
    </section>
  );
}
