import { useState } from "react";
import {
  Briefcase, Users, UserCheck, TrendingUp,
  Plus, CheckCircle2, Clock, XCircle,
  LogOut, Sun, Moon, Search, Menu, X,
  LayoutDashboard, FileText, Star, BarChart3,
  Bell, ChevronRight, ClipboardList,
} from "lucide-react";
import { useTheme } from "./theme-context";
import { useNavigate } from "react-router";
import { PostJob } from "./post-job";
import { JobPostings } from "./job-postings";

/* ─── Sidebar Config ─── */
const sidebarNav = [
  { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { label: "Job Postings", icon: ClipboardList, id: "job-postings" },
  { label: "Post Job", icon: FileText, id: "post-job" },
  { label: "Shortlisted", icon: Star, id: "shortlisted" },
  { label: "Placement Analytics", icon: BarChart3, id: "analytics" },
];

/* ─── Mock Data ─── */
const summaryCards = [
  { label: "Active Job Postings", value: "3", sub: "All positions open", icon: Briefcase, color: "blue" },
  { label: "Total Applicants", value: "107", sub: "+23 this week", icon: Users, color: "indigo" },
  { label: "Shortlisted", value: "17", sub: "Ready for interview", icon: UserCheck, color: "green" },
  { label: "Avg Match Score", value: "76%", sub: "+4% vs last month", icon: TrendingUp, color: "amber" },
];

const activeJobs = [
  {
    title: "SDE-1 Frontend Engineer",
    posted: "Posted Feb 20, 2026",
    status: "Active",
    applicants: 47,
    shortlisted: 8,
    pending: 12,
    rejected: 27,
  },
  {
    title: "SDE Intern - Backend",
    posted: "Posted Feb 18, 2026",
    status: "Active",
    applicants: 32,
    shortlisted: 5,
    pending: 9,
    rejected: 18,
  },
  {
    title: "Fresher - Full Stack Developer",
    posted: "Posted Feb 15, 2026",
    status: "Active",
    applicants: 28,
    shortlisted: 4,
    pending: 8,
    rejected: 16,
  },
];

const applicationStatus = [
  { name: "Shortlisted", value: 17, color: "#22c55e" },
  { name: "Pending", value: 29, color: "#6366f1" },
  { name: "Rejected", value: 61, color: "#ef4444" },
];

const weeklyTrend = [
  { day: "Mon", apps: 8 },
  { day: "Tue", apps: 16 },
  { day: "Wed", apps: 22 },
  { day: "Thu", apps: 26 },
  { day: "Fri", apps: 30 },
  { day: "Sat", apps: 7 },
  { day: "Sun", apps: 5 },
];

type TrendUnit = "days" | "weeks" | "months";

function generateTrendData(count: number, unit: TrendUnit): { label: string; apps: number }[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const seed = (i: number) => Math.floor(((Math.sin(i * 31 + count * 7) + 1) / 2) * 25 + 5);

  if (unit === "days") {
    const today = new Date(2026, 3, 7); // Apr 7, 2026
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (count - 1 - i));
      const label = count <= 7 ? dayNames[d.getDay()] : `${monthNames[d.getMonth()]} ${d.getDate()}`;
      return { label, apps: seed(i) };
    });
  }
  if (unit === "weeks") {
    return Array.from({ length: count }, (_, i) => ({
      label: `Week ${i + 1}`,
      apps: seed(i) * 5 + 30,
    }));
  }
  // months
  const today = new Date(2026, 3, 7);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - (count - 1 - i));
    return { label: monthNames[d.getMonth()], apps: seed(i) * 10 + 80 };
  });
}

const recentApplicants = [
  { name: "Priya Sharma", role: "SDE-1 Frontend", time: "10 min ago", score: 94, color: "bg-blue-500" },
  { name: "Rahul Verma", role: "SDE Intern Backend", time: "25 min ago", score: 88, color: "bg-red-500" },
  { name: "Ananya Patel", role: "Fresher Full Stack", time: "1 hour ago", score: 82, color: "bg-amber-500" },
  { name: "Vikram Singh", role: "SDE-1 Frontend", time: "2 hours ago", score: 76, color: "bg-green-500" },
];

const colorMap: Record<string, { bg: string; bgDk: string; text: string; textDk: string }> = {
  blue:   { bg: "bg-blue-50",   bgDk: "bg-blue-500/10",   text: "text-blue-600",   textDk: "text-blue-400" },
  green:  { bg: "bg-green-50",  bgDk: "bg-green-500/10",  text: "text-green-600",  textDk: "text-green-400" },
  indigo: { bg: "bg-indigo-50", bgDk: "bg-indigo-500/10", text: "text-indigo-600", textDk: "text-indigo-400" },
  amber:  { bg: "bg-amber-50",  bgDk: "bg-amber-500/10",  text: "text-amber-600",  textDk: "text-amber-400" },
};

/* ─── Custom Donut Chart (avoids recharts PieChart key bug) ─── */
function DonutChart({ data, size, strokeWidth }: { data: { name: string; value: number; color: string }[]; size: number; strokeWidth: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((segment) => {
        const pct = segment.value / total;
        const dashLength = pct * circumference;
        const gap = circumference - dashLength;
        const currentOffset = offset;
        offset += dashLength;
        return (
          <circle
            key={segment.name}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${gap}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-current text-2xl" style={{ fontSize: 24 }}>
        {total}
      </text>
    </svg>
  );
}

/* ─── Custom Bar Chart ─── */
function CustomBarChart({ data, dk }: { data: { label: string; apps: number }[]; dk: boolean }) {
  const max = Math.max(...data.map((d) => d.apps));
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="h-64 flex items-end gap-3 relative pt-6">
      {data.map((item, i) => {
        const pct = (item.apps / max) * 100;
        return (
          <div
            key={item.label}
            className="flex-1 flex flex-col items-center gap-2 relative"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === i && (
              <div
                className={`absolute -top-1 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap z-10 ${
                  dk ? "bg-[#1a1a24] text-white border border-white/10" : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                }`}
              >
                {item.apps} apps
              </div>
            )}
            <div className="w-full flex justify-center" style={{ height: "200px" }}>
              <div
                className="w-8 rounded-t-lg bg-blue-500 transition-all duration-200 hover:bg-blue-400"
                style={{ height: `${pct}%`, marginTop: "auto" }}
              />
            </div>
            <span className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Sidebar ─── */
function Sidebar({
  dk, active, setActive, open, setOpen,
}: {
  dk: boolean; active: string; setActive: (id: string) => void; open: boolean; setOpen: (v: boolean) => void;
}) {
  const navigate = useNavigate();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-60 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${dk ? "bg-[#0d0d12] border-r border-white/5" : "bg-white border-r border-gray-200"}`}
      >
        {/* Logo */}
        <div className={`h-14 flex items-center justify-between px-5 shrink-0 border-b ${dk ? "border-white/5" : "border-gray-200"}`}>
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs tracking-tight">in</span>
            </div>
            <span className={`text-sm tracking-tight ${dk ? "text-white" : "text-gray-900"}`}>Inturn</span>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className={`w-4 h-4 ${dk ? "text-gray-400" : "text-gray-500"}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActive(item.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                    : dk ? "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className={`shrink-0 px-4 py-4 border-t ${dk ? "border-white/5" : "border-gray-200"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">A</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${dk ? "text-gray-200" : "text-gray-800"}`}>Alex Johnson</p>
              <p className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>Recruiter</p>
            </div>
            <button onClick={() => navigate("/login")} className={`${dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ─── Main ─── */
export function RecruiterDashboard() {
  const { theme, toggle } = useTheme();
  const dk = theme === "dark";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trendCount, setTrendCount] = useState(7);
  const [trendUnit, setTrendUnit] = useState<TrendUnit>("days");

  const trendChartData = generateTrendData(trendCount, trendUnit);

  const card = `rounded-xl border ${dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-300"}`;
  const muted = dk ? "text-gray-400" : "text-gray-500";
  const heading = dk ? "text-white" : "text-gray-900";

  return (
    <div className={`min-h-screen flex ${dk ? "bg-[#0a0a0f] text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <Sidebar dk={dk} active={activeNav} setActive={setActiveNav} open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col lg:ml-60">
        {/* Top bar */}
        <header className={`sticky top-0 z-30 border-b ${dk ? "bg-[#0a0a0f]/80 border-white/10" : "bg-white/80 border-gray-300"} backdrop-blur-md`}>
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className={`w-5 h-5 ${dk ? "text-gray-300" : "text-gray-700"}`} />
              </button>
              <h1 className={`text-lg tracking-tight ${heading}`}>{
                activeNav === "dashboard" ? "Dashboard" :
                activeNav === "job-postings" ? "Job Postings" :
                activeNav === "post-job" ? "Post Job" :
                activeNav === "shortlisted" ? "Shortlisted" : "Placement Analytics"
              }</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${dk ? "bg-white/[0.04] text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                <Search className="w-3.5 h-3.5" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="bg-transparent outline-none text-sm w-40" />
              </div>
              <button onClick={toggle} className={`p-2 rounded-lg transition-colors ${dk ? "hover:bg-white/5" : "hover:bg-gray-100"}`}>
                {dk ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-500" />}
              </button>
              <button className={`relative p-2 rounded-lg transition-colors ${dk ? "hover:bg-white/5" : "hover:bg-gray-100"}`}>
                <Bell className={`w-4 h-4 ${dk ? "text-gray-400" : "text-gray-500"}`} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              </button>
              <button onClick={() => { setActiveNav("post-job"); }} className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post New Job</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 space-y-6 overflow-y-auto">
          {activeNav === "post-job" ? (
            <PostJob onNavigate={setActiveNav} />
          ) : activeNav === "job-postings" ? (
            <JobPostings dk={dk} card={card} heading={heading} muted={muted} onNavigate={setActiveNav} />
          ) : (
          <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((c) => {
              const cl = colorMap[c.color];
              return (
                <div key={c.label} className={`${card} p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs ${muted}`}>{c.label}</p>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dk ? cl.bgDk : cl.bg}`}>
                      <c.icon className={`w-4 h-4 ${dk ? cl.textDk : cl.text}`} />
                    </div>
                  </div>
                  <p className={`text-2xl tracking-tight ${heading}`}>{c.value}</p>
                  <p className={`text-xs mt-1 ${c.sub.startsWith("+") ? "text-green-500" : muted}`}>{c.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Active Jobs + Application Status */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Active Job Posts */}
            <div className={`lg:col-span-3 ${card} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className={`text-sm ${heading}`}>Active Job Posts</h2>
                <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-500 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  New Post
                </button>
              </div>
              <div className="space-y-0">
                {activeJobs.map((job, i) => (
                  <div
                    key={job.title}
                    className={`py-4 ${i < activeJobs.length - 1 ? `border-b ${dk ? "border-white/5" : "border-gray-100"}` : ""}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${dk ? "text-gray-200" : "text-gray-800"}`}>{job.title}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"}`}>
                            {job.status}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${muted}`}>{job.posted}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl tracking-tight ${heading}`}>{job.applicants}</p>
                        <p className={`text-[10px] ${muted}`}>applicants</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <CheckCircle2 className="w-3 h-3" />
                        {job.shortlisted} shortlisted
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${dk ? "text-indigo-400" : "text-indigo-600"}`}>
                        <Clock className="w-3 h-3" />
                        {job.pending} pending
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${muted}`}>
                        <XCircle className="w-3 h-3" />
                        {job.rejected} rejected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column: Application Status + Recent Applicants */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Status Donut */}
              <div className={`${card} p-6`}>
                <h2 className={`text-sm mb-2 ${heading}`}>Application Status</h2>
                <div className="flex items-center justify-center py-6">
                  <DonutChart data={applicationStatus} size={160} strokeWidth={22} />
                </div>
                <div className="flex items-center justify-center gap-5 mt-1">
                  {applicationStatus.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className={`text-xs ${muted}`}>{s.name} ({s.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applicants */}
              <div className={`${card} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-sm ${heading}`}>Recent Applicants</h2>
                  <button className="text-xs text-blue-600 hover:text-blue-500 transition-colors">View All</button>
                </div>
                <div className="space-y-3">
                  {recentApplicants.map((a) => (
                    <div key={a.name} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${a.color} flex items-center justify-center text-white text-xs shrink-0`}>
                        {a.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${dk ? "text-gray-200" : "text-gray-800"}`}>{a.name}</p>
                        <p className={`text-xs ${muted}`}>{a.role} · {a.time}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs ${
                        a.score >= 90
                          ? "border-green-500 text-green-500"
                          : a.score >= 80
                            ? "border-blue-500 text-blue-500"
                            : "border-amber-500 text-amber-500"
                      }`}>
                        {a.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Application Trend */}
          <div className={`${card} p-6`}>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
                <h2 className={`text-sm ${heading}`}>Application Trend</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${muted}`}>Last</span>
                <input
                  type="number"
                  min={1}
                  max={trendUnit === "days" ? 30 : trendUnit === "weeks" ? 12 : 12}
                  value={trendCount}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(Number(e.target.value) || 1, trendUnit === "days" ? 30 : 12));
                    setTrendCount(v);
                  }}
                  className={`w-14 text-center text-xs px-2 py-1.5 rounded-lg border outline-none transition-colors ${
                    dk
                      ? "bg-white/[0.04] border-white/10 text-white focus:border-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
                  }`}
                />
                <select
                  value={trendUnit}
                  onChange={(e) => {
                    const unit = e.target.value as TrendUnit;
                    setTrendUnit(unit);
                    const maxVal = unit === "days" ? 30 : 12;
                    if (trendCount > maxVal) setTrendCount(maxVal);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors appearance-none pr-7 ${
                    dk
                      ? "bg-white/[0.04] border-white/10 text-white focus:border-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${dk ? '%239ca3af' : '%236b7280'}' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
            <CustomBarChart data={trendChartData} dk={dk} />
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  );
}