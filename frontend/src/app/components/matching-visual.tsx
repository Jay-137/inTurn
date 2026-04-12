import { Target } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const skills = ["React", "Python", "SQL", "Machine Learning", "Node.js", "Java", "AWS", "Data Analysis"];
const matchItems = [
  { name: "Arjun M.", match: 96, skills: ["React", "Node.js", "AWS"] },
  { name: "Priya S.", match: 91, skills: ["Python", "ML", "SQL"] },
  { name: "Rahul K.", match: 87, skills: ["Java", "AWS", "SQL"] },
];

export function MatchingVisual() {
  const { theme } = useTheme();
  const dk = theme === "dark";

  return (
    <section className={`py-24 md:py-32 border-t ${dk ? "border-white/5 bg-[#08080d]" : "border-gray-100 bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.div variants={fadeUp} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6 ${dk ? "border border-blue-500/20 bg-blue-500/10 text-blue-400" : "border border-blue-200 bg-blue-50 text-blue-600"}`}>
              <Target className="w-4 h-4" />
              Skill-Based Matching
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-3xl md:text-4xl tracking-tight mb-6 ${dk ? "text-white" : "text-gray-900"}`} style={{ lineHeight: 1.15 }}>
              Data-driven matching that actually works
            </motion.h2>
            <motion.p variants={fadeUp} className={`text-lg mb-8 ${dk ? "text-gray-400" : "text-gray-500"}`} style={{ lineHeight: 1.7 }}>
              Inturn doesn't just filter by CGPA. It maps verified skills, project experience, certifications, and role requirements to produce match scores that predict hiring success.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className={`px-3 py-1.5 rounded-full border text-sm ${dk ? "border-white/10 bg-white/[0.03] text-gray-400" : "border-gray-300 bg-gray-50 text-gray-600"}`}>
                  {s}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            {matchItems.map((item) => (
              <div key={item.name} className={`border rounded-2xl p-6 flex items-center gap-6 ${dk ? "border-white/5 bg-white/[0.02]" : "border-gray-300 bg-white shadow-sm"}`}>
                <div className="relative flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke={dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(item.match / 100) * 175.9} 175.9`} />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-sm ${dk ? "text-white" : "text-gray-900"}`}>{item.match}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`mb-1.5 ${dk ? "text-white" : "text-gray-900"}`}>{item.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.map((s) => (
                      <span key={s} className={`text-xs px-2 py-0.5 rounded-full ${dk ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" : "bg-blue-50 border border-blue-200 text-blue-600"}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Score</span>
                  <p className={`text-2xl tracking-tight ${dk ? "text-white" : "text-gray-900"}`}>{item.match}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}