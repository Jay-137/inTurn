import { useState, useEffect } from "react";
import { Card, GradientButton, Badge, MatchScoreCircle } from "./shared";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "./app-context";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, MapPin, Clock, Search,
  Building2, ArrowRight, CheckCircle2, X,
  Target, TrendingUp, AlertCircle, Sparkles, Loader2, AlertTriangle, ShieldCheck
} from "lucide-react";
import { jobApi, studentApi, type Job } from "../../lib/api";

type EnrichedJob = Job & {
  role: string;
  location: string;
  tags: string[];
  salary: string;
  type: string;
  posted: string;
  description: string;
  match: number | null;      // null = not yet checked
  eligible: boolean | null;   // null = not yet checked
  feedback: string[];
};

// ─── Job Card Component ──────────────────────────────────────────────────────

function JobCard({
  job,
  isApplied,
  isExpanded,
  onToggleExpand,
  onApply,
  onCheckEligibility,
  applying,
  checking,
  preferredRoles,
  showMatchingTags,
  applicationDetails,
  isPlaced,
}: {
  job: EnrichedJob;
  isApplied: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onApply: () => void;
  onCheckEligibility: () => void;
  applying: boolean;
  checking: boolean;
  preferredRoles?: string[];
  showMatchingTags?: boolean;
  applicationDetails?: any;
  isPlaced?: boolean;
}) {
  const isDeadlinePassed = new Date() > new Date(job.deadline);
  const hasScore = job.match !== null;
  const isMatched = showMatchingTags && hasScore && (job.match ?? 0) >= 70 && preferredRoles?.some(r => r.toLowerCase() === job.role.toLowerCase());

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
                {isApplied && (
                  <Badge variant={
                    applicationDetails?.status?.includes("REJECTED") ? "warning" :
                    applicationDetails?.status === "PENDING_REVIEW" ? "info" :
                    "success"
                  }>
                    {applicationDetails?.status === "REJECTED_BY_UNIVERSITY" ? "Rejected by University" :
                     applicationDetails?.status === "PENDING_REVIEW" ? "Pending University Review" :
                     applicationDetails?.status ? applicationDetails.status.replace(/_/g, " ") : "Applied"}
                  </Badge>
                )}
                {isDeadlinePassed && <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Closed</Badge>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.posted}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.type}</span>
              </div>
            </div>
          </div>
          {/* Only show score circle AFTER user has checked eligibility */}
          {hasScore ? (
            <MatchScoreCircle score={job.match!} size={56} />
          ) : (
            <div className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3" /> Not checked
            </div>
          )}
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

              {applicationDetails?.status === "REJECTED_BY_UNIVERSITY" && applicationDetails?.universityRemarks && (
                <div className="mb-4 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span><strong>University Remarks:</strong> {applicationDetails.universityRemarks}</span>
                </div>
              )}

              {/* Eligibility Feedback (only shown after checking) */}
              {job.feedback.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm text-gray-900 mb-2">Match Breakdown</h4>
                  <div className="space-y-1.5">
                    {job.feedback.map((msg, idx) => (
                      <div key={idx} className={`text-xs p-2.5 rounded-lg flex items-start gap-2 ${
                        msg.startsWith("✓")
                          ? "bg-emerald-50 text-emerald-700"
                          : msg.startsWith("~")
                            ? "bg-amber-50 text-amber-700"
                            : msg.startsWith("✗")
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-50 text-gray-600"
                      }`}>
                        {msg.startsWith("✓") ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        ) : msg.startsWith("~") ? (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        ) : msg.startsWith("✗") ? (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        )}
                        <span>{msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasScore && (
                <p className="text-xs text-gray-400 mb-4 italic">
                  * Match score is calculated based on skill priorities set by the recruiter.
                </p>
              )}

              {isPlaced ? (
                <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                  <ShieldCheck className="w-4 h-4" />
                  You are placed. Applications are disabled.
                </div>
              ) : !isApplied && !isDeadlinePassed ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <GradientButton size="sm" onClick={onApply} className={applying ? "opacity-70 pointer-events-none" : ""}>
                      {applying ? (
                        <><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Applying…</>
                      ) : (
                        <>Apply Now <ArrowRight className="w-4 h-4 inline ml-1" /></>
                      )}
                    </GradientButton>
                    <GradientButton
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCheckEligibility();
                      }}
                      className={checking ? "opacity-70 pointer-events-none" : ""}
                    >
                      {checking ? (
                        <><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Checking…</>
                      ) : (
                        <><Sparkles className="w-4 h-4 inline mr-1" /> {hasScore ? "Recheck" : "Check Eligibility"}</>
                      )}
                    </GradientButton>
                  </div>
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
  const { appliedJobs, applicationsMap, addAppliedJob, preferredRoles, studentProfile, setStudentProfile, authUser } = useApp();
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

  // Per-job eligibility state
  const [checkingJob, setCheckingJob] = useState<number | null>(null);
  const [jobScores, setJobScores] = useState<Record<number, { match: number; feedback: string[]; eligible: boolean }>>({});
  const [checkError, setCheckError] = useState<Record<number, string>>({});

  useEffect(() => {
    setLoading(true);
    jobApi
      .getJobs()
      .then(setJobs)
      .catch(() => setError("Failed to load jobs. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Check eligibility for a specific job.
   * 1. Generate/refresh skill vector
   * 2. Re-fetch jobs (which re-runs evaluateEligibility on the backend)
   * 3. Extract the score for this specific job
   */
  const handleCheckEligibility = async (jobId: number) => {
    setCheckingJob(jobId);
    setCheckError((prev) => ({ ...prev, [jobId]: "" }));
    try {
      // Step 1: Regenerate the student's skill vector from linked platforms
      await studentApi.generateSkills();

      // Step 2: Re-fetch jobs (backend runs evaluateEligibility per job per student)
      const updatedJobs = await jobApi.getJobs();
      setJobs(updatedJobs);

      // Step 3: Extract the score for this specific job
      const thisJob: any = updatedJobs.find((j: any) => j.id === jobId);
      if (thisJob) {
        setJobScores((prev) => ({
          ...prev,
          [jobId]: {
            match: thisJob.matchScore ?? 0,
            feedback: thisJob.feedback || [],
            eligible: thisJob.eligibilityStatus ?? false,
          },
        }));
      }

      // Refresh student profile
      if (authUser) {
        const p = await studentApi.getProfile(authUser.id);
        setStudentProfile(p);
      }
    } catch (err: any) {
      console.error("Failed to check eligibility", err);
      const msg = err.response?.data?.error || err.message || "Unknown error";
      setCheckError((prev) => ({ ...prev, [jobId]: msg }));
    } finally {
      setCheckingJob(null);
    }
  };

  // Build enriched jobs — merge backend data with per-job checked state
  const enrichedJobs: EnrichedJob[] = jobs.map((j: any) => {
    const checkedData = jobScores[j.id];
    return {
      ...j,
      role: j.title,
      location: j.location || "Remote",
      tags: Array.isArray(j.tags) ? j.tags : ["General"],
      salary: j.salary || "Unspecified",
      type: j.type || "Full-time",
      posted: "Recently",
      description: `Join us as ${j.title}. Min CGPA ${j.minCgpa} required. Max ${j.maxBacklogs} active backlog(s) allowed.`,
      // Only show match after user explicitly checks
      match: checkedData ? checkedData.match : null,
      eligible: checkedData ? checkedData.eligible : null,
      feedback: checkedData ? checkedData.feedback : [],
    };
  });

  const handleApply = async (jobId: number) => {
    setApplyingJob(jobId);
    setApplyError({});
    try {
      const res = await jobApi.applyForJob(jobId);
      addAppliedJob(String(jobId));
      setShowConfirm(null);
      setExpandedJob(null);
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

  // Match tab: only show jobs that have been checked AND meet the threshold
  const matchedJobs = preferredRoles.length > 0
    ? enrichedJobs.filter((j) =>
        preferredRoles.some(role => role.toLowerCase() === j.role.toLowerCase()) &&
        j.match !== null &&
        j.match >= 70
      )
    : [];

  const allFilteredJobs = enrichedJobs
    .filter((j) => {
      if (roleFilter !== "All" && j.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
      if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => (b.match ?? -1) - (a.match ?? -1));

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

  const isPlaced = studentProfile?.placementStatus === 'PLACED';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Placed Banner */}
      {isPlaced && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-indigo-900">You have been placed!</p>
            <p className="text-xs text-indigo-600 mt-0.5">Congratulations! Your placement has been confirmed by your university. Job applications are now disabled.</p>
          </div>
        </div>
      )}

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
                {matchedJobs.length > 0 ? (
                  <><span className="text-gray-900">{matchedJobs.length}</span> jobs matching your preferred roles with ≥70% alignment</>
                ) : (
                  <>Click "Check Eligibility" on jobs in the All Jobs tab to see your matches here.</>
                )}
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
                      onCheckEligibility={() => handleCheckEligibility(job.id)}
                      applying={applyingJob === job.id}
                      checking={checkingJob === job.id}
                      preferredRoles={preferredRoles}
                      showMatchingTags
                      applicationDetails={applicationsMap[String(job.id)]}
                      isPlaced={isPlaced}
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
              Click "Check Eligibility" on any job to see your match score and a detailed skill breakdown.
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
                {checkError[job.id] && (
                  <div className="mb-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {checkError[job.id]}
                  </div>
                )}
                <JobCard
                  job={job}
                  isApplied={appliedJobs.includes(String(job.id))}
                  isExpanded={expandedJob === job.id}
                  onToggleExpand={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  onApply={() => setShowConfirm(job.id)}
                  onCheckEligibility={() => handleCheckEligibility(job.id)}
                  applying={applyingJob === job.id}
                  checking={checkingJob === job.id}
                  preferredRoles={preferredRoles}
                  showMatchingTags
                  applicationDetails={applicationsMap[String(job.id)]}
                  isPlaced={isPlaced}
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