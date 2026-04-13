import { useState, useEffect } from "react";
import { Card, GradientButton, ProgressBar, Badge, MatchScoreCircle } from "./shared";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "./app-context";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, MapPin, Clock, Zap, Filter, Search,
  ChevronDown, Building2, Star, ArrowRight, CheckCircle2, X,
  Target, TrendingUp, AlertCircle, Sparkles, Eye, EyeOff, Loader2
} from "lucide-react";
import { jobApi, type Job } from "../../lib/api";

// ─── Static metadata since backend doesn't store location/tags/salary ────────

const LOCATIONS = ["Remote", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Hybrid"];
const TAG_SETS = [
  ["React", "TypeScript", "Tailwind CSS"],
  ["Python", "Django", "PostgreSQL"],
  ["Node.js", "React", "MongoDB"],
  ["Go", "Docker", "AWS"],
  ["Java", "Spring Boot", "Kafka"],
  ["TypeScript", "GraphQL", "Apollo"],
  ["Python", "TensorFlow", "NLP"],
  ["AWS", "Kubernetes", "Terraform"],
];
const ROLE_MAP = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes("frontend") || t.includes("react") || t.includes("ui")) return "Frontend Developer";
  if (t.includes("backend") || t.includes("node") || t.includes("java")) return "Backend Developer";
  if (t.includes("full stack") || t.includes("full-stack")) return "Full Stack Developer";
  if (t.includes("data") && t.includes("sci")) return "Data Scientist";
  if (t.includes("ml") || t.includes("ai") || t.includes("machine")) return "AI/ML Engineer";
  if (t.includes("devops") || t.includes("cloud") || t.includes("sre")) return "DevOps Engineer";
  if (t.includes("intern")) return "SDE Intern";
  return "SDE-1";
};

function getJobExtras(job: Job) {
  return {
    location: LOCATIONS[job.id % LOCATIONS.length],
    tags: TAG_SETS[job.id % TAG_SETS.length],
    salary: job.minCgpa >= 8 ? `${10 + job.id % 8}–${16 + job.id % 6} LPA` : `${30 + job.id % 20}K/month`,
    role: ROLE_MAP(job.title),
    type: job.title.toLowerCase().includes("intern") ? "Internship" : "Full-time",
    posted: `${(job.id % 6) + 1} day${(job.id % 6) + 1 === 1 ? "" : "s"} ago`,
    // Simulated skill alignment for UI (backend doesn't expose this pre-apply)
    skillAlignment: [
      { skill: "Primary Skill", match: 75 + (job.id % 20) },
      { skill: "DSA", match: 70 + (job.id % 25) },
      { skill: "Databases", match: 60 + (job.id % 30) },
      { skill: "System Design", match: 40 + (job.id % 40) },
    ],
    description: `Join us as ${job.title}. Min CGPA ${job.minCgpa} required. Deadline: ${new Date(job.deadline).toLocaleDateString()}. Max ${job.maxBacklogs} active backlog(s) allowed.`,
  };
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

type EnrichedJob = Job & ReturnType<typeof getJobExtras> & {
  match: number;
  eligible: boolean;
};

function JobCard({
  job,
  isApplied,
  isExpanded,
  onToggleExpand,
  onApply,
  applying,
  preferredRoles,
  showMatchingTags,
}: {
  job: EnrichedJob;
  isApplied: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onApply: () => void;
  applying: boolean;
  preferredRoles?: string[];
  showMatchingTags?: boolean;
}) {
  const isDeadlinePassed = new Date() > new Date(job.deadline);
  const isMatched = showMatchingTags && job.match >= 70 && preferredRoles?.includes(job.role);
  const isEligible = showMatchingTags && job.match >= 70 && !preferredRoles?.includes(job.role);

  return (
    <Card hover className={`cursor-pointer ${isMatched ? "!border-indigo-200 !bg-indigo-50/20" : ""}`}>
      <div onClick={onToggleExpand}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-gray-900">{job.title}</h3>
                {isMatched && <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Matched</Badge>}
                {isEligible && <Badge variant="info"><Target className="w-3 h-3 mr-1" /> Eligible</Badge>}
                {showMatchingTags && !isApplied && job.match < 70 && (
                  <Badge variant="neutral"><AlertCircle className="w-3 h-3 mr-1" /> Low match</Badge>
                )}
                {isApplied && <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Applied</Badge>}
                {isDeadlinePassed && <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Closed</Badge>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.posted}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.type}</span>
              </div>
            </div>
          </div>
          <MatchScoreCircle score={job.match} size={56} />
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {job.tags.map((t) => (
            <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{t}</span>
          ))}
          <span className="text-xs text-gray-500 ml-2">{job.salary}</span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span>Min CGPA: <strong className="text-gray-700">{job.minCgpa}</strong></span>
          <span>Max Backlogs: <strong className="text-gray-700">{job.maxBacklogs}</strong></span>
          <span>Deadline: <strong className="text-gray-700">{new Date(job.deadline).toLocaleDateString()}</strong></span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-4">{job.description}</p>

              <h4 className="text-sm text-gray-900 mb-3">Estimated Skill Alignment</h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {job.skillAlignment.map((s) => (
                  <div key={s.skill}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{s.skill}</span>
                      <span className="text-xs text-gray-500">{s.match}%</span>
                    </div>
                    <ProgressBar
                      value={s.match}
                      color={s.match >= 80 ? "emerald" : s.match >= 60 ? "indigo" : "amber"}
                      size="sm"
                    />
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mb-4 italic">
                * Actual match score is calculated by the backend when you apply.
              </p>

              {!isApplied && !isDeadlinePassed ? (
                <div className="flex items-center gap-3">
                  <GradientButton size="sm" onClick={onApply} className={applying ? "opacity-70 pointer-events-none" : ""}>
                    {applying ? (
                      <><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Applying…</>
                    ) : (
                      <>Apply Now <ArrowRight className="w-4 h-4 inline ml-1" /></>
                    )}
                  </GradientButton>
                  <GradientButton variant="outline" size="sm">
                    <Star className="w-4 h-4 inline mr-1" /> Save
                  </GradientButton>
                </div>
              ) : isDeadlinePassed ? (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Clock className="w-4 h-4" /> Application deadline has passed
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Application submitted successfully
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function JobMatches() {
  const { appliedJobs, addAppliedJob, preferredRoles, studentProfile } = useApp();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [applyingJob, setApplyingJob] = useState<number | null>(null);
  const [applyError, setApplyError] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<"matches" | "all">("matches");
  const [includeNotMatched, setIncludeNotMatched] = useState(false);
  const [showConfirm, setShowConfirm] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    jobApi
      .getJobs()
      .then(setJobs)
      .catch(() => setError("Failed to load jobs. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  // Enrich jobs with static metadata + match estimation
  function estimateMatch(job: Job): number {
    if (!studentProfile) return 55;
    let score = 65;
    if (studentProfile.cgpa >= job.minCgpa) score += 20;
    if (studentProfile.backlogCount <= job.maxBacklogs) score += 10;
    if (studentProfile.cgpa >= 8.5) score += 5;
    return Math.min(score, 98);
  }

  const enrichedJobs: EnrichedJob[] = jobs.map((j) => ({
    ...j,
    ...getJobExtras(j),
    match: estimateMatch(j),
    eligible: studentProfile
      ? studentProfile.cgpa >= j.minCgpa && studentProfile.backlogCount <= j.maxBacklogs
      : false,
  }));

  const handleApply = async (jobId: number) => {
    setApplyingJob(jobId);
    setApplyError({});
    try {
      const res = await jobApi.applyForJob(jobId);
      addAppliedJob(String(jobId));
      setShowConfirm(null);
      setExpandedJob(null);
      // Show actual match score returned by backend
      if (res.application.matchScore !== null) {
        const score = Math.round(res.application.matchScore * 100);
        console.log(`Backend match score for job ${jobId}: ${score}%`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Application failed.";
      setApplyError((prev) => ({ ...prev, [jobId]: msg }));
    } finally {
      setApplyingJob(null);
    }
  };

  const uniqueRoles = ["All", ...Array.from(new Set(enrichedJobs.map((j) => j.role)))];

  const matchedJobs = preferredRoles.length > 0
    ? enrichedJobs.filter((j) => preferredRoles.includes(j.role) && j.match >= 70)
    : [];

  const allFilteredJobs = enrichedJobs
    .filter((j) => {
      if (roleFilter !== "All" && j.role !== roleFilter) return false;
      if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (!includeNotMatched && j.match < 70 && !appliedJobs.includes(String(j.id))) return false;
      return true;
    })
    .sort((a, b) => b.match - a.match);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="ml-3 text-sm text-gray-500">Loading placement drives…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-red-600">{error}</p>
        <GradientButton size="sm" onClick={() => { setError(""); setLoading(true); jobApi.getJobs().then(setJobs).finally(() => setLoading(false)); }}>
          Retry
        </GradientButton>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("matches")}
          className={`px-5 py-2 rounded-lg text-sm transition-all cursor-pointer ${
            activeTab === "matches" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Target className="w-4 h-4 inline mr-1.5" />
          Job Matches
          {matchedJobs.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
              {matchedJobs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-2 rounded-lg text-sm transition-all cursor-pointer ${
            activeTab === "all" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Briefcase className="w-4 h-4 inline mr-1.5" />
          All Jobs
          <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
            {enrichedJobs.length}
          </span>
        </button>
      </div>

      {/* ── JOB MATCHES TAB ── */}
      {activeTab === "matches" && (
        <div className="space-y-5">
          {preferredRoles.length === 0 ? (
            <Card>
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-gray-900 mb-2">No preferred roles selected</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                  Go to your Dashboard and select up to 2 preferred roles to see matched jobs here.
                </p>
                <GradientButton size="sm" onClick={() => navigate("/student")}>
                  Go to Dashboard
                </GradientButton>
              </div>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-indigo-600">
                  <Target className="w-4 h-4" /> Matching roles:
                </div>
                {preferredRoles.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs">
                    <Sparkles className="w-3 h-3" /> {r}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-gray-900">{matchedJobs.length}</span> jobs matching your preferred roles
              </p>
              <div className="space-y-4">
                {matchedJobs.map((job, idx) => (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    {applyError[job.id] && (
                      <div className="mb-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {applyError[job.id]}
                      </div>
                    )}
                    <JobCard
                      job={job}
                      isApplied={appliedJobs.includes(String(job.id))}
                      isExpanded={expandedJob === job.id}
                      onToggleExpand={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                      onApply={() => setShowConfirm(job.id)}
                      applying={applyingJob === job.id}
                      preferredRoles={preferredRoles}
                      showMatchingTags
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ALL JOBS TAB ── */}
      {activeTab === "all" && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              Browse all available placement drives. Match scores are estimated — actual scores are calculated when you apply.
            </p>
          </div>

          <Card className="!p-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {uniqueRoles.map((f) => (
                  <button
                    key={f}
                    onClick={() => setRoleFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      roleFilter === f ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="text-gray-900">{allFilteredJobs.length}</span> positions
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIncludeNotMatched(!includeNotMatched)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  includeNotMatched
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {includeNotMatched ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                Include Low Match
              </button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Sorted by match</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {allFilteredJobs.map((job, idx) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                {applyError[job.id] && (
                  <div className="mb-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {applyError[job.id]}
                  </div>
                )}
                <JobCard
                  job={job}
                  isApplied={appliedJobs.includes(String(job.id))}
                  isExpanded={expandedJob === job.id}
                  onToggleExpand={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  onApply={() => setShowConfirm(job.id)}
                  applying={applyingJob === job.id}
                  preferredRoles={preferredRoles}
                  showMatchingTags
                />
              </motion.div>
            ))}
            {allFilteredJobs.length === 0 && (
              <Card>
                <div className="text-center py-10 text-sm text-gray-400">
                  No jobs found matching your search criteria.
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Confirm Apply Modal */}
      <AnimatePresence>
        {showConfirm !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Confirm Application</h3>
                <button onClick={() => setShowConfirm(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                You're applying to{" "}
                <span className="text-gray-900 font-medium">
                  {enrichedJobs.find((j) => j.id === showConfirm)?.title}
                </span>.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Your verified skill profile will be submitted. The platform will calculate your match score automatically.
              </p>
              {!studentProfile && (
                <div className="mb-4 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  You haven't set up your student profile yet. The application may fail eligibility checks.
                </div>
              )}
              <div className="flex gap-3">
                <GradientButton
                  className="flex-1"
                  onClick={() => { handleApply(showConfirm!); setShowConfirm(null); }}
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-1" /> Confirm & Apply
                </GradientButton>
                <GradientButton variant="outline" onClick={() => setShowConfirm(null)}>
                  Cancel
                </GradientButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}