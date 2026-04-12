import { useNavigate } from "react-router-dom";
import { useApp } from "./app-context";
import { Card, GradientButton, ProgressBar, Badge, MatchScoreCircle, StatCard } from "./shared";
import { motion, AnimatePresence } from "motion/react";
import {
  Github, Code2, Trophy, ArrowRight, CheckCircle2, Clock,
  Briefcase, TrendingUp, Target, Star, Shield, X, AlertCircle,
  Sparkles, ChevronDown, GraduationCap, BarChart3, Lightbulb,
  CheckCheck, AlertTriangle, BookOpen, Award
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const availableRoles = [
  { label: "Frontend Developer", category: "Full-time" },
  { label: "Backend Developer", category: "Full-time" },
  { label: "Full Stack Developer", category: "Full-time" },
  { label: "SDE-1", category: "Full-time" },
  { label: "Data Scientist", category: "Full-time" },
  { label: "AI/ML Engineer", category: "Full-time" },
  { label: "DevOps Engineer", category: "Full-time" },
  { label: "UI/UX Designer", category: "Full-time" },
  { label: "Frontend Intern", category: "Internship" },
  { label: "Backend Intern", category: "Internship" },
  { label: "Full Stack Intern", category: "Internship" },
  { label: "AI/ML Intern", category: "Internship" },
  { label: "Data Science Intern", category: "Internship" },
  { label: "DevOps Intern", category: "Internship" },
  { label: "UI/UX Intern", category: "Internship" },
  { label: "SDE Intern", category: "Internship" },
];

const allJobs = [
  { id: "1", title: "SDE-1 Frontend", company: "TechCorp", match: 92, eligible: true, location: "Remote", tags: ["React", "TypeScript"], role: "Frontend Developer" },
  { id: "2", title: "SDE Intern", company: "InnovateLab", match: 87, eligible: true, location: "Bangalore", tags: ["Python", "DSA"], role: "SDE Intern" },
  { id: "3", title: "Fresher - Full Stack", company: "StartupX", match: 78, eligible: true, location: "Hybrid", tags: ["Node.js", "React"], role: "Full Stack Developer" },
  { id: "4", title: "Backend Developer", company: "CloudBase", match: 84, eligible: false, location: "Remote", tags: ["Go", "PostgreSQL"], role: "Backend Developer" },
  { id: "5", title: "AI/ML Intern", company: "DeepTech AI", match: 75, eligible: true, location: "Delhi", tags: ["Python", "TensorFlow"], role: "AI/ML Intern" },
  { id: "6", title: "Frontend Intern", company: "DesignLab", match: 90, eligible: true, location: "Remote", tags: ["React", "CSS"], role: "Frontend Intern" },
  { id: "7", title: "DevOps Engineer", company: "ScaleUp", match: 71, eligible: false, location: "Pune", tags: ["AWS", "Docker"], role: "DevOps Engineer" },
];

const skillScores = [
  { name: "DSA & Problem Solving", score: 85, color: "indigo" as const },
  { name: "Frontend Development", score: 92, color: "purple" as const },
  { name: "Backend Development", score: 68, color: "blue" as const },
  { name: "System Design", score: 45, color: "amber" as const },
];

const eligibilityItems = [
  { label: "CGPA (≥ 7.0)", status: true, detail: "8.4 / 10" },
  { label: "Branch", status: true, detail: "CSE — Eligible" },
  { label: "Academic Year", status: true, detail: "Final Year" },
  { label: "Active Backlogs", status: false, detail: "1 backlog — Review needed" },
];

const placementInsights = [
  { icon: Star, text: "Your strongest area: Frontend Development (92/100)", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: TrendingUp, text: "Improve Backend Development to increase shortlist chances", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Award, text: "You align with 80% of SDE roles in the placement pool", color: "text-indigo-600", bg: "bg-indigo-50" },
];

export function CandidateDashboard() {
  const navigate = useNavigate();
  const { linkedPlatforms, preferredRoles, setPreferredRoles } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const linkedCount = Object.values(linkedPlatforms).filter(Boolean).length;
  const totalPlatforms = Object.keys(linkedPlatforms).length;
  const profileCompletion = Math.round((linkedCount / totalPlatforms) * 80 + 20);

  const toggleRole = (role: string) => {
    if (preferredRoles.includes(role)) {
      setPreferredRoles(preferredRoles.filter((r) => r !== role));
    } else if (preferredRoles.length < 2) {
      setPreferredRoles([...preferredRoles, role]);
    }
  };

  const filteredJobs = preferredRoles.length > 0
    ? allJobs.filter((j) => preferredRoles.includes(j.role))
    : allJobs;

  const topJobs = filteredJobs.sort((a, b) => b.match - a.match).slice(0, 3);

  const shortlistedCount = allJobs.filter((j) => j.match >= 75).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const eligibleCount = eligibilityItems.filter((e) => e.status).length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-indigo-200" />
            <span className="text-indigo-200 text-xs uppercase tracking-wider">Placement Portal</span>
          </div>
          <h2 className="text-xl text-white mb-1">Welcome back, Alex!</h2>
          <p className="text-indigo-100 text-sm mb-4">
            You have <span className="text-white">{shortlistedCount} shortlisted opportunities</span> based on your profile and eligibility.
          </p>
          <GradientButton
            className="!bg-white !text-indigo-700 !shadow-none"
            size="sm"
            onClick={() => navigate("/student/placements")}
          >
            View Shortlisted Roles <ArrowRight className="w-4 h-4 inline ml-1" />
          </GradientButton>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Target className="w-5 h-5" />} label="Profile Alignment Score" value="87%" trend="+5% this week" />
        <StatCard icon={<Briefcase className="w-5 h-5" />} label="Shortlisted Roles" value={shortlistedCount.toString()} trend="3 new shortlists" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Placement Activity" value="47" trend="+12 this week" />
      </div>

      {/* Eligibility Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-border p-6 shadow-sm"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900 text-sm">Eligibility Status</h3>
              <p className="text-xs text-muted-foreground">Based on current placement criteria</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            eligibleCount === eligibilityItems.length
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            {eligibleCount}/{eligibilityItems.length} Criteria Met
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {eligibilityItems.map((item, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 border ${
                item.status
                  ? "bg-emerald-50/60 border-emerald-100"
                  : "bg-amber-50/60 border-amber-100"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {item.status ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className="text-xs text-gray-700">{item.label}</span>
              </div>
              <p className={`text-xs pl-5 ${item.status ? "text-emerald-600" : "text-amber-600"}`}>
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Profile & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Roles for Placement - compact dropdown */}
          <Card>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-gray-900 text-sm">Target Roles for Placement</h3>
                  <p className="text-xs text-muted-foreground">Shortlisting and evaluation are based on these roles</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Selected chips */}
              {preferredRoles.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200 text-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  {r}
                  <button
                    onClick={() => toggleRole(r)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Dropdown trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  disabled={preferredRoles.length >= 2}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all cursor-pointer ${
                    preferredRoles.length >= 2
                      ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  {preferredRoles.length === 0 ? "Select roles" : "Add role"}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && preferredRoles.length < 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 z-50 overflow-hidden"
                    >
                      <div className="max-h-64 overflow-y-auto py-1">
                        {["Full-time", "Internship"].map((category) => (
                          <div key={category}>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">{category}</p>
                            {availableRoles
                              .filter((r) => r.category === category)
                              .map((r) => {
                                const selected = preferredRoles.includes(r.label);
                                return (
                                  <button
                                    key={r.label}
                                    onClick={() => {
                                      toggleRole(r.label);
                                      if (!selected && preferredRoles.length >= 1) setDropdownOpen(false);
                                    }}
                                    disabled={selected}
                                    className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                                      selected
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                                    }`}
                                  >
                                    {r.label}
                                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                                  </button>
                                );
                              })}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {preferredRoles.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Select target roles to see relevant shortlisted opportunities
                </div>
              )}
            </div>
          </Card>

          {/* Profile Completion */}
          <Card>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-900">Profile Completion</h3>
              <span className="text-sm text-indigo-600">{profileCompletion}%</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Complete your profile to improve shortlisting accuracy</p>
            <ProgressBar value={profileCompletion} color="indigo" size="lg" />
            <div className="flex items-center gap-6 mt-4 flex-wrap">
              {[
                { icon: Github, name: "GitHub", connected: linkedPlatforms.github },
                { icon: Code2, name: "LeetCode", connected: linkedPlatforms.leetcode },
                { icon: Trophy, name: "Codeforces", connected: linkedPlatforms.codeforces },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <p.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{p.name}</span>
                  {p.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              ))}
            </div>
            {linkedCount < totalPlatforms && (
              <GradientButton
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate("/student/link")}
              >
                Complete Profile
              </GradientButton>
            )}
          </Card>

          {/* Skill Scores */}
          <Card>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-900">Composite Skill Score</h3>
              <GradientButton variant="ghost" size="sm" onClick={() => navigate("/student/profile")}>
                View Details
              </GradientButton>
            </div>
            <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              Used for placement shortlisting
            </p>
            <div className="space-y-4">
              {skillScores.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700">{s.name}</span>
                    <span className="text-sm text-gray-500">{s.score}/100</span>
                  </div>
                  <ProgressBar value={s.score} color={s.color} />
                </div>
              ))}
            </div>
          </Card>

          {/* Placement Insights */}
          <Card>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-gray-900 text-sm">Placement Insights</h3>
                <p className="text-xs text-muted-foreground">Personalized observations from your profile</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {placementInsights.map((insight, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-xl p-3 ${insight.bg}`}>
                  <insight.icon className={`w-4 h-4 mt-0.5 shrink-0 ${insight.color}`} />
                  <p className={`text-sm ${insight.color}`}>{insight.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right - Shortlisted Opportunities */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Shortlisted Opportunities</h3>
              <GradientButton variant="ghost" size="sm" onClick={() => navigate("/student/placements")}>
                See All
              </GradientButton>
            </div>
            {preferredRoles.length > 0 && (
              <div className="flex items-center gap-1.5 mb-3 text-xs text-indigo-600">
                <Target className="w-3 h-3" />
                Filtered by: {preferredRoles.join(", ")}
              </div>
            )}
            <div className="space-y-3">
              {topJobs.length > 0 ? topJobs.map((job) => (
                <motion.div
                  key={job.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer"
                  onClick={() => navigate("/student/placements")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company} · {job.location}</p>
                    </div>
                    <MatchScoreCircle score={job.match} size={44} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.tags.map((t) => (
                      <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                    {job.match >= 88 ? (
                      <Badge variant="priority">
                        <Star className="w-3 h-3 mr-1" /> Top Shortlist
                      </Badge>
                    ) : (
                      <Badge variant="info">
                        <TrendingUp className="w-3 h-3 mr-1" /> High Alignment
                      </Badge>
                    )}
                    <Badge variant={job.eligible ? "success" : "warning"}>
                      {job.eligible ? "Eligible" : "Partially Eligible"}
                    </Badge>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-6 text-sm text-gray-400">
                  No shortlisted opportunities for your target roles yet. Check back soon!
                </div>
              )}
            </div>
          </Card>

          {/* Placement summary mini card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-indigo-800">Placement Summary</span>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Roles shortlisted</span>
                <span className="text-indigo-700">{shortlistedCount} opportunities</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Eligibility criteria</span>
                <span className="text-emerald-600">{eligibleCount}/{eligibilityItems.length} met</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Profile alignment</span>
                <span className="text-indigo-700">87% avg. score</span>
              </div>
            </div>
            <GradientButton
              variant="outline"
              size="sm"
              className="mt-4 w-full !justify-center"
              onClick={() => navigate("/student/profile")}
            >
              View Full Profile <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </GradientButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
}