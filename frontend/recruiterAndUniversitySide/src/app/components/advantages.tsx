import { ShieldCheck, LayoutList, Brain, Zap, BarChart3, Users } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const items = [
  { icon: ShieldCheck, title: "Verified Data", desc: "Every student profile is validated by their institution, ensuring recruiters work with accurate, trustworthy information." },
  { icon: LayoutList, title: "Structured Hiring", desc: "Standardized job postings and eligibility criteria replace ad-hoc spreadsheets and endless email chains." },
  { icon: Brain, title: "Intelligent Matching", desc: "Algorithmic scoring connects the right candidates to the right roles based on skills, not just keywords." },
  { icon: Zap, title: "Reduced Manual Work", desc: "Automate shortlisting, scheduling, and tracking — freeing placement officers and HR teams for higher-value tasks." },
  { icon: BarChart3, title: "Real-time Analytics", desc: "Dashboards for both institutions and recruiters to track progress, conversion rates, and placement outcomes." },
  { icon: Users, title: "Multi-stakeholder", desc: "A single platform where students, placement cells, and recruiters collaborate seamlessly." },
];

export function Advantages() {
  const { theme } = useTheme();
  const dk = theme === "dark";

  return (
    <section id="advantages" className={`py-24 md:py-32 border-t ${dk ? "border-white/5" : "border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-blue-600 tracking-wide uppercase mb-3">Why Inturn</motion.p>
          <motion.h2 variants={fadeUp} className={`text-3xl md:text-4xl tracking-tight ${dk ? "text-white" : "text-gray-900"}`}>Key advantages</motion.h2>
        </motion.div>

        <motion.div
          className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden border ${dk ? "bg-white/5 border-white/5" : "bg-gray-300 border-gray-300"}`}
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
        >
          {items.map((item) => (
            <motion.div key={item.title} variants={fadeUp} className={`p-8 md:p-10 transition-colors ${dk ? "bg-[#0a0a0f] hover:bg-white/[0.02]" : "bg-white hover:bg-gray-50"}`}>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-5 ${dk ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}>
                <item.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className={`text-lg tracking-tight mb-2 ${dk ? "text-white" : "text-gray-900"}`}>{item.title}</h3>
              <p className="text-sm text-gray-500" style={{ lineHeight: 1.7 }}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}