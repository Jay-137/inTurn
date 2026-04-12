import { GraduationCap, LayoutList, Brain, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const steps = [
  {
    num: "01",
    icon: GraduationCap,
    title: "Institutions manage access",
    desc: "Placement cells onboard students, verify profiles, and control which recruiters can access their talent pool.",
    img: "https://images.unsplash.com/photo-1596247290824-e9f12b8c574f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGRpZ2l0YWwlMjBwcm9maWxlcyUyMGxhcHRvcHxlbnwxfHx8fDE3NzU1MzY1MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Students with digital profiles",
  },
  {
    num: "02",
    icon: LayoutList,
    title: "Recruiters define requirements",
    desc: "Companies create structured job postings with specific skill requirements, eligibility criteria, and role details.",
    img: "https://images.unsplash.com/photo-1586282391532-45d8e9902d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBwb3N0aW5nJTIwcmVxdWlyZW1lbnRzJTIwY2hlY2tsaXN0fGVufDF8fHx8MTc3NTUzNjUwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Job requirements checklist",
  },
  {
    num: "03",
    icon: Brain,
    title: "Platform generates match scores",
    desc: "Inturn processes verified student data against job requirements to produce intelligent compatibility scores.",
    img: "https://images.unsplash.com/photo-1775185173284-36c5287cf82b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwZGF0YSUyMGFsZ29yaXRobXxlbnwxfHx8fDE3NzU1MzY1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "AI data matching",
  },
  {
    num: "04",
    icon: Zap,
    title: "Hiring becomes faster",
    desc: "Recruiters get ranked shortlists. Institutions see real-time placement progress. Everyone saves time.",
    img: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXN0JTIwaGlyaW5nJTIwaGFuZHNoYWtlJTIwZGVhbHxlbnwxfHx8fDE3NzU1MzY1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Fast hiring handshake",
  },
];

export function HowItWorks() {
  const { theme } = useTheme();
  const dk = theme === "dark";

  return (
    <section id="how-it-works" className={`py-24 md:py-32 border-t ${dk ? "border-white/5 bg-[#08080d]" : "border-gray-100 bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-blue-600 tracking-wide uppercase mb-3">Simple & powerful</motion.p>
          <motion.h2 variants={fadeUp} className={`text-3xl md:text-4xl tracking-tight ${dk ? "text-white" : "text-gray-900"}`}>How Inturn works</motion.h2>
        </motion.div>

        <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              className={`relative rounded-2xl border overflow-hidden transition-colors group ${dk ? "border-white/5 bg-white/[0.02] hover:border-blue-500/20" : "border-gray-300 bg-white hover:border-blue-400 shadow-sm"}`}
            >
              <div className="h-36 w-full overflow-hidden">
                <ImageWithFallback
                  src={step.img}
                  alt={step.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <span className={`text-4xl tracking-tighter block mb-3 ${dk ? "text-white/5" : "text-gray-100"}`}>{step.num}</span>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${dk ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}>
                  <step.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className={`text-lg tracking-tight mb-2 ${dk ? "text-white" : "text-gray-900"}`}>{step.title}</h3>
                <p className="text-sm text-gray-500" style={{ lineHeight: 1.7 }}>{step.desc}</p>
              </div>
              {i < 3 && (
                <div className={`hidden lg:block absolute top-1/2 -right-3 w-6 border-t border-dashed z-10 ${dk ? "border-white/10" : "border-gray-400"}`} />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
