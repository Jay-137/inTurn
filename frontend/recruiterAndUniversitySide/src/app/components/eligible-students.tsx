import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  SlidersHorizontal, Filter, Users, UserCheck, TrendingUp, Briefcase,
  ArrowUpDown, GraduationCap, BookOpen, Layers, Loader2,
} from "lucide-react";
import { useTheme } from "./theme-context";
import { toast } from "sonner";
import { AcademicUnitSelector } from "./academic-unit-selector";

const API_BASE = "http://localhost:3000/api";
function getToken() { return localStorage.getItem("token") || ""; }

/* ─── Shared Filter Type ─── */
export type EligibleFilters = {
  academicUnitId?: number;
  course?: string;
  streams?: string[];
  departments?: string[];
  sections?: string[];
  contextLabel?: string;
};

/* ─── Filter option constants ─── */
const GRAD_YEARS = ["2024", "2025", "2026", "2027"];

type Student = {
  id: number | string; name: string; course: string; stream: string; dept: string;
  section: string; cgpa: number; tenth: number; twelfth: number; year: string;
  status: string; internship: boolean; internshipDetails: string;
  email: string; phone: string;
};
type SortKey = "cgpa" | "tenth" | "twelfth";
type SearchType = "uid" | "name" | "email" | "phone";
type ModalTab = "overview" | "academics" | "experience";

const SEARCH_TYPES: { key: SearchType; label: string }[] = [
  { key: "uid", label: "UID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone Number" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "cgpa", label: "CGPA" },
  { key: "tenth", label: "10th Marks" },
  { key: "twelfth", label: "12th Marks" },
];

const PAGE_SIZE = 8;

/* ─── Sub-components ─── */

function MultiSelectDropdown({
  label, options, selected, onChange, dk,
}: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void; dk: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
          dk
            ? "bg-[#111116] border-white/10 text-gray-300 hover:border-white/20"
            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
        }`}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${dk ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
            {selected.length}
          </span>
        )}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className={`absolute left-0 top-full mt-1 z-20 w-44 rounded-xl border shadow-xl p-1 ${
          dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"
        }`}>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                selected.includes(opt)
                  ? dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                  : dk ? "text-gray-300 hover:bg-white/[0.04]" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
                selected.includes(opt)
                  ? "bg-blue-600 border-blue-600 text-white"
                  : dk ? "border-gray-600" : "border-gray-300"
              }`}>
                {selected.includes(opt) && "✓"}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SingleSelectDropdown({
  label, options, selected, onChange, dk,
}: {
  label: string; options: string[]; selected: string; onChange: (v: string) => void; dk: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
          dk
            ? "bg-[#111116] border-white/10 text-gray-300 hover:border-white/20"
            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
        }`}
      >
        <span>{selected || label}</span>
        {selected && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className={`ml-0.5 rounded-full w-3.5 h-3.5 flex items-center justify-center ${dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
          >
            <X className="w-2.5 h-2.5" />
          </span>
        )}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className={`absolute left-0 top-full mt-1 z-20 w-44 rounded-xl border shadow-xl p-1 ${
          dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"
        }`}>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                selected === opt
                  ? dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                  : dk ? "text-gray-300 hover:bg-white/[0.04]" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RangeSlider({
  label, min, max, value, onChange, step = 0.1, decimals = 1, dk,
}: {
  label: string; min: number; max: number; value: [number, number];
  onChange: (v: [number, number]) => void; step?: number; decimals?: number; dk: boolean;
}) {
  const [lo, hi] = value;
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className={`text-xs ${dk ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
        <span className={`text-xs ${dk ? "text-gray-300" : "text-gray-700"}`}>
          {lo.toFixed(decimals)} – {hi.toFixed(decimals)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range" min={min} max={max} step={step} value={lo}
          onChange={(e) => onChange([Math.min(+e.target.value, hi - step), hi])}
          className="flex-1 accent-blue-600 h-1"
        />
        <input
          type="range" min={min} max={max} step={step} value={hi}
          onChange={(e) => onChange([lo, Math.max(+e.target.value, lo + step)])}
          className="flex-1 accent-blue-600 h-1"
        />
      </div>
    </div>
  );
}

/* ─── Student Detail Modal ─── */
function StudentModal({ student, onClose, dk, onMarkPlaced }: {
  student: Student; onClose: () => void; dk: boolean;
  onMarkPlaced?: (studentId: number | string) => void;
}) {
  const [tab, setTab] = useState<ModalTab>("overview");
  const card = `rounded-xl border ${dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"}`;
  const muted = dk ? "text-gray-400" : "text-gray-500";
  const heading = dk ? "text-white" : "text-gray-900";
  const [showPlacement, setShowPlacement] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");
  const [selectedJobId, setSelectedJobId] = useState<number | "">("");
  const [placementLoading, setPlacementLoading] = useState(false);

  useEffect(() => {
    if (showPlacement && companies.length === 0) {
      fetch(`${API_BASE}/university/students/${student.id}/shortlisted-companies`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
        .then(r => r.ok ? r.json() : { companies: [] })
        .then(data => setCompanies(data.companies || []))
        .catch(() => {});
    }
  }, [showPlacement, student.id]);

  const handleUnplace = async () => {
    setPlacementLoading(true);
    try {
      const res = await fetch(`${API_BASE}/university/students/${student.id}/placement`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        toast.success(`${student.name} un-marked as placed!`);
        onMarkPlaced?.(student.id);
        onClose();
      } else {
        toast.error("Failed to un-mark as placed.");
      }
    } catch {
      toast.error("An error occurred.");
    }
    setPlacementLoading(false);
  };

  const handleConfirmPlacement = async () => {
    if (!selectedCompanyId || !selectedJobId) return;
    setPlacementLoading(true);
    try {
      const res = await fetch(`${API_BASE}/university/students/${student.id}/placement`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ companyId: selectedCompanyId, jobId: selectedJobId }),
      });
      if (res.ok) {
        toast.success(`${student.name} marked as placed!`);
        onMarkPlaced?.(student.id);
        onClose();
      } else {
        toast.error("Failed to mark as placed.");
      }
    } catch {
      toast.error("An error occurred.");
    }
    setPlacementLoading(false);
  };

  const tabs: { key: ModalTab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: Layers },
    { key: "academics", label: "Academics", icon: BookOpen },
    { key: "experience", label: "Experience", icon: GraduationCap },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-lg rounded-2xl border shadow-2xl ${dk ? "bg-[#0d0d12] border-white/10" : "bg-gray-50 border-gray-200"}`}>
        {/* Header */}
        <div className={`px-6 pt-6 pb-4 border-b ${dk ? "border-white/8" : "border-gray-200"}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm shrink-0 ${dk ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h2 className={`${heading}`}>{student.name}</h2>
                <p className={`text-xs mt-0.5 ${muted}`}>{student.id} · CGPA {student.cgpa.toFixed(1)}</p>
                <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${
                  student.status === "Placed"
                    ? dk ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"
                    : dk ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-700"
                }`}>
                  {student.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${dk ? "hover:bg-white/5 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    active
                      ? dk ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"
                      : dk ? "text-gray-400 hover:text-gray-300 hover:bg-white/[0.04]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-6 py-5 space-y-3">
          {tab === "overview" && (
            <>
              <div className={`grid grid-cols-2 gap-3`}>
                {[
                  { label: "Course", value: student.course },
                  { label: "Stream", value: student.stream },
                  { label: "Department", value: student.dept },
                  { label: "Section", value: student.section },
                  { label: "Graduation Year", value: student.year },
                  { label: "Email", value: student.email },
                  { label: "Phone", value: student.phone },
                ].map((row) => (
                  <div key={row.label} className={`rounded-xl p-3 ${dk ? "bg-white/[0.03]" : "bg-white border border-gray-100"}`}>
                    <p className={`text-[10px] uppercase tracking-wide mb-1 ${muted}`}>{row.label}</p>
                    <p className={`text-xs ${heading}`}>{row.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "academics" && (
            <div className="space-y-3">
              {[
                { label: "CGPA", value: `${student.cgpa.toFixed(1)} / 10`, bar: student.cgpa / 10, color: "bg-blue-600" },
                { label: "10th Marks", value: `${student.tenth}%`, bar: student.tenth / 100, color: "bg-indigo-500" },
                { label: "12th Marks", value: `${student.twelfth}%`, bar: student.twelfth / 100, color: "bg-violet-500" },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-4 ${dk ? "bg-white/[0.03]" : "bg-white border border-gray-100"}`}>
                  <div className="flex justify-between mb-2">
                    <span className={`text-xs ${muted}`}>{item.label}</span>
                    <span className={`text-xs ${heading}`}>{item.value}</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full ${dk ? "bg-white/5" : "bg-gray-100"}`}>
                    <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.bar * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "experience" && (
            <div>
              {student.internship ? (
                <div className={`rounded-xl p-4 ${dk ? "bg-white/[0.03]" : "bg-white border border-gray-100"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dk ? "bg-green-500/10" : "bg-green-50"}`}>
                      <GraduationCap className={`w-3.5 h-3.5 ${dk ? "text-green-400" : "text-green-600"}`} />
                    </div>
                    <span className={`text-xs ${dk ? "text-green-400" : "text-green-600"}`}>Has Internship Experience</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${dk ? "text-gray-300" : "text-gray-700"}`}>{student.internshipDetails}</p>
                </div>
              ) : (
                <div className={`rounded-xl p-6 text-center ${dk ? "bg-white/[0.02]" : "bg-gray-50 border border-gray-100"}`}>
                  <p className={`text-sm ${muted}`}>No internship experience on record.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mark Placed / Unplace Section */}
        {student.status !== "Placed" && !showPlacement && (
          <div className={`px-6 pb-5 border-t ${dk ? "border-white/8" : "border-gray-200"} pt-4`}>
            <button
              onClick={() => setShowPlacement(true)}
              className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> Mark as Placed
            </button>
          </div>
        )}
        {student.status === "Placed" && !showPlacement && (
          <div className={`px-6 pb-5 border-t ${dk ? "border-white/8" : "border-gray-200"} pt-4`}>
            <button
              onClick={handleUnplace}
              disabled={placementLoading}
              className={`w-full py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${dk ? "bg-red-500/10 hover:bg-red-500/20 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"}`}
            >
              {placementLoading ? "Processing..." : "Unplace Student"}
            </button>
          </div>
        )}
        {showPlacement && (
          <div className={`px-6 pb-5 border-t ${dk ? "border-white/8" : "border-gray-200"} pt-4 space-y-3`}>
            <p className={`text-xs font-medium ${heading}`}>Mark as Placed</p>
            {companies.length === 0 ? (
              <p className={`text-xs ${muted}`}>Student must be shortlisted by at least one recruiter to be marked as placed.</p>
            ) : (
              <>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => { setSelectedCompanyId(e.target.value ? Number(e.target.value) : ""); setSelectedJobId(""); }}
                  className={`w-full p-2 rounded-lg border text-xs outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  <option value="">Select Company...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {selectedCompanyId !== "" && (
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : "")}
                    className={`w-full p-2 rounded-lg border text-xs outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  >
                    <option value="">Select Job...</option>
                    {companies.find(c => c.id === selectedCompanyId)?.jobs?.map((j: any) => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                )}
              </>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowPlacement(false); setSelectedCompanyId(""); setSelectedJobId(""); }} className={`px-3 py-1.5 text-xs rounded-lg border ${dk ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button>
              <button onClick={handleConfirmPlacement} disabled={companies.length === 0 || !selectedCompanyId || !selectedJobId || placementLoading} className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-50">
                {placementLoading ? "Saving..." : "Confirm Placement"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Advanced Filters Modal ─── */
function AdvancedModal({
  onClose, dk, cgpaRange, setCgpaRange, internship, setInternship,
}: {
  onClose: () => void; dk: boolean;
  cgpaRange: [number, number]; setCgpaRange: (v: [number, number]) => void;
  internship: string; setInternship: (v: string) => void;
}) {
  const muted = dk ? "text-gray-400" : "text-gray-500";
  const heading = dk ? "text-white" : "text-gray-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md rounded-2xl border shadow-2xl ${dk ? "bg-[#0d0d12] border-white/10" : "bg-white border-gray-200"}`}>
        <div className={`px-6 pt-5 pb-4 border-b flex items-center justify-between ${dk ? "border-white/8" : "border-gray-200"}`}>
          <h2 className={`text-sm ${heading}`}>Advanced Filters</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${dk ? "hover:bg-white/5 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-6">
          <div>
            <p className={`text-xs mb-3 ${muted}`}>CGPA Range</p>
            <RangeSlider label="" min={0} max={10} value={cgpaRange} onChange={setCgpaRange} step={0.1} decimals={1} dk={dk} />
          </div>
          <div>
            <p className={`text-xs mb-3 ${muted}`}>Internship Experience</p>
            <div className="flex gap-2">
              {["Any", "Yes", "No"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setInternship(opt)}
                  className={`px-4 py-1.5 rounded-lg text-xs border transition-colors ${
                    internship === opt
                      ? dk ? "bg-blue-500/15 border-blue-500/30 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"
                      : dk ? "border-white/10 text-gray-400 hover:border-white/20" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={`px-6 pb-5`}>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function EligibleStudents({ initialFilters }: { initialFilters?: EligibleFilters }) {
  const { theme } = useTheme();
  const dk = theme === "dark";

  const card = `rounded-xl border ${dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"}`;
  const muted = dk ? "text-gray-400" : "text-gray-500";
  const heading = dk ? "text-white" : "text-gray-900";

  /* ─── API-fetched student data ─── */
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /* Search */
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* Primary filters */
  const [branch, setBranch] = useState(initialFilters?.course || "");
  const [branches, setBranches] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [placementStatus, setPlacementStatus] = useState<"" | "PLACED" | "UNPLACED">("UNPLACED");

  /* Refetch trigger */
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  /* More filters */
  const [moreOpen, setMoreOpen] = useState(false);
  const [cgpaRange, setCgpaRange] = useState<[number, number]>([0, 10]);
  const [internshipFilter, setInternshipFilter] = useState("Any");

  /* Advanced modal */
  const [advancedOpen, setAdvancedOpen] = useState(false);

  /* Sort */
  const [sortKey, setSortKey] = useState<SortKey>("cgpa");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Pagination */
  const [page, setPage] = useState(1);

  /* Selected student */
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch academic unit tree to get dynamic branches
  useEffect(() => {
    fetch(`${API_BASE}/university/academic-units/tree`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(res => res.ok ? res.json() : { tree: [] })
      .then(data => {
        const flat: any[] = [];
        const traverse = (nodes: any[]) => {
          nodes.forEach(n => {
            flat.push(n.label);
            if (n.children) traverse(n.children);
          });
        };
        traverse(data.tree || []);
        // Sort uniquely
        const uniqueBranches = Array.from(new Set(flat)).sort() as string[];
        setBranches(uniqueBranches);
      })
      .catch(() => setBranches([]));
  }, []);

  /* ─── Fetch students from backend ─── */
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    params.set("sortBy", sortKey === "cgpa" ? "cgpa" : "cgpa");
    params.set("sortDir", sortDir);
    if (searchQuery) { params.set("search", searchQuery); params.set("searchType", searchType); }
    if (initialFilters?.academicUnitId) params.set("academicUnitId", String(initialFilters.academicUnitId));
    if (branch) params.set("branch", branch);
    if (placementStatus) params.set("placementStatus", placementStatus);
    if (cgpaRange[0] > 0) params.set("minCgpa", String(cgpaRange[0]));
    if (cgpaRange[1] < 10) params.set("maxCgpa", String(cgpaRange[1]));

    fetch(`${API_BASE}/university/students?${params.toString()}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : { students: [], totalCount: 0 })
      .then(data => {
        const mapped = (data.students || []).map((s: any) => ({
          id: s.id,
          name: s.user?.name || "—",
          course: Array.isArray(s.academicPath) ? (s.academicPath[0] || "") : "",
          stream: s.placementBranch || s.branch || s.academicUnit?.name || "—",
          dept: Array.isArray(s.academicPath) ? (s.academicPath[s.academicPath.length - 2] || s.academicUnit?.name || "—") : s.academicUnit?.name || "—",
          section: s.academicUnit?.type === "Section" ? s.academicUnit?.name || "" : "",
          cgpa: s.cgpa || 0,
          tenth: 0,
          twelfth: 0,
          year: s.passingYear ? String(s.passingYear) : "—",
          status: s.placementStatus === "PLACED" ? "Placed" : "Unplaced",
          internship: false,
          internshipDetails: "",
          email: s.user?.email || "",
          phone: "",
        }));
        setAllStudents(mapped);
        setTotalCount(data.totalCount || mapped.length);
      })
      .catch(() => { setAllStudents([]); setTotalCount(0); })
      .finally(() => setLoading(false));
  }, [page, sortKey, sortDir, searchQuery, searchType, branch, placementStatus, cgpaRange, initialFilters?.academicUnitId, refetchTrigger]);

  /* Since pagination is server-side now */
  const filteredStudents = allStudents;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedStudents = filteredStudents;

  /* Active chips */
  const chips: { label: string; onRemove: () => void }[] = [
    ...(branch ? [{ label: `Branch: ${branch}`, onRemove: () => setBranch("") }] : []),
    ...years.map((y) => ({ label: `Year: ${y}`, onRemove: () => setYears(years.filter((x) => x !== y)) })),
    ...(placementStatus ? [{ label: placementStatus, onRemove: () => setPlacementStatus("") }] : []),
    ...(cgpaRange[0] > 0 || cgpaRange[1] < 10 ? [{ label: `CGPA: ${cgpaRange[0].toFixed(1)}–${cgpaRange[1].toFixed(1)}`, onRemove: () => setCgpaRange([0, 10]) }] : []),
    ...(internshipFilter !== "Any" ? [{ label: `Internship: ${internshipFilter}`, onRemove: () => setInternshipFilter("Any") }] : []),
  ];

  /* Analytics */
  const placedStudents = allStudents.filter((s) => s.status === "Placed").length;
  const placementRate = totalCount > 0 ? Math.round((placedStudents / totalCount) * 100) : 0;
  const analyticsCards = [
    { label: "Total Students", value: totalCount.toString(), icon: Users, color: "blue" },
    { label: "Placed Students", value: placedStudents.toString(), icon: UserCheck, color: "green" },
    { label: "Placement Rate", value: `${placementRate}%`, icon: TrendingUp, color: "indigo" },
    { label: "Active Jobs", value: "—", icon: Briefcase, color: "amber" },
  ];

  const colorMap: Record<string, { bg: string; bgDk: string; text: string; textDk: string }> = {
    blue:   { bg: "bg-blue-50",   bgDk: "bg-blue-500/10",   text: "text-blue-600",   textDk: "text-blue-400" },
    green:  { bg: "bg-green-50",  bgDk: "bg-green-500/10",  text: "text-green-600",  textDk: "text-green-400" },
    indigo: { bg: "bg-indigo-50", bgDk: "bg-indigo-500/10", text: "text-indigo-600", textDk: "text-indigo-400" },
    amber:  { bg: "bg-amber-50",  bgDk: "bg-amber-500/10",  text: "text-amber-600",  textDk: "text-amber-400" },
  };

  const handleSearch = () => setSearchQuery(searchInput);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };

  return (
    <div className="flex-1 px-6 py-8 space-y-5 overflow-y-auto">
      {/* Page Title */}
      <div>
        <h1 className={`text-xl tracking-tight ${heading}`}>Eligible Students</h1>
        <p className={`text-xs mt-0.5 ${muted}`}>Browse and filter students eligible for campus placements.</p>
      </div>

      {/* Context banner (when navigated from Placement Branches) */}
      {initialFilters?.contextLabel && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs ${dk ? "bg-blue-500/8 border-blue-500/20 text-blue-300" : "bg-blue-50 border-blue-100 text-blue-700"}`}>
          <Filter className="w-3.5 h-3.5 shrink-0" />
          <span>Filtered by: <span className="font-medium">{initialFilters.contextLabel}</span></span>
        </div>
      )}

      {/* ── 1. Search Bar ── */}
      <div className={`${card} p-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search type selector */}
          <div className={`flex rounded-lg overflow-hidden border ${dk ? "border-white/10" : "border-gray-200"}`}>
            {SEARCH_TYPES.map((st) => (
              <button
                key={st.key}
                onClick={() => setSearchType(st.key)}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  searchType === st.key
                    ? dk ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"
                    : dk ? "text-gray-400 hover:text-gray-300 hover:bg-white/[0.04]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
          {/* Input */}
          <div className="flex flex-1 gap-2">
            <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
              dk ? "bg-[#0a0a0f] border-white/10 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"
            }`}>
              <Search className={`w-3.5 h-3.5 shrink-0 ${muted}`} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Search by ${SEARCH_TYPES.find((s) => s.key === searchType)?.label}…`}
                className="flex-1 bg-transparent outline-none text-xs"
              />
              {searchInput && (
                <button onClick={() => { setSearchInput(""); setSearchQuery(""); }}>
                  <X className={`w-3 h-3 ${muted}`} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Analytics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {analyticsCards.map((c) => {
          const cl = colorMap[c.color];
          return (
            <div key={c.label} className={`${card} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dk ? cl.bgDk : cl.bg}`}>
                  <c.icon className={`w-3.5 h-3.5 ${dk ? cl.textDk : cl.text}`} />
                </div>
              </div>
              <p className={`text-xl tracking-tight ${heading}`}>{c.value}</p>
              <p className={`text-xs mt-0.5 ${muted}`}>{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── 3. Primary Filters ── */}
      <div className={`${card} p-4 space-y-3`}>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className={`w-3.5 h-3.5 ${muted}`} />
          <span className={`text-xs ${muted}`}>Filters:</span>

          <AcademicUnitSelector
            dk={dk}
            label=""
            selected={branch ? [branch] : []}
            onSelect={(sel) => { setBranch(sel.length > 0 ? sel[0].name : ""); setPage(1); }}
          />
          <MultiSelectDropdown
            label="Graduation Year" options={GRAD_YEARS} selected={years}
            onChange={setYears} dk={dk}
          />

          {/* Placement Status toggle */}
          <div className={`flex rounded-lg overflow-hidden border ${dk ? "border-white/10" : "border-gray-200"}`}>
            {(["", "PLACED", "UNPLACED"] as const).map((opt) => (
              <button
                key={opt || "All"}
                onClick={() => { setPlacementStatus(opt); setPage(1); }}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  placementStatus === opt
                    ? opt === "PLACED"
                      ? dk ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"
                      : opt === "UNPLACED"
                        ? dk ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-700"
                        : dk ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"
                    : dk ? "text-gray-400 hover:text-gray-300 hover:bg-white/[0.04]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt === "PLACED" ? "Placed" : opt === "UNPLACED" ? "Unplaced" : "All"}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                moreOpen
                  ? dk ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"
                  : dk ? "border-white/10 text-gray-400 hover:border-white/20" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              More Filters
              {moreOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setAdvancedOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                dk ? "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Active chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                  dk ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
                }`}
              >
                {chip.label}
                <button onClick={chip.onRemove}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {chips.length > 0 && (
              <button
                onClick={() => {
                  setBranch(""); setYears([]); setPlacementStatus("");
                  setCgpaRange([0, 10]); setInternshipFilter("Any");
                  setSearchInput(""); setSearchQuery(""); setPage(1);
                }}
                className={`text-xs px-2.5 py-1 rounded-full border ${dk ? "border-white/10 text-gray-500 hover:text-gray-300" : "border-gray-200 text-gray-400 hover:text-gray-600"}`}
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* ── 4. More Filters Panel ── */}
        {moreOpen && (
          <div className={`pt-3 mt-1 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 ${dk ? "border-white/8" : "border-gray-100"}`}>
            <div>
              <RangeSlider
                label="CGPA" min={0} max={10} value={cgpaRange}
                onChange={(v) => { setCgpaRange(v); setPage(1); }} step={0.1} decimals={1} dk={dk}
              />
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wide mb-2 ${muted}`}>Internship Experience</p>
              <div className={`flex rounded-lg overflow-hidden border ${dk ? "border-white/10" : "border-gray-200"}`}>
                {["Any", "Yes", "No"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setInternshipFilter(opt)}
                    className={`flex-1 py-1.5 text-xs transition-colors ${
                      internshipFilter === opt
                        ? dk ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"
                        : dk ? "text-gray-400 hover:text-gray-300 hover:bg-white/[0.04]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 5 & 6. Table + Sort ── */}
      <div className={`${card} overflow-hidden`}>
        {/* Table header row */}
        <div className={`px-5 py-3 flex items-center justify-between border-b ${dk ? "border-white/8" : "border-gray-100"}`}>
          <p className={`text-xs ${muted}`}>
            Showing <span className={heading}>{filteredStudents.length}</span> student{filteredStudents.length !== 1 ? "s" : ""}
          </p>

          {/* Sort By */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                dk ? "border-white/10 text-gray-400 hover:border-white/20" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              Sort by: {SORT_OPTIONS.find((s) => s.key === sortKey)?.label}
              {sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
            {sortOpen && (
              <div className={`absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border shadow-xl p-1 ${
                dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"
              }`}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      if (sortKey === opt.key) { setSortDir(sortDir === "desc" ? "asc" : "desc"); }
                      else { setSortKey(opt.key); setSortDir("desc"); }
                      setSortOpen(false);
                    }}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      sortKey === opt.key
                        ? dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                        : dk ? "text-gray-300 hover:bg-white/[0.04]" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                    {sortKey === opt.key && (
                      sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={`${muted} border-b ${dk ? "border-white/8" : "border-gray-100"}`}>
                {["Name", "UID", "Course", "Stream", "CGPA", "Grad. Year", "Status"].map((col) => (
                  <th key={col} className="text-left px-5 py-3 font-normal">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-5 py-12 text-center text-sm ${muted}`}>
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`border-b cursor-pointer transition-colors ${
                      dk
                        ? `border-white/5 hover:bg-white/[0.025]`
                        : `border-gray-50 hover:bg-blue-50/40`
                    } ${idx === paginatedStudents.length - 1 ? "border-none" : ""}`}
                  >
                    <td className={`px-5 py-3 ${dk ? "text-gray-200" : "text-gray-800"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${dk ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                          {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className={`px-5 py-3 font-mono ${muted}`}>{student.id}</td>
                    <td className={`px-5 py-3 ${dk ? "text-gray-300" : "text-gray-600"}`}>{student.course}</td>
                    <td className={`px-5 py-3 ${dk ? "text-gray-300" : "text-gray-600"}`}>{student.stream}</td>
                    <td className={`px-5 py-3 ${heading}`}>
                      <span className={`${student.cgpa >= 9 ? (dk ? "text-green-400" : "text-green-600") : student.cgpa < 7 ? (dk ? "text-amber-400" : "text-amber-600") : ""}`}>
                        {student.cgpa.toFixed(1)}
                      </span>
                    </td>
                    <td className={`px-5 py-3 ${dk ? "text-gray-300" : "text-gray-600"}`}>{student.year}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${
                        student.status === "Placed"
                          ? dk ? "bg-green-500/12 text-green-400" : "bg-green-50 text-green-600"
                          : dk ? "bg-amber-500/12 text-amber-400" : "bg-amber-50 text-amber-700"
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${student.status === "Placed" ? "bg-green-500" : "bg-amber-500"}`} />
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── 7. Pagination ── */}
        {totalPages > 1 && (
          <div className={`px-5 py-3 flex items-center justify-between border-t ${dk ? "border-white/8" : "border-gray-100"}`}>
            <p className={`text-xs ${muted}`}>
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`p-1.5 rounded-lg transition-colors ${
                  page === 1
                    ? dk ? "text-gray-700 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                    : dk ? "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs transition-colors ${
                    p === page
                      ? dk ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"
                      : dk ? "text-gray-400 hover:bg-white/[0.04]" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`p-1.5 rounded-lg transition-colors ${
                  page === totalPages
                    ? dk ? "text-gray-700 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                    : dk ? "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 8. Student Detail Modal ── */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          dk={dk}
          onMarkPlaced={() => setRefetchTrigger(t => t + 1)}
        />
      )}

      {/* Advanced Filters Modal */}
      {advancedOpen && (
        <AdvancedModal
          onClose={() => setAdvancedOpen(false)}
          dk={dk}
          cgpaRange={cgpaRange}
          setCgpaRange={setCgpaRange}
          internship={internshipFilter}
          setInternship={setInternshipFilter}
        />
      )}
    </div>
  );
}
