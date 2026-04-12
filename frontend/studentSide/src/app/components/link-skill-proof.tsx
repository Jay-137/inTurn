import { useApp, type PlatformKey } from "./app-context";
import { Card, GradientButton, Badge } from "./shared";
import { motion, AnimatePresence } from "motion/react";
import {
  Github, Code2, Trophy, CheckCircle2, Clock, ExternalLink,
  RefreshCw, AlertCircle, Plus, X, Link2, Briefcase, Award,
  Heart, Video, Upload, Sparkles, GraduationCap, BookOpen,
  Palette, GitBranch, Brain, Mic, Users, MessageSquare,
  Lightbulb, Handshake, Presentation, PenTool
} from "lucide-react";
import { useState, type ReactNode } from "react";

// ─── Tab config ──────────────────────────────────
type TabKey = "platforms" | "experience" | "certifications" | "softskills";

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "platforms", label: "Link Platforms", icon: <Link2 className="w-4 h-4" /> },
  { key: "experience", label: "Experience", icon: <Briefcase className="w-4 h-4" /> },
  { key: "certifications", label: "Certifications", icon: <Award className="w-4 h-4" /> },
  { key: "softskills", label: "Soft Skills", icon: <Heart className="w-4 h-4" /> },
];

// ─── Platform data ───────────────────────────────
const platforms: {
  key: PlatformKey;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lightBg: string;
  description: string;
  metrics: string[];
  username: string;
}[] = [
  {
    key: "github",
    name: "GitHub",
    icon: Github,
    color: "from-gray-800 to-gray-900",
    lightBg: "bg-gray-50",
    description: "Repositories, contributions, commit history & code quality",
    metrics: ["245 contributions", "18 repositories", "12 stars received"],
    username: "alexjohnson-dev",
  },
  {
    key: "leetcode",
    name: "LeetCode",
    icon: Code2,
    color: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50",
    description: "Problem solving stats, contest ratings & difficulty breakdown",
    metrics: ["342 problems solved", "Rating: 1847", "Top 8% globally"],
    username: "alex_j_codes",
  },
  {
    key: "codeforces",
    name: "Codeforces",
    icon: Trophy,
    color: "from-blue-500 to-cyan-500",
    lightBg: "bg-blue-50",
    description: "Contest performance, rating trajectory & competitive coding",
    metrics: ["Rating: 1523", "67 contests", "Specialist rank"],
    username: "",
  },
  {
    key: "kaggle",
    name: "Kaggle",
    icon: Brain,
    color: "from-sky-500 to-blue-600",
    lightBg: "bg-sky-50",
    description: "Notebooks, competitions, datasets & ML expertise",
    metrics: ["12 notebooks", "3 medals", "Expert tier"],
    username: "",
  },
  {
    key: "figma",
    name: "Figma",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    lightBg: "bg-purple-50",
    description: "Design projects, prototypes & UI/UX portfolio",
    metrics: ["24 projects", "8 team files", "Pro member"],
    username: "",
  },
  {
    key: "gitlab",
    name: "GitLab",
    icon: GitBranch,
    color: "from-orange-500 to-red-500",
    lightBg: "bg-orange-50",
    description: "Repositories, merge requests, CI/CD pipelines & code reviews",
    metrics: ["156 contributions", "9 repositories", "28 MRs merged"],
    username: "",
  },
  {
    key: "codechef",
    name: "CodeChef",
    icon: Code2,
    color: "from-yellow-600 to-amber-700",
    lightBg: "bg-yellow-50",
    description: "Contest ratings, problem solving & competitive programming",
    metrics: ["Rating: 1756", "42 contests", "4★ coder"],
    username: "",
  },
  {
    key: "hackerrank",
    name: "HackerRank",
    icon: Trophy,
    color: "from-emerald-500 to-green-600",
    lightBg: "bg-emerald-50",
    description: "Skill badges, certifications & domain-specific challenges",
    metrics: ["5 gold badges", "3 certifications", "Top 5%"],
    username: "",
  },
];

// ─── Experience data ─────────────────────────────
interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  type: "internship" | "fulltime" | "project" | "freelance";
  duration: string;
  description: string;
  skills: string[];
}

const defaultExperiences: ExperienceEntry[] = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    company: "TechStartup Inc.",
    type: "internship",
    duration: "Jun 2025 – Aug 2025",
    description: "Built responsive dashboard components using React and TypeScript. Improved page load time by 40%.",
    skills: ["React", "TypeScript", "Tailwind CSS"],
  },
];

// ─── Certification data ──────────────────────────
interface CertificationEntry {
  id: string;
  name: string;
  platform: string;
  issueDate: string;
  credentialUrl: string;
  verified: boolean;
}

const certPlatforms = [
  { name: "Udemy", icon: BookOpen, color: "from-purple-600 to-violet-600" },
  { name: "Coursera", icon: GraduationCap, color: "from-blue-600 to-indigo-600" },
  { name: "edX", icon: GraduationCap, color: "from-red-600 to-rose-600" },
  { name: "LinkedIn Learning", icon: BookOpen, color: "from-blue-700 to-sky-600" },
  { name: "Google Certificates", icon: Award, color: "from-green-500 to-emerald-600" },
  { name: "AWS Certifications", icon: Award, color: "from-amber-500 to-orange-600" },
  { name: "Microsoft Learn", icon: Award, color: "from-blue-500 to-cyan-500" },
  { name: "Other", icon: Award, color: "from-gray-600 to-gray-700" },
];

const defaultCerts: CertificationEntry[] = [
  {
    id: "1",
    name: "React - The Complete Guide",
    platform: "Udemy",
    issueDate: "Nov 2025",
    credentialUrl: "https://udemy.com/certificate/abc123",
    verified: true,
  },
  {
    id: "2",
    name: "Machine Learning Specialization",
    platform: "Coursera",
    issueDate: "Sep 2025",
    credentialUrl: "https://coursera.org/verify/xyz789",
    verified: true,
  },
];

// ─── Soft skills data ────────────────────────────
const softSkillCategories = [
  {
    category: "Communication",
    icon: MessageSquare,
    skills: ["Public Speaking", "Technical Writing", "Active Listening", "Presentation", "Storytelling"],
  },
  {
    category: "Leadership",
    icon: Users,
    skills: ["Team Management", "Mentoring", "Decision Making", "Delegation", "Conflict Resolution"],
  },
  {
    category: "Problem Solving",
    icon: Lightbulb,
    skills: ["Critical Thinking", "Analytical Skills", "Creative Thinking", "Adaptability", "Resourcefulness"],
  },
  {
    category: "Collaboration",
    icon: Handshake,
    skills: ["Teamwork", "Cross-functional Communication", "Empathy", "Negotiation", "Feedback Reception"],
  },
];

// ─── Main Component ──────────────────────────────
export function LinkSkillProof() {
  const [activeTab, setActiveTab] = useState<TabKey>("platforms");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Tabs */}
      <Card className="!p-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "platforms" && <PlatformsTab key="platforms" />}
        {activeTab === "experience" && <ExperienceTab key="experience" />}
        {activeTab === "certifications" && <CertificationsTab key="certifications" />}
        {activeTab === "softskills" && <SoftSkillsTab key="softskills" />}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// TAB 1: Link Platforms
// ═══════════════════════════════════════════════════
function PlatformsTab() {
  const { linkedPlatforms, setLinkedPlatforms } = useApp();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const handleConnect = (key: PlatformKey) => {
    setConnecting(key);
    setTimeout(() => {
      setLinkedPlatforms({ ...linkedPlatforms, [key]: true });
      setConnecting(null);
      setShowSuccess(key);
      setTimeout(() => setShowSuccess(null), 3000);
    }, 2000);
  };

  const handleDisconnect = (key: PlatformKey) => {
    setLinkedPlatforms({ ...linkedPlatforms, [key]: false });
  };

  const linkedCount = Object.values(linkedPlatforms).filter(Boolean).length;
  const totalPlatforms = platforms.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Success notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-700">
              Successfully connected {platforms.find((p) => p.key === showSuccess)?.name}! Your skills are being analyzed.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress header */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-gray-900">Verification Progress</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your coding & design platforms to build your verified skill profile
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl text-indigo-600">{linkedCount}/{totalPlatforms}</span>
            <p className="text-xs text-muted-foreground">Platforms linked</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {platforms.map((_, i) => (
            <motion.div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < linkedCount
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                  : "bg-gray-100"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
        {linkedCount < 3 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Link at least 3 platforms for the most accurate skill profile and better job matches
          </div>
        )}
      </Card>

      {/* Platform cards grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {platforms.map((platform, idx) => {
          const isConnected = linkedPlatforms[platform.key];
          const isConnecting = connecting === platform.key;

          return (
            <motion.div
              key={platform.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`!p-0 overflow-hidden h-full ${isConnected ? "!border-emerald-200" : ""}`}>
                <div className="flex flex-col h-full">
                  {/* Header with gradient */}
                  <div className={`px-5 py-3.5 bg-gradient-to-r ${platform.color} flex items-center gap-3`}>
                    <platform.icon className="w-5 h-5 text-white" />
                    <span className="text-white text-sm">{platform.name}</span>
                    {isConnected ? (
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <Clock className="w-3 h-3 mr-1" /> Not Linked
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-xs text-muted-foreground mb-3">{platform.description}</p>

                    {isConnected ? (
                      <>
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          <ExternalLink className="w-3 h-3" />
                          <span>@{platform.username || "connected"}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {platform.metrics.map((m) => (
                            <span key={m} className={`text-xs px-2 py-0.5 rounded-full ${platform.lightBg} text-gray-700`}>
                              {m}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-auto">
                          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer">
                            <RefreshCw className="w-3 h-3" /> Refresh
                          </button>
                          <button
                            onClick={() => handleDisconnect(platform.key)}
                            className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            Disconnect
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto">
                        <GradientButton
                          size="sm"
                          onClick={() => handleConnect(platform.key)}
                          className={isConnecting ? "opacity-70 pointer-events-none" : ""}
                        >
                          {isConnecting ? (
                            <span className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </motion.div>
                              Connecting...
                            </span>
                          ) : (
                            <>Connect {platform.name}</>
                          )}
                        </GradientButton>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground">
          We only read public data from your profiles. Your accounts remain fully under your control.
        </p>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// TAB 2: Experience
// ═══════════════════════════════════════════════════
function ExperienceTab() {
  const [experiences, setExperiences] = useState<ExperienceEntry[]>(defaultExperiences);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    type: "internship" as ExperienceEntry["type"],
    duration: "",
    description: "",
    skills: "",
  });

  const typeColors: Record<string, string> = {
    internship: "bg-blue-50 text-blue-700 border-blue-200",
    fulltime: "bg-emerald-50 text-emerald-700 border-emerald-200",
    project: "bg-purple-50 text-purple-700 border-purple-200",
    freelance: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const handleAdd = () => {
    if (!form.title.trim() || !form.company.trim()) return;
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        title: form.title,
        company: form.company,
        type: form.type,
        duration: form.duration,
        description: form.description,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      },
    ]);
    setForm({ title: "", company: "", type: "internship", duration: "", description: "", skills: "" });
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              Work Experience
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add internships, jobs, projects, and freelance work to strengthen your profile
            </p>
          </div>
          <GradientButton size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 inline mr-1" />
            Add Experience
          </GradientButton>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-50 rounded-xl p-5 mb-5 space-y-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">New Experience</p>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Job Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g., Software Intern"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Company / Organization</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g., Google"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as ExperienceEntry["type"] })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 cursor-pointer"
                    >
                      <option value="internship">Internship</option>
                      <option value="fulltime">Full-time</option>
                      <option value="project">Project</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Duration</label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="e.g., Jun 2025 – Aug 2025"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder="What did you work on? Key achievements..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="e.g., React, Python, AWS"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
                  />
                </div>
                <div className="flex justify-end">
                  <GradientButton size="sm" onClick={handleAdd}>
                    <CheckCircle2 className="w-4 h-4 inline mr-1" /> Save Experience
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Experience list */}
        <div className="space-y-4">
          {experiences.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-400">
              No experiences added yet. Click "Add Experience" to get started.
            </div>
          )}
          {experiences.map((exp) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm text-gray-900">{exp.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[exp.type]}`}>
                      {exp.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{exp.company} · {exp.duration}</p>
                </div>
                <button
                  onClick={() => handleRemove(exp.id)}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-2">{exp.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {exp.skills.map((s) => (
                  <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// TAB 3: Certifications
// ═══════════════════════════════════════════════════
function CertificationsTab() {
  const [certs, setCerts] = useState<CertificationEntry[]>(defaultCerts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    platform: "Udemy",
    issueDate: "",
    credentialUrl: "",
  });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    setCerts([
      ...certs,
      {
        id: Date.now().toString(),
        name: form.name,
        platform: form.platform,
        issueDate: form.issueDate,
        credentialUrl: form.credentialUrl,
        verified: false,
      },
    ]);
    setForm({ name: "", platform: "Udemy", issueDate: "", credentialUrl: "" });
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    setCerts(certs.filter((c) => c.id !== id));
  };

  const handleVerify = (id: string) => {
    setCerts(certs.map((c) => (c.id === id ? { ...c, verified: true } : c)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Certification Platforms */}
      <Card>
        <h3 className="text-gray-900 flex items-center gap-2 mb-2">
          <GraduationCap className="w-5 h-5 text-indigo-500" />
          Certification Platforms
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Link your learning platforms to auto-import certifications
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {certPlatforms.map((cp) => (
            <motion.button
              key={cp.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cp.color} flex items-center justify-center shrink-0`}>
                <cp.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-700 text-left">{cp.name}</span>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Certifications list */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              Your Certifications
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add and verify your certificates for credibility
            </p>
          </div>
          <GradientButton size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 inline mr-1" />
            Add Certificate
          </GradientButton>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-50 rounded-xl p-5 mb-5 space-y-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">New Certification</p>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Certificate Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., AWS Solutions Architect"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Platform</label>
                    <select
                      value={form.platform}
                      onChange={(e) => setForm({ ...form, platform: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 cursor-pointer"
                    >
                      {certPlatforms.map((cp) => (
                        <option key={cp.name} value={cp.name}>{cp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Issue Date</label>
                    <input
                      type="text"
                      value={form.issueDate}
                      onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                      placeholder="e.g., Jan 2026"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Credential URL</label>
                    <input
                      type="text"
                      value={form.credentialUrl}
                      onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <GradientButton size="sm" onClick={handleAdd}>
                    <CheckCircle2 className="w-4 h-4 inline mr-1" /> Save Certificate
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cert list */}
        <div className="space-y-3">
          {certs.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-400">
              No certifications added. Link a platform or add manually.
            </div>
          )}
          {certs.map((cert) => {
            const cp = certPlatforms.find((p) => p.name === cert.platform) || certPlatforms[certPlatforms.length - 1];
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cp.color} flex items-center justify-center shrink-0`}>
                  <cp.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900 truncate">{cert.name}</p>
                    {cert.verified ? (
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    ) : (
                      <button
                        onClick={() => handleVerify(cert.id)}
                        className="text-xs text-indigo-600 hover:underline cursor-pointer"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{cert.platform} · {cert.issueDate}</p>
                </div>
                {cert.credentialUrl && (
                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleRemove(cert.id)}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// TAB 4: Soft Skills
// ═══════════════════════════════════════════════════
function SoftSkillsTab() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Public Speaking",
    "Teamwork",
    "Critical Thinking",
  ]);
  const [visumeUploaded, setVisumeUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSkills, setAiSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleVisumeUpload = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setVisumeUploaded(true);
      setAnalyzing(false);
      setAiSkills(["Confident Communication", "Clear Articulation", "Positive Body Language", "Structured Thinking"]);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Visume Section */}
      <Card>
        <h3 className="text-gray-900 flex items-center gap-2 mb-2">
          <Video className="w-5 h-5 text-indigo-500" />
          Visume (Video Resume)
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Upload a short video introduction (1-3 mins). Our AI analyzes your communication style,
          confidence, and presentation skills to auto-detect soft skills.
        </p>

        {!visumeUploaded && !analyzing ? (
          <div
            onClick={handleVisumeUpload}
            className="border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-8 text-center cursor-pointer transition-colors group"
          >
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-100 transition-colors">
              <Upload className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-sm text-gray-700 mb-1">Click to upload your visume</p>
            <p className="text-xs text-gray-400">MP4, MOV, or WebM · Max 100MB · 1-3 minutes recommended</p>
          </div>
        ) : analyzing ? (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 text-center border border-indigo-200">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-md"
            >
              <Sparkles className="w-6 h-6 text-indigo-500" />
            </motion.div>
            <p className="text-sm text-indigo-700 mb-1">AI is analyzing your visume...</p>
            <p className="text-xs text-indigo-500">Detecting communication patterns, body language & presentation style</p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 rounded-full bg-indigo-400"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Uploaded visume preview */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-200">
              <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">visume_alex_johnson.mp4</p>
                <p className="text-xs text-gray-500">2:34 duration · Uploaded just now</p>
              </div>
              <Badge variant="success">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Analyzed
              </Badge>
            </div>

            {/* AI-detected skills */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-indigo-800">AI-Detected Soft Skills</span>
              </div>
              <p className="text-xs text-indigo-600 mb-3">
                Based on your visume analysis, we identified these additional soft skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {aiSkills.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-3 py-1.5 rounded-lg text-sm bg-white text-indigo-700 border border-indigo-200 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setVisumeUploaded(false);
                setAiSkills([]);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Re-upload visume
            </button>
          </div>
        )}
      </Card>

      {/* Manual Soft Skills Selection */}
      <Card>
        <h3 className="text-gray-900 flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-indigo-500" />
          Select Your Soft Skills
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Choose the soft skills you possess. These are factored into your composite profile score.
        </p>

        <div className="space-y-5">
          {softSkillCategories.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center gap-2 mb-2.5">
                <cat.icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{cat.category}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill) => {
                  const selected = selectedSkills.includes(skill);
                  return (
                    <motion.button
                      key={skill}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all cursor-pointer ${
                        selected
                          ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {selected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />}
                      {skill}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selectedSkills.length > 0 && (
          <div className="mt-5 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
            <p className="text-xs text-indigo-700 mb-2">{selectedSkills.length} soft skill{selectedSkills.length !== 1 ? "s" : ""} selected</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map((s) => (
                <span key={s} className="text-xs bg-white text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}