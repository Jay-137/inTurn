import { useState, useRef } from "react";
import {
  FileText, ArrowRight, ArrowLeft, CheckCircle2, Plus, X, Briefcase,
  GraduationCap, Filter, ChevronDown, Trash2, Upload, Info, Save,
  SlidersHorizontal, Sparkles,
} from "lucide-react";
import { useTheme } from "./theme-context";
import { AcademicUnitSelector } from "./academic-unit-selector";

const steps = ["Job Details", "Eligibility Criteria", "Skill Requirements", "Review & Post"];

/* ─── Multi-Select Dropdown ─── */
function MultiSelect({
  label, options, selected, setSelected, dk,
}: {
  label: string; options: string[]; selected: string[]; setSelected: (v: string[]) => void; dk: boolean;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: string) => {
    setSelected(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  return (
    <div className="relative">
      <label className={`text-sm mb-2 block ${dk ? "text-white" : "text-gray-900"}`}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full text-left text-sm px-4 py-3 rounded-lg border outline-none transition-colors flex items-center justify-between ${
          dk ? "bg-white/[0.04] border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"
        }`}
      >
        <span className={selected.length === 0 ? (dk ? "text-gray-500" : "text-gray-400") : ""}>
          {selected.length === 0 ? `Select ${label.toLowerCase()}...` : `${selected.length} selected`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""} ${dk ? "text-gray-500" : "text-gray-400"}`} />
      </button>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((s) => (
            <span key={s} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
              dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
            }`}>
              {s}
              <button type="button" onClick={() => toggle(s)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className={`absolute z-20 mt-1 w-full rounded-lg border shadow-lg max-h-52 overflow-y-auto ${
            dk ? "bg-[#18181f] border-white/10" : "bg-white border-gray-200"
          }`}>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                  selected.includes(opt)
                    ? dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                    : dk ? "text-gray-300 hover:bg-white/[0.04]" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt}
                {selected.includes(opt) && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Types ─── */
type CriteriaType = "number_gt" | "number_lt" | "yes_no";
interface CustomCriterion {
  id: string;
  name: string;
  type: CriteriaType;
  value: string;
}

type PriorityLevel = "p1" | "p2" | "p3" | "good";
interface SkillEntry {
  id: string;
  name: string;
  priority: PriorityLevel;
}

const PRIORITY_MAP: Record<PriorityLevel, string> = {
  p1: "HIGH",
  p2: "MEDIUM",
  p3: "LOW",
  good: "GOOD_TO_HAVE",
};

const priorityConfig: Record<PriorityLevel, { label: string; desc: string; color: string; bg: string; bgDk: string; text: string; textDk: string; border: string; borderDk: string }> = {
  p1: { label: "Priority 1", desc: "Must-have — critical for the role", color: "#22c55e", bg: "bg-green-50", bgDk: "bg-green-500/10", text: "text-green-600", textDk: "text-green-400", border: "border-green-200", borderDk: "border-green-500/20" },
  p2: { label: "Priority 2", desc: "Important — strongly preferred", color: "#3b82f6", bg: "bg-blue-50", bgDk: "bg-blue-500/10", text: "text-blue-600", textDk: "text-blue-400", border: "border-blue-200", borderDk: "border-blue-500/20" },
  p3: { label: "Priority 3", desc: "Helpful — adds to candidacy", color: "#f59e0b", bg: "bg-amber-50", bgDk: "bg-amber-500/10", text: "text-amber-600", textDk: "text-amber-400", border: "border-amber-200", borderDk: "border-amber-500/20" },
  good: { label: "Good to Have", desc: "Bonus — nice but not required", color: "#6b7280", bg: "bg-gray-50", bgDk: "bg-white/[0.04]", text: "text-gray-600", textDk: "text-gray-400", border: "border-gray-200", borderDk: "border-white/10" },
};

const recommendedSkills = [
  "TypeScript", "Node.js", "Python", "Java", "SQL", "MongoDB",
  "Docker", "AWS", "Git", "REST APIs", "GraphQL", "System Design",
];

export function PostJob({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const [step, setStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 0 - Job Details
  const [jobTitle, setJobTitle] = useState("");
  const [roleLevel, setRoleLevel] = useState("SDE-1");
  const [location, setLocation] = useState("Remote");
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Step 1 - Eligibility
  const [gradYears, setGradYears] = useState<string[]>(["2026"]);
  const [branches, setBranches] = useState<string[]>(["CSE"]);
  const [degrees, setDegrees] = useState<string[]>(["B.Tech"]);
  const [backlogsAllowed, setBacklogsAllowed] = useState(false);
  const [minCGPA, setMinCGPA] = useState("");
  const [min10th, setMin10th] = useState("");
  const [min12th, setMin12th] = useState("");
  const [customCriteria, setCustomCriteria] = useState<CustomCriterion[]>([]);
  const [showAddCriteria, setShowAddCriteria] = useState(false);
  const [newCriteriaName, setNewCriteriaName] = useState("");
  const [newCriteriaType, setNewCriteriaType] = useState<CriteriaType>("number_gt");
  const [newCriteriaValue, setNewCriteriaValue] = useState("");

  // Step 2 - Skills (priority-based)
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([
    { id: "1", name: "Data Structures & Algorithms", priority: "p1" },
    { id: "2", name: "Frontend (React/JS)", priority: "p2" },
    { id: "3", name: "Backend (Node/Python/Java)", priority: "p3" },
    { id: "4", name: "DevOps & Tools", priority: "good" },
  ]);
  const [addingToPriority, setAddingToPriority] = useState<PriorityLevel | null>(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [minExp, setMinExp] = useState("0-1 years");

  const card = `rounded-xl border ${dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-300"}`;
  const muted = dk ? "text-gray-400" : "text-gray-500";
  const heading = dk ? "text-white" : "text-gray-900";
  const inputCls = `w-full text-sm px-4 py-3 rounded-lg border outline-none transition-colors ${
    dk ? "bg-white/[0.04] border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
  }`;
  const selectCls = `text-sm px-4 py-3 rounded-lg border outline-none cursor-pointer transition-colors ${
    dk ? "bg-white/[0.04] border-white/10 text-white focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
  }`;
  const labelCls = `text-sm mb-2 block ${heading}`;

  const addCustomCriterion = () => {
    if (!newCriteriaName.trim()) return;
    setCustomCriteria([...customCriteria, { id: Date.now().toString(), name: newCriteriaName.trim(), type: newCriteriaType, value: newCriteriaValue }]);
    setNewCriteriaName(""); setNewCriteriaType("number_gt"); setNewCriteriaValue(""); setShowAddCriteria(false);
  };

  const addSkillToRow = (priority: PriorityLevel) => {
    if (!newSkillName.trim()) return;
    setSkillEntries([...skillEntries, { id: Date.now().toString(), name: newSkillName.trim(), priority }]);
    setNewSkillName(""); setAddingToPriority(null);
  };

  const addRecommendedSkill = (name: string) => {
    if (skillEntries.some((s) => s.name === name)) return;
    // Add to lowest priority that has no skills, or p1
    const priorities: PriorityLevel[] = ["p1", "p2", "p3", "good"];
    const emptyP = priorities.find((p) => !skillEntries.some((s) => s.priority === p));
    setSkillEntries([...skillEntries, { id: Date.now().toString(), name, priority: emptyP || "good" }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file.name);
  };

  const handleSaveDraft = () => {
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2000);
  };

  const handlePost = async () => {
    setPosting(true);
    setPostError("");
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: jobTitle,
        deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString(), // default 30 days
        minCgpa: minCGPA ? parseFloat(minCGPA) : 0,
        maxBacklogs: backlogsAllowed ? 99 : 0,
        targetBranches: branches,
        targetYears: gradYears.map(Number),
        location,
        salary,
        type: roleLevel,
        tags: [],
        skills: skillEntries.map(s => ({
          skillName: s.name,
          priority: PRIORITY_MAP[s.priority]
        }))
      };
      const res = await fetch("http://localhost:3000/api/companies/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to post job");
      }
      setShowSuccess(true);
    } catch (err: any) {
      setPostError(err.message || "Failed to post job");
    } finally {
      setPosting(false);
    }
  };

  const criteriaTypeLabel = (t: CriteriaType) =>
    t === "number_gt" ? "Greater than" : t === "number_lt" ? "Less than" : "Yes / No";

  const totalSkills = skillEntries.length;
  const priorityCount = new Set(skillEntries.map((s) => s.priority)).size;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md mx-4 rounded-2xl p-8 text-center ${dk ? "bg-[#111116] border border-white/10" : "bg-white"} shadow-2xl`}>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className={`text-xl mb-2 ${heading}`}>Job Posted Successfully!</h3>
            <p className={`text-sm mb-6 ${muted}`}>
              Your job posting "{jobTitle || "Untitled"}" is now live and visible to candidates.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowSuccess(false); onNavigate("post-job"); setStep(0); setJobTitle(""); setDescription(""); setSalary(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm transition-colors ${
                  dk ? "bg-white/[0.04] text-gray-300 hover:bg-white/[0.08]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Post Another
              </button>
              <button
                onClick={() => { setShowSuccess(false); onNavigate("job-postings"); }}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
              >
                View Postings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-0">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  i < step ? "bg-green-500 text-white" : i === step ? "bg-blue-600 text-white" : dk ? "bg-white/[0.06] text-gray-500" : "bg-gray-100 text-gray-400"
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs whitespace-nowrap hidden sm:inline ${i === step ? (dk ? "text-white" : "text-gray-900") : muted}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${i < step ? "bg-green-500" : dk ? "bg-white/10" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Step 0: Job Details ─── */}
      {step === 0 && (
        <div className={`${card} p-6 space-y-5`}>
          <div className="flex items-center gap-2 mb-1">
            <FileText className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-base ${heading}`}>Job Details</h2>
          </div>

          <div>
            <label className={labelCls}>Job Title</label>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., SDE-1 Frontend Engineer" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Role Level</label>
              <select value={roleLevel} onChange={(e) => setRoleLevel(e.target.value)} className={`${selectCls} w-full`}>
                <option>Intern</option><option>Fresher</option><option>SDE-1</option><option>SDE-2</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className={`${selectCls} w-full`}>
                <option>Remote</option><option>On-site</option><option>Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Application Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Salary Range</label>
            <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g., 12-18 LPA" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Job Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and what you're looking for..." rows={5} className={`${inputCls} resize-none`} />
          </div>

          {/* Upload JD */}
          <div>
            <label className={labelCls}>Upload JD (Optional)</label>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileUpload} />
            {uploadedFile ? (
              <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${dk ? "bg-white/[0.04] border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
                  <span className={`text-sm ${heading}`}>{uploadedFile}</span>
                </div>
                <button onClick={() => setUploadedFile(null)} className={dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex flex-col items-center gap-2 py-6 rounded-lg border-2 border-dashed transition-colors ${
                  dk ? "border-white/10 hover:border-white/20 text-gray-500 hover:text-gray-400" : "border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-500"
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm">Click to upload PDF, DOC, or TXT</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Step 1: Eligibility Criteria ─── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className={`${card} p-6 space-y-5`}>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
              <h2 className={`text-base ${heading}`}>Eligibility Criteria</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MultiSelect label="Graduation Year" options={["2024", "2025", "2026", "2027", "2028"]} selected={gradYears} setSelected={setGradYears} dk={dk} />
              <MultiSelect label="Degree" options={["B.Tech", "M.Tech", "B.E.", "M.E.", "BCA", "MCA", "B.Sc", "M.Sc"]} selected={degrees} setSelected={setDegrees} dk={dk} />
            </div>

            <AcademicUnitSelector
              dk={dk}
              label="Target Branches"
              multi
              excludeTypes={["Section"]}
              selected={branches}
              onSelect={(sel) => setBranches(sel.map(s => s.name))}
            />

            <div>
              <label className={labelCls}>Backlogs Allowed</label>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button key={String(val)} type="button" onClick={() => setBacklogsAllowed(val)}
                    className={`flex-1 py-3 rounded-lg border text-sm transition-colors ${
                      backlogsAllowed === val ? "bg-blue-600 border-blue-600 text-white"
                        : dk ? "bg-white/[0.04] border-white/10 text-gray-400 hover:border-white/20" : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}>{val ? "Yes" : "No"}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Criteria */}
          <div className={`${card} p-6 space-y-5`}>
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
              <h2 className={`text-base ${heading}`}>Additional Criteria</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Minimum CGPA</label>
                <input type="number" step="0.1" min="0" max="10" value={minCGPA} onChange={(e) => setMinCGPA(e.target.value)} placeholder="e.g., 7.0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>10th Percentage</label>
                <input type="number" min="0" max="100" value={min10th} onChange={(e) => setMin10th(e.target.value)} placeholder="e.g., 60" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>12th Percentage</label>
                <input type="number" min="0" max="100" value={min12th} onChange={(e) => setMin12th(e.target.value)} placeholder="e.g., 60" className={inputCls} />
              </div>
            </div>

            {customCriteria.length > 0 && (
              <div className="space-y-3">
                <p className={`text-xs ${muted}`}>Custom Criteria</p>
                {customCriteria.map((c) => (
                  <div key={c.id} className={`flex items-center justify-between p-3.5 rounded-lg border ${dk ? "bg-white/[0.02] border-white/10" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`text-sm ${heading}`}>{c.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${dk ? "bg-white/[0.06] text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                        {c.type === "yes_no" ? (c.value === "yes" ? "Yes" : "No") : `${criteriaTypeLabel(c.type)} ${c.value}`}
                      </span>
                    </div>
                    <button type="button" onClick={() => setCustomCriteria(customCriteria.filter((x) => x.id !== c.id))} className={`p-1.5 rounded-lg transition-colors ${dk ? "hover:bg-white/5 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddCriteria ? (
              <div className={`p-4 rounded-lg border space-y-4 ${dk ? "bg-white/[0.02] border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${heading}`}>Add Custom Criterion</p>
                  <button type="button" onClick={() => setShowAddCriteria(false)} className={dk ? "text-gray-500" : "text-gray-400"}><X className="w-4 h-4" /></button>
                </div>
                <div>
                  <label className={labelCls}>Criterion Name</label>
                  <input value={newCriteriaName} onChange={(e) => setNewCriteriaName(e.target.value)} placeholder="e.g., Communication Skills, Projects Count" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={newCriteriaType} onChange={(e) => { const t = e.target.value as CriteriaType; setNewCriteriaType(t); if (t === "yes_no") setNewCriteriaValue("yes"); else setNewCriteriaValue(""); }} className={`${selectCls} w-full`}>
                    <option value="number_gt">Greater than (number)</option>
                    <option value="number_lt">Less than (number)</option>
                    <option value="yes_no">Yes / No</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Value</label>
                  {newCriteriaType === "yes_no" ? (
                    <div className="flex gap-3">
                      {["yes", "no"].map((v) => (
                        <button key={v} type="button" onClick={() => setNewCriteriaValue(v)}
                          className={`flex-1 py-3 rounded-lg border text-sm capitalize transition-colors ${
                            newCriteriaValue === v ? "bg-blue-600 border-blue-600 text-white" : dk ? "bg-white/[0.04] border-white/10 text-gray-400" : "bg-white border-gray-300 text-gray-600"
                          }`}>{v}</button>
                      ))}
                    </div>
                  ) : (
                    <input type="number" value={newCriteriaValue} onChange={(e) => setNewCriteriaValue(e.target.value)} placeholder="Enter value..." className={inputCls} />
                  )}
                </div>
                <button type="button" onClick={addCustomCriterion} disabled={!newCriteriaName.trim() || (newCriteriaType !== "yes_no" && !newCriteriaValue)}
                  className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Add Criterion
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowAddCriteria(true)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed text-sm transition-colors ${
                  dk ? "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300" : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                }`}>
                <Plus className="w-4 h-4" /> Add Custom Criterion
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Step 2: Skill Requirements & Weights ─── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className={`${card} p-6 space-y-5`}>
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
              <h2 className={`text-base ${heading}`}>Skill Requirements & Weights</h2>
            </div>
            <p className={`text-sm ${muted} -mt-2`}>
              Rank skills by importance. Click <span className={heading}>Add</span> on a priority row to assign skills. The AI uses these rankings to match candidates.
            </p>

            {/* Priority Table */}
            <div className={`rounded-lg border overflow-hidden ${dk ? "border-white/10" : "border-gray-200"}`}>
              {/* Header */}
              <div className={`grid grid-cols-[200px_1fr] text-xs px-4 py-2.5 ${dk ? "bg-white/[0.02] text-gray-500" : "bg-gray-50 text-gray-500"}`}>
                <span>PRIORITY RANK</span>
                <span>SKILLS</span>
              </div>

              {(["p1", "p2", "p3", "good"] as PriorityLevel[]).map((p, idx) => {
                const cfg = priorityConfig[p];
                const rowSkills = skillEntries.filter((s) => s.priority === p);
                return (
                  <div key={p} className={`grid grid-cols-[200px_1fr] px-4 py-4 items-center ${
                    idx < 3 ? `border-b ${dk ? "border-white/5" : "border-gray-100"}` : ""
                  }`}>
                    <div>
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full ${dk ? cfg.bgDk + " " + cfg.textDk : cfg.bg + " " + cfg.text}`}>
                        {cfg.label}
                      </span>
                      <p className={`text-xs mt-1.5 ${muted}`}>{cfg.desc}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {rowSkills.map((skill) => (
                        <span key={skill.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${
                          dk ? cfg.bgDk + " " + cfg.textDk + " " + cfg.borderDk : cfg.bg + " " + cfg.text + " " + cfg.border
                        }`}>
                          {skill.name}
                          <button onClick={() => setSkillEntries(skillEntries.filter((s) => s.id !== skill.id))}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {addingToPriority === p ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") addSkillToRow(p); if (e.key === "Escape") { setAddingToPriority(null); setNewSkillName(""); } }}
                            placeholder="Skill name..."
                            className={`text-xs px-3 py-1.5 rounded-full border outline-none w-36 ${
                              dk ? "bg-white/[0.04] border-white/10 text-white placeholder-gray-600" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                            }`}
                          />
                          <button onClick={() => addSkillToRow(p)} className={`text-xs ${dk ? cfg.textDk : cfg.text}`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setAddingToPriority(null); setNewSkillName(""); }} className={muted}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingToPriority(p); setNewSkillName(""); }}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border border-dashed transition-colors ${
                            dk ? "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-400" : "border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
                          }`}
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary info */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${dk ? "bg-green-500/5 border border-green-500/10" : "bg-green-50 border border-green-100"}`}>
              <Info className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-sm text-green-600">{totalSkills} skills assigned across {priorityCount} priority levels</span>
            </div>

            {/* Minimum Experience */}
            <div>
              <label className={labelCls}>Minimum Experience</label>
              <select value={minExp} onChange={(e) => setMinExp(e.target.value)} className={`${selectCls} w-full`}>
                <option>0-1 years</option><option>1-2 years</option><option>2-4 years</option><option>4+ years</option>
              </select>
            </div>
          </div>

          {/* Recommended Skills */}
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className={`w-4 h-4 ${dk ? "text-amber-400" : "text-amber-500"}`} />
              <h3 className={`text-sm ${heading}`}>Recommended Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendedSkills.map((skill) => {
                const added = skillEntries.some((s) => s.name === skill);
                return (
                  <button
                    key={skill}
                    disabled={added}
                    onClick={() => addRecommendedSkill(skill)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      added
                        ? dk ? "bg-green-500/10 text-green-400 border-green-500/20 cursor-default" : "bg-green-50 text-green-600 border-green-200 cursor-default"
                        : dk ? "border-white/10 text-gray-400 hover:border-blue-500/30 hover:text-blue-400 hover:bg-blue-500/5" : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {added ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 3: Review & Post ─── */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Job Details */}
          <div className={`${card} p-6 space-y-4`}>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
              <h2 className={`text-base ${heading}`}>Job Details</h2>
            </div>
            {[
              { label: "Job Title", value: jobTitle || "—" },
              { label: "Role Level", value: roleLevel },
              { label: "Location", value: location },
              { label: "Salary Range", value: salary || "—" },
              { label: "Deadline", value: deadline || "30 days from now" },
              ...(uploadedFile ? [{ label: "Uploaded JD", value: uploadedFile }] : []),
            ].map((r) => (
              <div key={r.label} className={`flex justify-between py-2.5 border-b ${dk ? "border-white/5" : "border-gray-100"}`}>
                <span className={`text-sm ${muted}`}>{r.label}</span>
                <span className={`text-sm ${heading}`}>{r.value}</span>
              </div>
            ))}
            {description && (
              <div className="pt-1">
                <p className={`text-sm ${muted} mb-1`}>Description</p>
                <p className={`text-sm ${dk ? "text-gray-300" : "text-gray-700"}`}>{description}</p>
              </div>
            )}
          </div>

          {/* Eligibility */}
          <div className={`${card} p-6 space-y-4`}>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
              <h2 className={`text-base ${heading}`}>Eligibility Criteria</h2>
            </div>
            {[
              { label: "Graduation Year", value: gradYears.join(", ") || "—" },
              { label: "Degree", value: degrees.join(", ") || "—" },
              { label: "Branches", value: branches.join(", ") || "—" },
              { label: "Backlogs Allowed", value: backlogsAllowed ? "Yes" : "No" },
              ...(minCGPA ? [{ label: "Minimum CGPA", value: `≥ ${minCGPA}` }] : []),
              ...(min10th ? [{ label: "10th Percentage", value: `≥ ${min10th}%` }] : []),
              ...(min12th ? [{ label: "12th Percentage", value: `≥ ${min12th}%` }] : []),
            ].map((r) => (
              <div key={r.label} className={`flex justify-between py-2.5 border-b ${dk ? "border-white/5" : "border-gray-100"}`}>
                <span className={`text-sm ${muted}`}>{r.label}</span>
                <span className={`text-sm ${heading}`}>{r.value}</span>
              </div>
            ))}
            {customCriteria.map((c) => (
              <div key={c.id} className={`flex justify-between py-2.5 border-b ${dk ? "border-white/5" : "border-gray-100"}`}>
                <span className={`text-sm ${muted}`}>{c.name}</span>
                <span className={`text-sm ${heading}`}>{c.type === "yes_no" ? (c.value === "yes" ? "Yes" : "No") : `${c.type === "number_gt" ? ">" : "<"} ${c.value}`}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className={`${card} p-6 space-y-4`}>
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
              <h2 className={`text-base ${heading}`}>Skill Requirements</h2>
            </div>
            {(["p1", "p2", "p3", "good"] as PriorityLevel[]).map((p) => {
              const cfg = priorityConfig[p];
              const rowSkills = skillEntries.filter((s) => s.priority === p);
              if (rowSkills.length === 0) return null;
              return (
                <div key={p} className={`flex justify-between py-2.5 border-b ${dk ? "border-white/5" : "border-gray-100"}`}>
                  <span className={`text-sm ${muted}`}>{cfg.label}</span>
                  <span className={`text-sm text-right ${heading}`}>{rowSkills.map((s) => s.name).join(", ")}</span>
                </div>
              );
            })}
            <div className={`flex justify-between py-2.5 border-b ${dk ? "border-white/5" : "border-gray-100"}`}>
              <span className={`text-sm ${muted}`}>Min Experience</span>
              <span className={`text-sm ${heading}`}>{minExp}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pb-8">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-colors ${
              dk ? "bg-white/[0.04] text-gray-300 hover:bg-white/[0.08]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Save as Draft */}
          <button onClick={handleSaveDraft} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${
            savedDraft
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : dk ? "bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] border border-white/10" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
          }`}>
            {savedDraft ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {savedDraft ? "Saved!" : "Save as Draft"}
          </button>

          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
              Next: {steps[step + 1]} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button onClick={handlePost} disabled={posting} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors disabled:opacity-50">
                <CheckCircle2 className="w-4 h-4" /> {posting ? "Posting…" : "Post Job"}
              </button>
              {postError && <p className="text-xs text-red-500 mt-1">{postError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
