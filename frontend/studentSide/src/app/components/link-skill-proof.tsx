import { useApp, type PlatformKey } from "./app-context";
import { Card, GradientButton, Badge } from "./shared";
import { motion, AnimatePresence } from "motion/react";
import {
  Github, Code2, Trophy, CheckCircle2, Clock, ExternalLink,
  RefreshCw, AlertCircle, Plus, X, Link2, Briefcase, Award,
  Heart, Video, Upload, GraduationCap, BookOpen, Loader2,
  BarChart3
} from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { studentApi, uploadVideoToCloudinary } from "../../lib/api";
import { toast } from "sonner";

// ─── Tab config ──────────────────────────────────────────────────────────────
type TabKey = "platforms" | "experience" | "certifications" | "softskills";

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "platforms", label: "Link Platforms", icon: <Link2 className="w-4 h-4" /> },
  { key: "experience", label: "Experience", icon: <Briefcase className="w-4 h-4" /> },
  { key: "certifications", label: "Certifications", icon: <Award className="w-4 h-4" /> },
  { key: "softskills", label: "Soft Skills", icon: <Heart className="w-4 h-4" /> },
];

// ─── Platform data ────────────────────────────────────────────────────────────
const platforms: {
  key: PlatformKey;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lightBg: string;
  description: string;
  metrics: string[];
  exampleUsername: string;
  urlPattern: string;
}[] = [
  {
    key: "github",
    name: "GitHub",
    icon: Github,
    color: "from-gray-800 to-gray-900",
    lightBg: "bg-gray-50",
    description: "Repositories, contributions, commit history & code quality",
    metrics: ["Real stats load after verification"],
    exampleUsername: "github.com/username",
    urlPattern: "https://github.com/",
  },
  {
    key: "leetcode",
    name: "LeetCode",
    icon: Code2,
    color: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50",
    description: "Problem solving stats, contest ratings & difficulty breakdown",
    metrics: ["Real stats load after verification"],
    exampleUsername: "leetcode.com/u/username",
    urlPattern: "https://leetcode.com/u/",
  },
  {
    key: "codeforces",
    name: "Codeforces",
    icon: Trophy,
    color: "from-blue-500 to-cyan-500",
    lightBg: "bg-blue-50",
    description: "Contest performance, rating trajectory & competitive coding",
    metrics: ["Real stats load after verification"],
    exampleUsername: "codeforces.com/profile/username",
    urlPattern: "https://codeforces.com/profile/",
  },
];

// ─── Experience types ─────────────────────────────────────────────────────────
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

// ─── Certification types ──────────────────────────────────────────────────────
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
];

// ─── Soft skills ──────────────────────────────────────────────────────────────
const softSkillCategories = [
  {
    category: "Communication",
    skills: ["Public Speaking", "Technical Writing", "Active Listening", "Presentation"],
  },
  {
    category: "Leadership",
    skills: ["Team Management", "Mentoring", "Decision Making", "Conflict Resolution"],
  },
  {
    category: "Problem Solving",
    skills: ["Critical Thinking", "Analytical Skills", "Creative Thinking", "Adaptability"],
  },
  {
    category: "Collaboration",
    skills: ["Teamwork", "Cross-functional Communication", "Empathy", "Negotiation"],
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function LinkSkillProof() {
  const [activeTab, setActiveTab] = useState<TabKey>("platforms");

  return (
    <div className="space-y-6 max-w-5xl">
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

      <AnimatePresence mode="wait">
        {activeTab === "platforms" && <PlatformsTab key="platforms" />}
        {activeTab === "experience" && <ExperienceTab key="experience" />}
        {activeTab === "certifications" && <CertificationsTab key="certifications" />}
        {activeTab === "softskills" && <SoftSkillsTab key="softskills" />}
      </AnimatePresence>
    </div>
  );
}

// ─── Platforms Tab ────────────────────────────────────────────────────────────
// NOTE: Connecting a platform is a UI-only action — it stores the URL locally.
// A real integration would send the URL to POST /api/students/profiles/external.
// That endpoint doesn't exist yet in the backend (only userId + platform + url
// model exists via ExternalProfile). We save the platform state in context.
function PlatformsTab() {
  const { authUser, studentProfile, setStudentProfile, linkedPlatforms, setLinkedPlatforms } = useApp();
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);
  const [activePlatform, setActivePlatform] = useState<PlatformKey | null>(null);
  const [showSuccess, setShowSuccess] = useState<PlatformKey | null>(null);
  const [usernameInputs, setUsernameInputs] = useState<Record<string, string>>({});
  const [showInput, setShowInput] = useState<PlatformKey | null>(null);
  const supportedPlatforms = platforms.filter((platform) => ["github", "leetcode", "codeforces"].includes(platform.key));

  const getDynamicMetrics = (platformKey: string, isConnected: boolean) => {
    if (!isConnected || !studentProfile?.externalProfiles) return ["Connect to load real stats"];
    const profile = studentProfile.externalProfiles.find(p => p.platform.toLowerCase() === platformKey);
    if (!profile) return ["Connect to load real stats"];
    if (!profile.stats) return ["Stats loading — reconnect if this persists"];
    const stats = profile.stats as any;
    
    switch (platformKey) {
      case 'github':
        return [
          `${stats.originalReposCount || stats.publicReposCount || 0} repositories`,
          `${stats.totalStars || 0} stars`,
          `${stats.followers || 0} followers`,
          `${(stats.topLanguages || []).slice(0, 3).join(", ") || "No language data"}`
        ];
      case 'leetcode':
        return [
          `${stats.totalSolved || 0} problems solved`,
          `Rating: ${stats.contestRating || 0}`,
          stats.globalRanking ? `Global Rank: ${stats.globalRanking}` : 'Unranked'
        ];
      case 'codeforces':
        return [
          `${stats.totalSolved || 0} problems solved`,
          `Rating: ${stats.contestRating || 0}`,
          `Rank: ${stats.rank || 'N/A'}`
        ];
      default:
        return ["Stats unavailable from platform"];
    }
  };

  const handleRequestVerification = async (key: PlatformKey) => {
    const handle = usernameInputs[key] || "";
    if (!handle.trim()) return;

    setConnecting(key);
    setActivePlatform(key);
    try {
      const res = await studentApi.requestPlatformVerification({ platform: key, handle });
      setVerificationToken(res.token);
      setCurrentProfileId(res.profileId);
      setConnecting(null); 
    } catch (e: any) {
      toast.error(e.message || "Failed to initiate verification");
      setConnecting(null);
      setActivePlatform(null);
    }
  };

  const handleVerify = async () => {
    if (!currentProfileId || !activePlatform) return;
    
    setConnecting(activePlatform);
    try {
      await studentApi.verifyPlatform({ profileId: currentProfileId });
      
      if (authUser) {
        const p = await studentApi.getProfile(authUser.id);
        setStudentProfile(p);
        
        setShowSuccess(activePlatform);
        setVerificationToken(null);
        setCurrentProfileId(null);
        setConnecting(null);
        setActivePlatform(null);
        setShowInput(null);

        try {
          await studentApi.generateSkills();
          const updatedP = await studentApi.getProfile(authUser.id);
          setStudentProfile(updatedP);
        } catch (skillErr) {
          console.error("Skill generation failed:", skillErr);
        }
      }
      
      setTimeout(() => setShowSuccess(null), 3000);
    } catch (e: any) {
      toast.error(e.message || "Verification failed. Make sure you added the token to your profile bio.");
      setConnecting(null);
    }
  };

  const handleDisconnect = async (key: PlatformKey) => {
    try {
      await studentApi.removePlatform(key);
      if (authUser) {
        const p = await studentApi.getProfile(authUser.id);
        setStudentProfile(p);
        await studentApi.generateSkills();
        const updatedP = await studentApi.getProfile(authUser.id);
        setStudentProfile(updatedP);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to disconnect platform");
    }
  };

  const linkedCount = supportedPlatforms.filter((platform) => linkedPlatforms[platform.key]).length;
  const totalPlatforms = supportedPlatforms.length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
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
              Successfully linked {platforms.find((p) => p.key === showSuccess)?.name}!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-gray-900">Verification Progress</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Link your profiles to build your verified skill record
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl text-indigo-600">{linkedCount}/{totalPlatforms}</span>
            <p className="text-xs text-muted-foreground">Platforms linked</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {supportedPlatforms.map((_, i) => (
            <motion.div
              key={i}
              className={`h-2 flex-1 rounded-full ${i < linkedCount ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gray-100"}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
        {linkedCount < 3 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Link GitHub, LeetCode, and Codeforces for the most accurate skill profile
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {supportedPlatforms.map((platform, idx) => {
          const isConnected = linkedPlatforms[platform.key];
          const isConnecting = connecting === platform.key;
          const isShowingInput = showInput === platform.key;

          return (
            <motion.div key={platform.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className={`!p-0 overflow-hidden h-full ${isConnected ? "!border-emerald-200" : ""}`}>
                <div className="flex flex-col h-full">
                  <div className={`px-5 py-3.5 bg-gradient-to-r ${platform.color} flex items-center gap-3`}>
                    <platform.icon className="w-5 h-5 text-white" />
                    <span className="text-white text-sm">{platform.name}</span>
                    {isConnected ? (
                      <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</Badge>
                    ) : (
                      <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Not Linked</Badge>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-xs text-muted-foreground mb-3">{platform.description}</p>

                    {isConnected ? (
                      <>
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          <ExternalLink className="w-3 h-3" />
                          <span>{platform.urlPattern}{studentProfile?.externalProfiles?.find(p => p.platform.toLowerCase() === platform.key)?.url || ""}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {getDynamicMetrics(platform.key, isConnected).map((m) => (
                            <span key={m} className={`text-xs px-2 py-0.5 rounded-full ${platform.lightBg} text-gray-700`}>{m}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-auto">
                          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer">
                            <RefreshCw className="w-3 h-3" /> Refresh
                          </button>
                          <button onClick={() => handleDisconnect(platform.key)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">
                            Disconnect
                          </button>
                        </div>
                      </>
                    ) : activePlatform === platform.key && verificationToken ? (
                      <div className="mt-auto space-y-3">
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                          <p className="text-[10px] text-indigo-600 font-medium mb-1 uppercase tracking-wider">Verification Required</p>
                          <p className="text-xs text-gray-700 mb-2">Add this token to your {platform.name} bio or location:</p>
                          <div className="bg-white border border-indigo-200 rounded px-2 py-1 font-mono text-xs text-indigo-700 select-all">{verificationToken}</div>
                        </div>
                        <div className="flex gap-2">
                          <GradientButton size="sm" onClick={handleVerify} className="flex-1">
                            {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify Now"}
                          </GradientButton>
                          <GradientButton variant="outline" size="sm" onClick={() => { setVerificationToken(null); setConnecting(null); setActivePlatform(null); }}>Cancel</GradientButton>
                        </div>
                      </div>
                    ) : isShowingInput ? (
                      <div className="mt-auto space-y-2">
                        <input
                          type="text"
                          autoFocus
                          placeholder={`Enter your ${platform.name} username`}
                          value={usernameInputs[platform.key] || ""}
                          onChange={(e) => setUsernameInputs((prev) => ({ ...prev, [platform.key]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRequestVerification(platform.key); if (e.key === "Escape") setShowInput(null); }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                        />
                        <div className="flex gap-2">
                          <GradientButton size="sm" onClick={() => handleRequestVerification(platform.key)}>
                            {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Next Step"}
                          </GradientButton>
                          <GradientButton variant="outline" size="sm" onClick={() => setShowInput(null)}>Cancel</GradientButton>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-auto">
                        <GradientButton size="sm" onClick={() => setShowInput(platform.key)} className={isConnecting ? "opacity-70 pointer-events-none" : ""}>
                          Connect {platform.name}
                        </GradientButton>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {[{name: 'HackerRank', icon: Code2, color: 'from-green-500 to-emerald-600', desc: 'Algorithm and data structure challenges'},
          {name: 'CodeChef', icon: Trophy, color: 'from-amber-600 to-orange-700', desc: 'Competitive programming contests'},
          {name: 'HackerEarth', icon: Code2, color: 'from-blue-600 to-indigo-600', desc: 'Enterprise hiring assessments and hackathons'},
          {name: 'GeeksforGeeks', icon: BookOpen, color: 'from-emerald-600 to-teal-700', desc: 'Data structures, algorithms and interview prep'},
          {name: 'Kaggle', icon: BarChart3, color: 'from-cyan-500 to-blue-500', desc: 'Data science competitions and datasets'}
         ].map((platform, idx) => (
          <motion.div key={platform.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (supportedPlatforms.length + idx) * 0.05 }}>
            <Card className="!p-0 overflow-hidden h-full opacity-60 hover:opacity-80 transition-opacity">
              <div className="flex flex-col h-full">
                <div className={`px-5 py-3.5 bg-gradient-to-r ${platform.color} grayscale-[30%] flex items-center gap-3`}>
                  <platform.icon className="w-5 h-5 text-white" />
                  <span className="text-white text-sm">{platform.name}</span>
                  <Badge variant="warning" className="ml-auto"><Clock className="w-3 h-3 mr-1" /> Coming Soon</Badge>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-muted-foreground mb-4">{platform.desc}</p>
                  <div className="mt-auto">
                    <button onClick={() => toast.info(`${platform.name} integration is coming soon!`)} className="w-full py-2 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                      Notify me when available
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          We only read public data from your profiles. Your accounts remain fully under your control.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Experience Tab ───────────────────────────────────────────────────────────
// Stored locally in component state — backend has no experience endpoint
function ExperienceTab() {
  const { studentProfile, setStudentProfile, authUser } = useApp();
  const experiences = studentProfile?.experiences || [];
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", type: "internship", duration: "", description: "", skills: "" });

  const typeColors: Record<string, string> = {
    internship: "bg-blue-50 text-blue-700 border-blue-200",
    fulltime: "bg-emerald-50 text-emerald-700 border-emerald-200",
    project: "bg-purple-50 text-purple-700 border-purple-200",
    freelance: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const handleAdd = async () => {
    if (!form.title.trim() || !form.company.trim()) return;
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        company: form.company,
        type: form.type as any,
        duration: form.duration,
        description: form.description,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean)
      };
      await studentApi.addExperience(payload);
      await studentApi.generateSkills(); // Regenerate skills
      if (authUser) {
        const p = await studentApi.getProfile(authUser.id);
        setStudentProfile(p);
      }
      setForm({ title: "", company: "", type: "internship", duration: "", description: "", skills: "" });
      setShowForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await studentApi.removeExperience(id);
      await studentApi.generateSkills(); // Regenerate skills
      if (authUser) {
        const p = await studentApi.getProfile(authUser.id);
        setStudentProfile(p);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-500" /> Work Experience</h3>
            <p className="text-sm text-muted-foreground mt-1">Add internships, jobs, and projects to strengthen your profile</p>
          </div>
          <GradientButton size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 inline mr-1" /> Add Experience
          </GradientButton>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-gray-50 rounded-xl p-5 mb-5 space-y-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">New Experience</p>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Job Title</label>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Software Intern" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Company</label>
                    <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g., Google" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 cursor-pointer">
                      <option value="internship">Internship</option>
                      <option value="fulltime">Full-time</option>
                      <option value="project">Project</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Duration</label>
                    <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g., Jun 2025 – Aug 2025" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What did you work on? Key achievements..." className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Skills (comma-separated)</label>
                  <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g., React, Python, AWS" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300" />
                </div>
                <div className="flex justify-end">
                  <GradientButton size="sm" onClick={handleAdd} className={loading ? "opacity-50 pointer-events-none" : ""}>
                    {loading ? <Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 inline mr-1" />} Save Experience
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {experiences.length === 0 && <div className="text-center py-8 text-sm text-gray-400">No experiences added yet.</div>}
          {experiences.map((exp) => (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors group">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm text-gray-900">{exp.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[exp.type]}`}>{exp.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{exp.company} · {exp.duration}</p>
                </div>
                <button onClick={() => handleRemove(exp.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-gray-600 mb-2">{exp.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {exp.skills.map((s) => (
                  <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Certifications Tab ───────────────────────────────────────────────────────
function CertificationsTab() {
  const { studentProfile, setStudentProfile, authUser } = useApp();
  const certs = studentProfile?.certifications || [];
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", platform: "Udemy", issueDate: "", credentialUrl: "" });

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await studentApi.addCertification(form);
      await studentApi.generateSkills(); // Regenerate skills
      if (authUser) {
        const p = await studentApi.getProfile(authUser.id);
        setStudentProfile(p);
      }
      setForm({ name: "", platform: "Udemy", issueDate: "", credentialUrl: "" });
      setShowForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await studentApi.removeCertification(id);
      await studentApi.generateSkills(); // Regenerate skills
      if (authUser) {
        const p = await studentApi.getProfile(authUser.id);
        setStudentProfile(p);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <Card>
        <h3 className="text-gray-900 flex items-center gap-2 mb-2"><GraduationCap className="w-5 h-5 text-indigo-500" /> Certification Platforms</h3>
        <p className="text-sm text-muted-foreground mb-4">Link your learning platforms to auto-import certifications</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {certPlatforms.map((cp) => (
            <motion.button
              key={cp.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setForm({ ...form, platform: cp.name });
                setShowForm(true);
              }}
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

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 flex items-center gap-2"><Award className="w-5 h-5 text-indigo-500" /> Your Certifications</h3>
            <p className="text-sm text-muted-foreground mt-1">Add and verify your certificates for credibility</p>
          </div>
          <GradientButton size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 inline mr-1" /> Add Certificate</GradientButton>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-gray-50 rounded-xl p-5 mb-5 space-y-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">New Certification</p>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Certificate Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., AWS Solutions Architect" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Platform</label>
                    <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 cursor-pointer">
                      {certPlatforms.map((cp) => (<option key={cp.name} value={cp.name}>{cp.name}</option>))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Issue Date</label>
                    <input type="text" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} placeholder="e.g., Jan 2026" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Credential URL</label>
                    <input type="text" value={form.credentialUrl} onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <GradientButton size="sm" onClick={handleAdd} className={loading ? "opacity-50 pointer-events-none" : ""}>
                    {loading ? <Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 inline mr-1" />} Save Certificate
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {certs.length === 0 && <div className="text-center py-8 text-sm text-gray-400">No certifications added. Link a platform or add manually.</div>}
          {certs.map((cert) => {
            const cp = certPlatforms.find((p) => p.name === cert.platform) || certPlatforms[certPlatforms.length - 1];
            return (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors group">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cp.color} flex items-center justify-center shrink-0`}><cp.icon className="w-5 h-5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900 truncate">{cert.name}</p>
                    {cert.verified ? (
                      <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>
                    ) : (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-1 w-fit">
                        <Clock className="w-2.5 h-2.5" /> Pending Review
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{cert.platform} · {cert.issueDate}</p>
                </div>
                {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600"><ExternalLink className="w-4 h-4" /></a>}
                <button onClick={() => handleRemove(cert.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><X className="w-4 h-4" /></button>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Soft Skills Tab ──────────────────────────────────────────────────────────
function SoftSkillsTab() {
  const { studentProfile, setStudentProfile, authUser } = useApp();
  const initialSkills = studentProfile?.softSkills?.map(s => s.name) || [];
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const visumeUploaded = !!studentProfile?.videoResumeUrl;

  useEffect(() => {
    setSelectedSkills(studentProfile?.softSkills?.map(s => s.name) || []);
  }, [studentProfile?.softSkills]);

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);

  const saveSoftSkills = async () => {
    setIsSaving(true);
    try {
      await studentApi.updateSoftSkills(selectedSkills);
      if (authUser) {
        const p = await studentApi.getProfile(authUser.id);
        setStudentProfile(p);
      }
      toast.success("Soft skills saved.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save soft skills.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVisumeUpload = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be 100MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const videoUrl = await uploadVideoToCloudinary(file);
      await studentApi.updateProfile({ videoResumeUrl: videoUrl });
      
      if (authUser) {
        const p = await studentApi.getProfile(authUser.id);
        setStudentProfile(p);
      }
      toast.success("Visume uploaded.");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to upload visume");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <Card>
        <h3 className="text-gray-900 flex items-center gap-2 mb-2"><Video className="w-5 h-5 text-indigo-500" /> Visume (Video Resume)</h3>
        <p className="text-sm text-muted-foreground mb-5">Upload a short video introduction. It will be saved to your profile for recruiters to review.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleVisumeUpload(file);
            event.target.value = "";
          }}
        />

        {!visumeUploaded && !uploading ? (
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-8 text-center cursor-pointer transition-colors group">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-100 transition-colors">
              <Upload className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-sm text-gray-700 mb-1">Click to upload your visume</p>
            <p className="text-xs text-gray-400">MP4, MOV, or WebM - Max 100MB</p>
          </div>
        ) : uploading ? (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 text-center border border-indigo-200">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-indigo-700 mb-1">Uploading your visume...</p>
            <p className="text-xs text-indigo-500">Saving the Cloudinary URL to your profile</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-200">
              <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Visume uploaded</p>
                <a href={studentProfile?.videoResumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-700">Open video</a>
              </div>
              <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Saved</Badge>
            </div>
            <button onClick={async () => {
              await studentApi.updateProfile({ videoResumeUrl: "" });
              if (authUser) setStudentProfile(await studentApi.getProfile(authUser.id));
            }} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Remove visume</button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-gray-900 flex items-center gap-2 mb-2"><Heart className="w-5 h-5 text-indigo-500" /> Select Your Soft Skills</h3>
        <p className="text-sm text-muted-foreground mb-5">Choose the soft skills you possess. These are factored into your composite profile score.</p>
        <div className="space-y-5">
          {softSkillCategories.map((cat) => (
            <div key={cat.category}>
              <p className="text-sm text-gray-700 mb-2">{cat.category}</p>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill) => {
                  const selected = selectedSkills.includes(skill);
                  return (
                    <motion.button key={skill} whileTap={{ scale: 0.95 }} onClick={() => toggleSkill(skill)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all cursor-pointer ${selected ? "bg-indigo-50 text-indigo-700 border-indigo-300" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                      {selected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />}{skill}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {selectedSkills.length > 0 && (
          <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-700 mb-2">{selectedSkills.length} soft skill{selectedSkills.length !== 1 ? "s" : ""} selected</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedSkills.map((s) => (<span key={s} className="text-xs bg-white text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">{s}</span>))}
              </div>
            </div>
            <GradientButton size="sm" onClick={saveSoftSkills} className={isSaving ? "opacity-50 pointer-events-none" : ""}>
               {isSaving ? <Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> : "Save Skills"}
            </GradientButton>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
