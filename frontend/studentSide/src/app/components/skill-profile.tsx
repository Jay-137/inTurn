import { Card, GradientButton, ProgressBar, Badge } from "./shared";
import { motion } from "motion/react";
import {
  BarChart3, TrendingUp, Target, Lightbulb, ArrowUpRight,
  CheckCircle2, AlertTriangle, ChevronRight, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./app-context";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

// Static skill breakdown — computed from linked platforms in a real implementation
const radarData = [
  { subject: "DSA", score: 85, fullMark: 100 },
  { subject: "Frontend", score: 92, fullMark: 100 },
  { subject: "Backend", score: 68, fullMark: 100 },
  { subject: "System Design", score: 45, fullMark: 100 },
  { subject: "DevOps", score: 52, fullMark: 100 },
  { subject: "Databases", score: 72, fullMark: 100 },
];

const detailedSkills = [
  { name: "React / TypeScript", score: 95, category: "Frontend", color: "indigo" as const },
  { name: "Data Structures", score: 88, category: "DSA", color: "purple" as const },
  { name: "Algorithms", score: 82, category: "DSA", color: "purple" as const },
  { name: "Node.js / Express", score: 72, category: "Backend", color: "blue" as const },
  { name: "REST APIs", score: 70, category: "Backend", color: "blue" as const },
  { name: "SQL / Databases", score: 72, category: "Backend", color: "emerald" as const },
  { name: "System Design", score: 45, category: "System Design", color: "amber" as const },
  { name: "CSS / Tailwind", score: 90, category: "Frontend", color: "indigo" as const },
];

const roleReadiness = [
  { role: "Frontend Developer", readiness: 92, status: "Excellent", color: "emerald" as const },
  { role: "Full Stack Developer", readiness: 74, status: "Good", color: "indigo" as const },
  { role: "Backend Developer", readiness: 65, status: "Moderate", color: "blue" as const },
  { role: "DSA Specialist", readiness: 85, status: "Very Good", color: "purple" as const },
];

const improvements = [
  {
    area: "System Design",
    suggestion: "Study distributed systems basics. Practice designing URL shorteners, chat systems.",
    impact: "High",
    resources: ["Grokking System Design", "System Design Primer (GitHub)"],
  },
  {
    area: "Backend Development",
    suggestion: "Build 2-3 REST API projects. Learn authentication, caching patterns.",
    impact: "Medium",
    resources: ["Node.js Best Practices", "Backend Engineering Roadmap"],
  },
  {
    area: "DevOps",
    suggestion: "Learn Docker basics and CI/CD pipelines. Deploy a project on AWS/GCP.",
    impact: "Medium",
    resources: ["Docker Getting Started", "GitHub Actions Tutorial"],
  },
];

export function SkillProfile() {
  const navigate = useNavigate();
  const { studentProfile, authUser, linkedPlatforms } = useApp();

  // Bar chart data: real platforms from linkedPlatforms + static scores
  const barData = [
    {
      name: "GitHub",
      score: linkedPlatforms.github ? 245 : 0,
    },
    {
      name: "LeetCode",
      score: linkedPlatforms.leetcode ? 342 : 0,
    },
    {
      name: "Codeforces",
      score: linkedPlatforms.codeforces ? 67 : 0,
    },
    {
      name: "Kaggle",
      score: linkedPlatforms.kaggle ? 45 : 0,
    },
  ].filter((d) => d.score > 0 || Object.values(linkedPlatforms).some(Boolean));

  const linkedCount = Object.values(linkedPlatforms).filter(Boolean).length;

  // Overall score influenced by real profile data if available
  const overallScore =
    studentProfile
      ? Math.round(
          (studentProfile.cgpa / 10) * 40 +
          (linkedCount / 8) * 30 +
          30
        )
      : 78;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Composite Score Header */}
      <Card className="!bg-gradient-to-r !from-indigo-500 !to-purple-600 !border-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h2 className="text-xl text-white mb-1">Composite Skill Score</h2>
            <p className="text-indigo-100 text-sm">
              {linkedCount > 0
                ? `Based on ${linkedCount} linked platform${linkedCount > 1 ? "s" : ""}`
                : "Link coding platforms to improve your score"}
            </p>
            {studentProfile && (
              <p className="text-indigo-200 text-xs mt-1">
                {studentProfile.user?.name} · CGPA {studentProfile.cgpa.toFixed(1)} · {studentProfile.university?.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
              >
                <span className="text-3xl text-white">{overallScore}</span>
              </motion.div>
              <p className="text-xs text-indigo-200 mt-2">Overall Score</p>
            </div>
            <div className="hidden md:block text-right space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-indigo-200">Rank:</span>
                <Badge variant="priority">Top 15%</Badge>
              </div>
              <p className="text-xs text-indigo-200">Updated recently</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile quick stats if available */}
      {studentProfile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "CGPA", value: studentProfile.cgpa.toFixed(1), unit: "/ 10" },
            { label: "Backlogs", value: String(studentProfile.backlogCount), unit: "active" },
            { label: "Status", value: studentProfile.registrationStatus, unit: "" },
            { label: "Placement", value: studentProfile.placementStatus, unit: "" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-border p-4 shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-lg text-gray-900">{s.value} <span className="text-xs text-gray-400">{s.unit}</span></p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skill Radar */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" /> Skill Radar
            </h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6b7280" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Radar name="Skills" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Role Readiness */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" /> Role Readiness
            </h3>
          </div>
          <div className="space-y-5">
            {roleReadiness.map((r, i) => (
              <motion.div key={r.role} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{r.role}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.readiness >= 80 ? "success" : r.readiness >= 60 ? "info" : "warning"}>
                      {r.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{r.readiness}%</span>
                  </div>
                </div>
                <ProgressBar value={r.readiness} color={r.color} />
              </motion.div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <GradientButton size="sm" onClick={() => navigate("/student/placements")}>
              View Matching Jobs <ChevronRight className="w-4 h-4 inline" />
            </GradientButton>
          </div>
        </Card>
      </div>

      {/* Detailed Skills */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Detailed Skill Breakdown
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          {detailedSkills.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{s.name}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{s.category}</span>
                </div>
                <span className="text-sm text-gray-500">{s.score}</span>
              </div>
              <ProgressBar value={s.score} color={s.color} size="sm" />
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Platform Activity */}
      <Card>
        <h3 className="text-gray-900 mb-1 flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-indigo-500" /> Platform Activity
        </h3>
        {linkedCount === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400 mb-3">No platforms linked yet.</p>
            <GradientButton size="sm" onClick={() => navigate("/student/link")}>
              Link Platforms
            </GradientButton>
          </div>
        ) : (
          <div className="h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} name="Activity Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" /> Improvement Suggestions
          </h3>
        </div>
        <div className="space-y-4">
          {improvements.map((imp, i) => (
            <motion.div key={imp.area} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {imp.impact === "High" ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                  <span className="text-sm text-gray-900">{imp.area}</span>
                </div>
                <Badge variant={imp.impact === "High" ? "warning" : "info"}>{imp.impact} Impact</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{imp.suggestion}</p>
              <div className="flex flex-wrap gap-2">
                {imp.resources.map((r) => (
                  <span key={r} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">{r}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}