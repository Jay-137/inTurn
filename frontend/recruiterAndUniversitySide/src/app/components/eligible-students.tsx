import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  SlidersHorizontal, Filter, Users, UserCheck, TrendingUp, Briefcase,
  ArrowUpDown, GraduationCap, BookOpen, Layers,
} from "lucide-react";
import { useTheme } from "./theme-context";

/* ─── Shared Filter Type ─── */
export type EligibleFilters = {
  course?: string;
  streams?: string[];
  departments?: string[];
  sections?: string[];
  contextLabel?: string;
};

/* ─── Mock Data ─── */
const COURSES = ["B.Tech", "M.Tech", "MBA", "BCA", "MCA", "B.Sc", "M.Sc"];
const STREAMS: Record<string, string[]> = {
  "B.Tech": ["CSE", "IT", "ECE", "EEE", "ME", "CE"],
  "M.Tech": ["CSE", "VLSI", "Power Systems", "Structural Engineering"],
  "MBA": ["Finance", "Marketing", "HR", "Operations"],
  "BCA": ["General"],
  "MCA": ["General"],
  "B.Sc": ["CS", "Physics", "Math"],
  "M.Sc": ["CS", "Data Science"],
};
const DEPARTMENTS: Record<string, string[]> = {
  CSE: ["CSE-A", "CSE-B", "CSE-C", "CSE-D"],
  IT: ["IT-A", "IT-B"],
  ECE: ["ECE-A", "ECE-B", "ECE-C"],
  EEE: ["EEE-A", "EEE-B"],
  ME: ["ME-A", "ME-B"],
  CE: ["CE-A"],
  General: ["Gen-A", "Gen-B"],
  Finance: ["Fin-A"],
  Marketing: ["Mkt-A"],
};
const SECTIONS = ["A", "B", "C", "D"];
const GRAD_YEARS = ["2024", "2025", "2026", "2027"];

const rawStudents = [
  { id: "CS21001", name: "Aditi Sharma", course: "B.Tech", stream: "CSE", dept: "CSE-A", section: "A", cgpa: 9.2, tenth: 94, twelfth: 91, year: "2025", status: "Placed", internship: true, internshipDetails: "Software Engineer Intern at Infosys (6 months)", email: "aditi.sharma@univ.edu", phone: "9812345670" },
  { id: "IT21042", name: "Rahul Verma", course: "B.Tech", stream: "IT", dept: "IT-A", section: "B", cgpa: 8.7, tenth: 88, twelfth: 85, year: "2025", status: "Placed", internship: true, internshipDetails: "Data Analyst Intern at TCS (3 months)", email: "rahul.verma@univ.edu", phone: "9823456781" },
  { id: "EC21078", name: "Priya Nair", course: "B.Tech", stream: "ECE", dept: "ECE-B", section: "A", cgpa: 8.4, tenth: 82, twelfth: 79, year: "2025", status: "Unplaced", internship: false, internshipDetails: "", email: "priya.nair@univ.edu", phone: "9834567892" },
  { id: "CS21022", name: "Arun Krishnan", course: "B.Tech", stream: "CSE", dept: "CSE-B", section: "C", cgpa: 7.9, tenth: 76, twelfth: 73, year: "2025", status: "Placed", internship: true, internshipDetails: "Backend Developer Intern at Wipro (2 months)", email: "arun.krishnan@univ.edu", phone: "9845678903" },
  { id: "ME21055", name: "Sneha Reddy", course: "B.Tech", stream: "ME", dept: "ME-A", section: "B", cgpa: 7.2, tenth: 70, twelfth: 68, year: "2026", status: "Unplaced", internship: false, internshipDetails: "", email: "sneha.reddy@univ.edu", phone: "9856789014" },
  { id: "CS22001", name: "Vikram Patel", course: "B.Tech", stream: "CSE", dept: "CSE-C", section: "D", cgpa: 9.5, tenth: 97, twelfth: 95, year: "2026", status: "Unplaced", internship: true, internshipDetails: "ML Engineer Intern at Google (3 months)", email: "vikram.patel@univ.edu", phone: "9867890125" },
  { id: "IT22033", name: "Meera Iyer", course: "B.Tech", stream: "IT", dept: "IT-B", section: "A", cgpa: 8.1, tenth: 80, twelfth: 78, year: "2026", status: "Placed", internship: true, internshipDetails: "Cloud Intern at Amazon (4 months)", email: "meera.iyer@univ.edu", phone: "9878901236" },
  { id: "EC22019", name: "Karthik Menon", course: "B.Tech", stream: "ECE", dept: "ECE-A", section: "B", cgpa: 6.8, tenth: 65, twelfth: 62, year: "2026", status: "Unplaced", internship: false, internshipDetails: "", email: "karthik.menon@univ.edu", phone: "9889012347" },
  { id: "CS21099", name: "Nisha Kapoor", course: "B.Tech", stream: "CSE", dept: "CSE-D", section: "A", cgpa: 8.9, tenth: 90, twelfth: 88, year: "2025", status: "Placed", internship: true, internshipDetails: "Frontend Developer Intern at Flipkart (6 months)", email: "nisha.kapoor@univ.edu", phone: "9890123458" },
  { id: "CE21010", name: "Amit Joshi", course: "B.Tech", stream: "CE", dept: "CE-A", section: "C", cgpa: 7.5, tenth: 72, twelfth: 71, year: "2025", status: "Unplaced", internship: false, internshipDetails: "", email: "amit.joshi@univ.edu", phone: "9801234569" },
  { id: "CS23011", name: "Divya Pillai", course: "B.Tech", stream: "CSE", dept: "CSE-A", section: "B", cgpa: 9.1, tenth: 93, twelfth: 90, year: "2027", status: "Unplaced", internship: true, internshipDetails: "Research Intern at IISc (2 months)", email: "divya.pillai@univ.edu", phone: "9812340001" },
  { id: "MB21007", name: "Saurabh Singh", course: "MBA", stream: "Finance", dept: "Fin-A", section: "A", cgpa: 8.3, tenth: 84, twelfth: 82, year: "2025", status: "Placed", internship: true, internshipDetails: "Finance Intern at HDFC Bank (3 months)", email: "saurabh.singh@univ.edu", phone: "9823450012" },
  { id: "EE21044", name: "Lakshmi Devi", course: "B.Tech", stream: "EEE", dept: "EEE-A", section: "C", cgpa: 7.8, tenth: 78, twelfth: 75, year: "2025", status: "Placed", internship: false, internshipDetails: "", email: "lakshmi.devi@univ.edu", phone: "9834560023" },
  { id: "IT23055", name: "Rohan Gupta", course: "B.Tech", stream: "IT", dept: "IT-A", section: "D", cgpa: 8.6, tenth: 87, twelfth: 84, year: "2027", status: "Unplaced", internship: false, internshipDetails: "", email: "rohan.gupta@univ.edu", phone: "9845670034" },
  { id: "CS22066", name: "Pooja Mehta", course: "B.Tech", stream: "CSE", dept: "CSE-B", section: "A", cgpa: 9.4, tenth: 96, twelfth: 93, year: "2026", status: "Placed", internship: true, internshipDetails: "Data Science Intern at Microsoft (4 months)", email: "pooja.mehta@univ.edu", phone: "9856780045" },
];

type Student = typeof rawStudents[0];
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
function StudentModal({ student, onClose, dk }: { student: Student; onClose: () => void; dk: boolean }) {
  const [tab, setTab] = useState<ModalTab>("overview");
  const card = `rounded-xl border ${dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"}`;
  const muted = dk ? "text-gray-400" : "text-gray-500";
  const heading = dk ? "text-white" : "text-gray-900";

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

  /* Search */
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* Primary filters - initialise from props */
  const [course, setCourse] = useState(initialFilters?.course || "");
  const [streams, setStreams] = useState<string[]>(initialFilters?.streams || []);
  const [years, setYears] = useState<string[]>([]);
  const [placementStatus, setPlacementStatus] = useState<"" | "Placed" | "Unplaced">("");

  /* More filters */
  const [moreOpen, setMoreOpen] = useState(false);
  const [departments, setDepartments] = useState<string[]>(initialFilters?.departments || []);
  const [sections, setSections] = useState<string[]>(initialFilters?.sections || []);
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

  /* Available stream/dept options based on selected course */
  const streamOptions = course ? (STREAMS[course] || []) : Object.values(STREAMS).flat().filter((v, i, a) => a.indexOf(v) === i);
  const deptOptions = streams.length > 0
    ? streams.flatMap((s) => DEPARTMENTS[s] || []).filter((v, i, a) => a.indexOf(v) === i)
    : Object.values(DEPARTMENTS).flat().filter((v, i, a) => a.indexOf(v) === i);

  /* Filtered & sorted students */
  const filteredStudents = useMemo(() => {
    let result = rawStudents.filter((s) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (searchType === "uid" && !s.id.toLowerCase().includes(q)) return false;
        if (searchType === "name" && !s.name.toLowerCase().includes(q)) return false;
        if (searchType === "email" && !s.email.toLowerCase().includes(q)) return false;
        if (searchType === "phone" && !s.phone.includes(q)) return false;
      }
      if (course && s.course !== course) return false;
      if (streams.length > 0 && !streams.includes(s.stream)) return false;
      if (years.length > 0 && !years.includes(s.year)) return false;
      if (placementStatus && s.status !== placementStatus) return false;
      if (departments.length > 0 && !departments.includes(s.dept)) return false;
      if (sections.length > 0 && !sections.includes(s.section)) return false;
      if (s.cgpa < cgpaRange[0] || s.cgpa > cgpaRange[1]) return false;
      if (internshipFilter === "Yes" && !s.internship) return false;
      if (internshipFilter === "No" && s.internship) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      const va = sortKey === "cgpa" ? a.cgpa : sortKey === "tenth" ? a.tenth : a.twelfth;
      const vb = sortKey === "cgpa" ? b.cgpa : sortKey === "tenth" ? b.tenth : b.twelfth;
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return result;
  }, [searchQuery, searchType, course, streams, years, placementStatus, departments, sections, cgpaRange, internshipFilter, sortKey, sortDir]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [filteredStudents.length]);

  /* Active chips */
  const chips: { label: string; onRemove: () => void }[] = [
    ...(course ? [{ label: `Course: ${course}`, onRemove: () => setCourse("") }] : []),
    ...streams.map((s) => ({ label: `Stream: ${s}`, onRemove: () => setStreams(streams.filter((x) => x !== s)) })),
    ...years.map((y) => ({ label: `Year: ${y}`, onRemove: () => setYears(years.filter((x) => x !== y)) })),
    ...(placementStatus ? [{ label: placementStatus, onRemove: () => setPlacementStatus("") }] : []),
    ...departments.map((d) => ({ label: `Dept: ${d}`, onRemove: () => setDepartments(departments.filter((x) => x !== d)) })),
    ...sections.map((s) => ({ label: `Sec: ${s}`, onRemove: () => setSections(sections.filter((x) => x !== s)) })),
    ...(cgpaRange[0] > 0 || cgpaRange[1] < 10 ? [{ label: `CGPA: ${cgpaRange[0].toFixed(1)}–${cgpaRange[1].toFixed(1)}`, onRemove: () => setCgpaRange([0, 10]) }] : []),
    ...(internshipFilter !== "Any" ? [{ label: `Internship: ${internshipFilter}`, onRemove: () => setInternshipFilter("Any") }] : []),
  ];

  /* Analytics */
  const totalStudents = rawStudents.length;
  const placedStudents = rawStudents.filter((s) => s.status === "Placed").length;
  const placementRate = Math.round((placedStudents / totalStudents) * 100);
  const analyticsCards = [
    { label: "Total Students", value: totalStudents.toString(), icon: Users, color: "blue" },
    { label: "Placed Students", value: placedStudents.toString(), icon: UserCheck, color: "green" },
    { label: "Placement Rate", value: `${placementRate}%`, icon: TrendingUp, color: "indigo" },
    { label: "Active Job Postings", value: "34", icon: Briefcase, color: "amber" },
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

          <SingleSelectDropdown
            label="Course" options={COURSES} selected={course}
            onChange={(v) => { setCourse(v); setStreams([]); setDepartments([]); }} dk={dk}
          />
          <MultiSelectDropdown
            label="Stream" options={streamOptions} selected={streams}
            onChange={(v) => { setStreams(v); setDepartments([]); }} dk={dk}
          />
          <MultiSelectDropdown
            label="Graduation Year" options={GRAD_YEARS} selected={years}
            onChange={setYears} dk={dk}
          />

          {/* Placement Status toggle */}
          <div className={`flex rounded-lg overflow-hidden border ${dk ? "border-white/10" : "border-gray-200"}`}>
            {(["", "Placed", "Unplaced"] as const).map((opt) => (
              <button
                key={opt || "All"}
                onClick={() => setPlacementStatus(opt)}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  placementStatus === opt
                    ? opt === "Placed"
                      ? dk ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"
                      : opt === "Unplaced"
                        ? dk ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-700"
                        : dk ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"
                    : dk ? "text-gray-400 hover:text-gray-300 hover:bg-white/[0.04]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt || "All"}
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
                  setCourse(""); setStreams([]); setYears([]); setPlacementStatus("");
                  setDepartments([]); setSections([]); setCgpaRange([0, 10]); setInternshipFilter("Any");
                  setSearchInput(""); setSearchQuery("");
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
          <div className={`pt-3 mt-1 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${dk ? "border-white/8" : "border-gray-100"}`}>
            <div>
              <p className={`text-[10px] uppercase tracking-wide mb-2 ${muted}`}>Department</p>
              <MultiSelectDropdown
                label="Department" options={deptOptions} selected={departments}
                onChange={setDepartments} dk={dk}
              />
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wide mb-2 ${muted}`}>Section</p>
              <MultiSelectDropdown
                label="Section" options={SECTIONS} selected={sections}
                onChange={setSections} dk={dk}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <RangeSlider
                label="CGPA" min={0} max={10} value={cgpaRange}
                onChange={setCgpaRange} step={0.1} decimals={1} dk={dk}
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
        <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} dk={dk} />
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