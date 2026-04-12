import {
  Database, FileWarning, Clock, EyeOff,
  Users, ShieldCheck, Zap, BarChart3,
  ChevronDown,
} from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";

const leftSteps = [
  { icon: Database, label: "Scattered student data across multiple sources" },
  { icon: FileWarning, label: "Inconsistent and self-reported information" },
  { icon: Clock, label: "Time-intensive manual shortlisting" },
  { icon: EyeOff, label: "Limited oversight of placement progress" },
];

const rightSteps = [
  { icon: Users, label: "Unified and continuously updated student profiles" },
  { icon: ShieldCheck, label: "Reliable data from verified sources" },
  { icon: Zap, label: "Structured tools for faster shortlisting" },
  { icon: BarChart3, label: "Clear visibility into placement outcomes and student progress" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

function Connector({ dk, variant }: { dk: boolean; variant: "old" | "new" }) {
  const color =
    variant === "old"
      ? dk ? "text-red-500/40" : "text-red-300"
      : dk ? "text-blue-500/50" : "text-blue-300";
  return (
    <div className={`flex justify-center py-1 ${color}`}>
      <ChevronDown className="w-4 h-4" />
    </div>
  );
}

export function InstitutionsProblem() {
  const { theme } = useTheme();
  const dk = theme === "dark";

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <motion.h2
            custom={0}
            variants={fadeUp}
            className={`text-3xl md:text-4xl tracking-tight ${dk ? "text-white" : "text-gray-900"}`}
          >
            From Manual Chaos to{" "}
            <span className="text-blue-600">Structured Hiring</span>
          </motion.h2>
          <motion.p
            custom={1}
            variants={fadeUp}
            className={`mt-4 text-lg max-w-2xl mx-auto ${dk ? "text-gray-400" : "text-gray-500"}`}
          >
            See how Inturn transforms every stage of your placement workflow.
          </motion.p>
        </motion.div>

        {/* Two-column comparison */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          {/* LEFT — Traditional */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className={`inline-flex items-center gap-2 text-xs tracking-wide uppercase px-3 py-1 rounded-full mb-6 ${
                dk
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-red-50 text-red-500 border border-red-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Traditional Process
            </motion.div>

            <div
              className={`rounded-2xl p-6 md:p-8 border ${
                dk
                  ? "bg-white/[0.02] border-white/5"
                  : "bg-gray-50/80 border-gray-200"
              }`}
            >
              {leftSteps.map((step, i) => (
                <motion.div key={step.label} custom={i + 1} variants={fadeUp}>
                  <div
                    className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                      dk ? "bg-white/[0.02]" : "bg-white"
                    } border ${
                      dk ? "border-white/5" : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        dk
                          ? "bg-red-500/10 border border-red-500/15"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <step.icon
                        className={`w-4.5 h-4.5 ${dk ? "text-red-400" : "text-red-500"}`}
                      />
                    </div>
                    <p
                      className={`text-sm pt-2 ${
                        dk ? "text-gray-400" : "text-gray-600"
                      }`}
                      style={{ lineHeight: 1.6 }}
                    >
                      {step.label}
                    </p>
                  </div>
                  {i < leftSteps.length - 1 && <Connector dk={dk} variant="old" />}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — With Inturn */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className={`inline-flex items-center gap-2 text-xs tracking-wide uppercase px-3 py-1 rounded-full mb-6 ${
                dk
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              With Inturn
            </motion.div>

            <div
              className={`rounded-2xl p-6 md:p-8 border ${
                dk
                  ? "bg-blue-500/[0.02] border-blue-500/10"
                  : "bg-blue-50/30 border-blue-200"
              }`}
            >
              {rightSteps.map((step, i) => (
                <motion.div key={step.label} custom={i + 1} variants={fadeUp}>
                  <div
                    className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                      dk ? "bg-white/[0.03]" : "bg-white"
                    } border ${
                      dk ? "border-blue-500/10" : "border-blue-100"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        dk
                          ? "bg-blue-500/10 border border-blue-500/20"
                          : "bg-blue-50 border border-blue-200"
                      }`}
                    >
                      <step.icon
                        className={`w-4.5 h-4.5 ${dk ? "text-blue-400" : "text-blue-600"}`}
                      />
                    </div>
                    <p
                      className={`text-sm pt-2 ${
                        dk ? "text-gray-300" : "text-gray-800"
                      }`}
                      style={{ lineHeight: 1.6 }}
                    >
                      {step.label}
                    </p>
                  </div>
                  {i < rightSteps.length - 1 && <Connector dk={dk} variant="new" />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
