import { Card, GradientButton, ProgressBar, Badge } from "./shared";
import { motion } from "motion/react";
import {
  BarChart3, TrendingUp, Target, Lightbulb, ArrowUpRight,
  CheckCircle2, AlertTriangle, ChevronRight, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp, PlatformKey } from "./app-context";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

// Static mock data removed. Charts are now dynamically populated from the backend profile.

export function SkillProfile() {
  const navigate = useNavigate();
  const { studentProfile, authUser, linkedPlatforms } = useApp();

  // Bar chart data: real platforms from linkedPlatforms + real stats
  const getStatValue = (platform: string) => {
    const p = studentProfile?.externalProfiles?.find(ep => ep.platform.toLowerCase() === platform.toLowerCase());
    if (!p || !p.stats) return 0;
    const stats = p.stats as any;
    if (platform === "github") return stats.originalReposCount || stats.publicReposCount || stats.totalRepos || stats.repos || 0;
    if (platform === "leetcode") return stats.totalSolved || 0;
    if (platform === "codeforces") return stats.rating || stats.contestRating || 0;
    return 0;
  };

  const barData = [
    { name: "GitHub", score: getStatValue("github"), label: "Repositories" },
    { name: "LeetCode", score: getStatValue("leetcode"), label: "Solved" },
    { name: "Codeforces", score: getStatValue("codeforces"), label: "Rating" },
  ].filter(d => linkedPlatforms[d.name.toLowerCase() as PlatformKey]);

  const linkedCount = Object.values(linkedPlatforms).filter(Boolean).length;

  // Overall score: (CGPA * 4) + (Solved * 0.1) + (Skills * 5)
  const solvedCount = (studentProfile?.externalProfiles?.find(p => p.platform === "leetcode")?.stats as any)?.totalSolved || 0;
  const skillPoints = (studentProfile?.skills?.length || 0) * 5;
  const cgpaPoints = (studentProfile?.cgpa || 0) * 4;
  
  const overallScore = studentProfile 
    ? Math.min(Math.round(cgpaPoints + (solvedCount * 0.1) + skillPoints + (linkedCount * 5)), 100)
    : 0;

  const radarData = studentProfile?.skills?.map(s => ({
    subject: s.skill?.name || "Skill",
    score: Math.round(s.score * 100),
    fullMark: 100
  })) || [];

  const detailedSkills = studentProfile?.skills?.map(s => ({
    name: s.skill?.name || "Skill",
    score: Math.round(s.score * 100),
    category: s.skill?.type || "General",
    color: "indigo" as const
  })) || [];

  const getRank = (score: number) => {
    if (score >= 90) return "Top 1%";
    if (score >= 80) return "Top 5%";
    if (score >= 70) return "Top 15%";
    if (score >= 50) return "Top 30%";
    return "Emerging";
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Composite Score Header */}
      <Card className="!bg-gradient-to-r !from-indigo-500 !to-purple-600 !border-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h2 className="text-xl text-white mb-1">Composite Skill Score</h2>
            <p className="text-indigo-100 text-sm">
              {linkedCount > 0
                ? `Verified across ${linkedCount} platform${linkedCount > 1 ? "s" : ""}`
                : "Link coding platforms to verify your skills"}
            </p>
            {studentProfile && (
              <p className="text-indigo-200 text-xs mt-1">
                {studentProfile.user?.name} · {studentProfile.academicUnit?.name} · {studentProfile.university?.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/30"
              >
                <span className="text-3xl text-white font-bold">{overallScore}</span>
              </motion.div>
              <p className="text-xs text-indigo-200 mt-2 font-medium">Overall Score</p>
            </div>
            <div className="hidden md:block text-right space-y-1">
              <div className="flex items-center gap-2 text-sm justify-end">
                <span className="text-indigo-200">Rank:</span>
                <Badge variant="priority">{getRank(overallScore)}</Badge>
              </div>
              <p className="text-xs text-indigo-200">Synced with backend</p>
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
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <Radar name="Skills" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Link your platform profiles to generate skill graphs
              </div>
            )}
          </div>
        </Card>

        {/* Detailed Skills */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Detailed Skill Breakdown
            </h3>
          </div>
          {detailedSkills.length > 0 ? (
            <div className="grid md:grid-cols-1 gap-x-8 gap-y-4">
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
          ) : (
             <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                No skills detected yet.
             </div>
          )}
        </Card>
      </div>

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
    </div>
  );
}