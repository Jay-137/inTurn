import { Briefcase, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";
import { Navbar } from "./navbar";
import { useNavigate } from "react-router";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12 },
  }),
};

const recruiterFeatures = [
  "Create company account",
  "Post jobs",
  "Access verified candidates",
];

const universityFeatures = [
  "Manage placements",
  "Get insights",
  "Control hiring",
];

export function GetStartedPage() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const navigate = useNavigate();

  return (
    <div
      className={
        dk
          ? "min-h-screen bg-[#0a0a0f] text-gray-100"
          : "min-h-screen bg-white text-gray-900"
      }
    >
      <Navbar />

      <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="text-center mb-14"
          >
            <motion.h1
              custom={0}
              variants={fadeUp}
              className={`text-3xl md:text-4xl lg:text-5xl tracking-tight ${
                dk ? "text-white" : "text-gray-900"
              }`}
            >
              Get Started with <span className="text-blue-600">Inturn</span>
            </motion.h1>
            <motion.p
              custom={1}
              variants={fadeUp}
              className={`mt-4 text-lg ${
                dk ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Choose how you want to use the platform
            </motion.p>
          </motion.div>

          {/* Cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          >
            {/* Recruiter Card — Primary / Prominent */}
            <motion.div
              custom={2}
              variants={fadeUp}
              className={`relative rounded-2xl p-8 border-2 transition-all hover:scale-[1.02] cursor-pointer group ${
                dk
                  ? "bg-blue-600/[0.06] border-blue-500/30 hover:border-blue-500/50"
                  : "bg-blue-50/60 border-blue-300 hover:border-blue-400"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  dk
                    ? "bg-blue-500/15 border border-blue-500/25"
                    : "bg-blue-100 border border-blue-200"
                }`}
              >
                <Briefcase
                  className={`w-5 h-5 ${
                    dk ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>

              <h2
                className={`text-xl mb-1 ${
                  dk ? "text-white" : "text-gray-900"
                }`}
              >
                Recruiters
              </h2>
              <p
                className={`text-sm mb-6 ${
                  dk ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Start hiring with structured tools
              </p>

              <ul className="space-y-3 mb-8">
                {recruiterFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        dk ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        dk ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button onClick={() => navigate("/register-company")} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                Start Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* University Card — Secondary */}
            <motion.div
              custom={3}
              variants={fadeUp}
              className={`rounded-2xl p-8 border transition-all hover:scale-[1.02] cursor-pointer group ${
                dk
                  ? "bg-white/[0.02] border-white/10 hover:border-white/15"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  dk
                    ? "bg-white/[0.04] border border-white/10"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <GraduationCap
                  className={`w-5 h-5 ${
                    dk ? "text-gray-400" : "text-gray-600"
                  }`}
                />
              </div>

              <h2
                className={`text-xl mb-1 ${
                  dk ? "text-white" : "text-gray-900"
                }`}
              >
                Universities
              </h2>
              <p
                className={`text-sm mb-6 ${
                  dk ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Modernize your placement process
              </p>

              <ul className="space-y-3 mb-8">
                {universityFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        dk ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        dk ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/institutions")}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium border transition-colors ${
                  dk
                    ? "border-white/10 text-gray-300 hover:bg-white/[0.04]"
                    : "border-gray-300 text-gray-900 hover:bg-gray-50"
                }`}
              >
                Request Demo
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}