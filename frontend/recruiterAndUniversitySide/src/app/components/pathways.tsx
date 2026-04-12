import {
  GraduationCap,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export function Pathways() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const navigate = useNavigate();

  const cardCls = `relative rounded-2xl border overflow-hidden transition-colors group ${dk ? "border-white/10 bg-white/[0.02] hover:border-blue-500/30" : "border-gray-300 bg-white hover:border-blue-400 shadow-sm"}`;
  const iconBoxCls = dk ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200";

  return (
    <section id="pathways" className={`py-24 md:py-32 border-t ${dk ? "border-white/5" : "border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-blue-600 tracking-wide uppercase mb-3">Two paths, one platform</motion.p>
          <motion.h2 variants={fadeUp} className={`text-3xl md:text-4xl tracking-tight ${dk ? "text-white" : "text-gray-900"}`}>Choose your path</motion.h2>
          <motion.p variants={fadeUp} className={`mt-4 max-w-2xl mx-auto ${dk ? "text-gray-500" : "text-gray-500"}`}>
            Inturn serves two distinct user groups with tailored experiences — each designed to solve specific problems in campus hiring.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Institution */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className={cardCls}>
            <div className="h-48 w-full overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1632834380561-d1e05839a33a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwc3R1ZGVudHMlMjBncmFkdWF0aW9ufGVufDF8fHx8MTc3NTUzNjUwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="University campus"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${iconBoxCls}`}>
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className={`text-xl tracking-tight ${dk ? "text-white" : "text-gray-900"}`}>For Institutions</h3>
                  <p className="text-sm text-gray-500">Universities, Colleges & Placement Cells</p>
                </div>
              </div>
              <p className={`mb-8 ${dk ? "text-gray-400" : "text-gray-500"}`} style={{ lineHeight: 1.7 }}>
                Digitize your placement cell. Manage verified student profiles, control recruiter access, track outcomes, and run the entire hiring season from a single dashboard.
              </p>
              <button onClick={() => navigate("/institutions")} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors group/btn">
                Explore as institution
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Recruiter */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className={cardCls}>
            <div className="h-48 w-full overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758520144427-ddb02ac74e9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjByZWNydWl0ZXIlMjBvZmZpY2UlMjBoaXJpbmd8ZW58MXx8fHwxNzc1NTM2NTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Corporate recruiting"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${iconBoxCls}`}>
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className={`text-xl tracking-tight ${dk ? "text-white" : "text-gray-900"}`}>For Recruiters</h3>
                  <p className="text-sm text-gray-500">Companies & Hiring Teams</p>
                </div>
              </div>
              <p className={`mb-8 ${dk ? "text-gray-400" : "text-gray-500"}`} style={{ lineHeight: 1.7 }}>
                Access verified campus talent. Post structured job requirements, get intelligent match scores, and build shortlists in minutes — not weeks.
              </p>
              <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors group/btn">
                Explore as recruiter
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}