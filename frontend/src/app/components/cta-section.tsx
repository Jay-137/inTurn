import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export function CTASection() {
  const { theme } = useTheme();
  const dk = theme === "dark";

  return (
    <section className={`py-24 md:py-32 border-t ${dk ? "border-white/5" : "border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
          className={`relative rounded-2xl border p-12 md:p-20 text-center overflow-hidden ${dk ? "border-blue-500/20 bg-blue-500/5" : "border-blue-300 bg-blue-50"}`}
        >
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px] ${dk ? "bg-blue-600/10" : "bg-blue-100/60"}`} />
          <div className="relative">
            <motion.h2 variants={fadeUp} className={`text-3xl md:text-5xl tracking-tight mb-6 ${dk ? "text-white" : "text-gray-900"}`} style={{ lineHeight: 1.15 }}>
              Ready to transform campus hiring?
            </motion.h2>
            <motion.p variants={fadeUp} className={`text-lg mb-10 max-w-2xl mx-auto ${dk ? "text-gray-400" : "text-gray-500"}`} style={{ lineHeight: 1.7 }}>
              Whether you're an institution looking to digitize placements or a recruiter seeking top campus talent — Inturn is built for you.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className={`w-full sm:w-auto border px-8 py-3.5 rounded-full transition-all ${dk ? "border-white/10 text-gray-300 hover:border-white/20 hover:text-white" : "border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900"}`}>
                Request Demo
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}