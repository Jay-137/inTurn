import { useNavigate } from "react-router-dom";
import { useApp } from "./app-context";
import { GradientButton } from "./shared";
import { motion } from "motion/react";
import {
  Cpu, Github, Code2, Trophy, ArrowRight, CheckCircle2,
  GraduationCap, Calendar, ClipboardList, BarChart3, Shield,
  Bell, BookOpen, Users, Zap
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const features = [
  {
    icon: ClipboardList,
    title: "Drive Management",
    desc: "Track all campus placement drives — schedules, eligibility criteria, and deadlines — in one place.",
  },
  {
    icon: Shield,
    title: "Eligibility Tracking",
    desc: "Automatically check your CGPA, branch, year, and backlog status against each company's criteria.",
  },
  {
    icon: Code2,
    title: "Verified Skill Proof",
    desc: "Link GitHub, LeetCode & Codeforces to build a verified skill profile that companies trust.",
  },
  {
    icon: Bell,
    title: "Timely Notifications",
    desc: "Never miss a drive. Get alerts for shortlists, test schedules, and interview rounds.",
  },
];

const steps = [
  { num: "01", title: "Register & Set Up", desc: "Create your student profile and link academic details" },
  { num: "02", title: "Verify Your Skills", desc: "Connect coding platforms for automatic skill verification" },
  { num: "03", title: "Browse Drives", desc: "Explore placement drives matched to your eligibility" },
  { num: "04", title: "Track & Apply", desc: "Apply to drives and track your placement journey" },
];

const stats = [
  { value: "120+", label: "Companies Visiting" },
  { value: "2,400+", label: "Students Placed" },
  { value: "94%", label: "Placement Rate" },
  { value: "28 LPA", label: "Highest Package" },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { setRole } = useApp();

  const handleEnterPortal = () => {
    setRole("student");
    navigate("/student");
  };

  return (
    <div className="min-h-screen bg-white font-[Inter,system-ui,sans-serif]">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg text-gray-900">in-turn</span>
              <span className="text-[10px] text-gray-400 block -mt-0.5 tracking-wide">Campus Placement Portal</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <GradientButton size="sm" onClick={handleEnterPortal}>
              Student Login
            </GradientButton>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs mb-6 border border-indigo-100">
                <GraduationCap className="w-3.5 h-3.5" />
                Campus Placement Season 2025–26
              </div>
              <h1 className="text-4xl lg:text-5xl text-gray-900 mb-5 !leading-tight">
                Your Campus Placement,{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Organized & Simplified
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Track drives, verify your skills, check eligibility, and manage your entire campus placement journey — all from one unified portal.
              </p>
              <div className="flex flex-wrap gap-4">
                <GradientButton size="lg" onClick={handleEnterPortal}>
                  Enter Student Portal <ArrowRight className="w-5 h-5 inline ml-2" />
                </GradientButton>
              </div>
              <div className="flex items-center gap-6 mt-8">
                {[Github, Code2, Trophy].map((Icon, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon className="w-4 h-4" />
                    {["GitHub", "LeetCode", "Codeforces"][i]}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-gray-100">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="University campus placement"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Floating cards */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-6 left-6 bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Eligible for 12 Drives</p>
                      <p className="text-xs text-gray-500">3 applications pending</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute top-6 right-6 bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">Drive: TechCorp · Apr 20</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl text-gray-900 mb-3">Everything You Need for Placements</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              From drive schedules to skill verification — in-turn handles the complexity so you can focus on preparation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-base text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600">Your placement journey in four simple steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="text-5xl bg-gradient-to-r from-indigo-100 to-purple-100 bg-clip-text text-transparent mb-4">
                  {s.num}
                </div>
                <h3 className="text-base text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
                {i < 3 && (
                  <ArrowRight className="hidden md:block w-5 h-5 text-indigo-300 absolute top-8 -right-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights strip */}
      <section className="py-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            {[
              { icon: BookOpen, title: "Resume-Free Shortlisting", desc: "Skill data speaks louder than PDFs. Let your code do the talking." },
              { icon: Users, title: "Batch-Level Insights", desc: "Understand how you rank within your batch for placement preparedness." },
              { icon: Zap, title: "Real-Time Drive Updates", desc: "Live status updates as drives progress through rounds." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base text-white">{item.title}</h3>
                <p className="text-sm text-indigo-100">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl text-gray-900 mb-4">Ready for Placement Season?</h2>
          <p className="text-gray-600 mb-8">
            Set up your profile, verify your skills, and stay ahead of every placement drive — all through in-turn.
          </p>
          <GradientButton size="lg" onClick={handleEnterPortal}>
            Enter Student Portal <ArrowRight className="w-5 h-5 inline ml-2" />
          </GradientButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span className="text-sm text-gray-600">in-turn — Campus Placement Management System</span>
          </div>
          <p className="text-sm text-gray-400">Hackathon Demo Prototype · Apr 2026</p>
        </div>
      </footer>
    </div>
  );
}
