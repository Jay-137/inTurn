import { useState, useEffect } from "react";
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
import { Shortlisted, PlacementAnalytics, JobApplicants } from "./recruiter-subpages";

const API_BASE = "https://inturn-5efo.onrender.com/api";

/* ─── Sidebar Config ─── */
const sidebarNav = [
  { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { label: "Job Postings", icon: ClipboardList, id: "job-postings" },
  { label: "Post Job", icon: FileText, id: "post-job" },
  { label: "Shortlisted", icon: Star, id: "shortlisted" },
  { label: "Placement Analytics", icon: BarChart3, id: "analytics" },
];

// Removed static mock data arrays.

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
      {total === 0 ? (
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700" strokeOpacity={0.3}
        />
      ) : data.map((segment) => {
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
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/companies/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markRead = async (id: number) => {
    try {
      await fetch(`${API_BASE}/companies/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const clearAllNotifications = async () => {
    try {
      await fetch(`${API_BASE}/companies/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/companies/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    // Fetch for dashboard and job-postings views
    if (activeNav === "dashboard" || activeNav === "job-postings") {
      fetchDashboard();
    }
  }, [activeNav]);

  const trendChartData = dashboardData?.weeklyTrend || [];

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
                activeNav === "shortlisted" ? "Shortlisted" :
                activeNav === "job-applicants" ? `Applicants — ${selectedJobTitle}` :
                "Placement Analytics"
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
              <div className="relative">
                <button onClick={() => setShowNotif(!showNotif)} className={`relative p-2 rounded-lg transition-colors cursor-pointer ${dk ? "hover:bg-white/5" : "hover:bg-gray-100"}`}>
                  <Bell className={`w-4 h-4 ${dk ? "text-gray-400" : "text-gray-500"}`} />
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
                {showNotif && (
                  <div className={`absolute right-0 top-12 w-80 max-h-[400px] overflow-y-auto rounded-xl shadow-xl border p-4 z-50 ${dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className={`text-sm font-medium ${heading}`}>Notifications</p>
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} className="text-xs text-blue-500 hover:text-blue-600">Clear all</button>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      <div className="space-y-2">
                        {notifications.map(n => (
                          <div 
                            key={n.id}
                            onClick={() => !n.isRead && markRead(n.id)}
                            className={`p-3 rounded-lg text-xs cursor-pointer transition-colors border ${
                              n.isRead ? (dk ? "bg-white/5 border-transparent text-gray-400" : "bg-gray-50 border-transparent text-gray-500")
                                : (dk ? "bg-blue-500/10 border-blue-500/20 text-blue-100" : "bg-blue-50 border-blue-100 text-blue-900")
                            }`}
                          >
                            <p className="font-medium mb-1">{n.type === "success" ? "Success" : n.type === "warning" ? "Notice" : "Update"}</p>
                            <p className="opacity-80 leading-relaxed">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Bell className={`w-8 h-8 mx-auto mb-2 opacity-20 ${dk ? "text-white" : "text-gray-900"}`} />
                        <p className={`text-xs ${muted}`}>No new notifications right now.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
            <JobPostings 
              dk={dk} card={card} heading={heading} muted={muted} 
              jobs={dashboardData?.activeJobs || []} 
              onNavigate={(id, meta) => {
                if (id === "job-applicants" && meta?.jobId) {
                  setSelectedJobId(meta.jobId);
                  setSelectedJobTitle(meta.jobTitle || "");
                }
                setActiveNav(id);
              }} 
              onWithdraw={async (jobId) => {
                try {
                  const res = await fetch(`${API_BASE}/companies/jobs/${jobId}/withdraw`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                  });
                  if (res.ok) {
                    const dRes = await fetch(`${API_BASE}/companies/dashboard`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
                    if (dRes.ok) setDashboardData(await dRes.json());
                  }
                } catch (e) { console.error(e); }
              }}
            />
          ) : activeNav === "job-applicants" && selectedJobId ? (
            <JobApplicants jobId={selectedJobId} onBack={() => setActiveNav("job-postings")} />
          ) : activeNav === "shortlisted" ? (
            <Shortlisted />
          ) : activeNav === "analytics" ? (
            <PlacementAnalytics />
          ) : (
          <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(dashboardData?.summaryCards || []).map((c: any, i: number) => {
              const cl = colorMap[c.color] || colorMap.blue;
              const IconComp = c.label.includes("Job") ? Briefcase : c.label.includes("App") ? Users : c.label.includes("Short") ? UserCheck : TrendingUp;
              return (
                <div key={c.label} className={`${card} p-5 animate-fade-in-up hover-lift`} style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs ${muted}`}>{c.label}</p>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dk ? cl.bgDk : cl.bg}`}>
                      <IconComp className={`w-4 h-4 ${dk ? cl.textDk : cl.text}`} />
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
            <div className={`lg:col-span-3 ${card} p-6 animate-fade-in-up`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className={`text-sm ${heading}`}>Active Job Posts</h2>
                <button onClick={() => setActiveNav("post-job")} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-500 transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  New Post
                </button>
              </div>
              <div className="space-y-0">
                {(dashboardData?.activeJobs || []).map((job: any, i: number) => (
                  <div
                    key={job.id || i}
                    className={`py-4 ${i < (dashboardData?.activeJobs || []).length - 1 ? `border-b ${dk ? "border-white/5" : "border-gray-100"}` : ""}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${dk ? "text-gray-200" : "text-gray-800"}`}>{job.title}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            job.status === "APPROVED" 
                              ? (dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600")
                              : job.status === "REJECTED"
                                ? (dk ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600")
                                : (dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600")
                          }`}>
                            {job.status === "PENDING_REVIEW" ? "Pending University Review" : job.status}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${muted}`}>{job.posted}</p>
                        {job.status === "REJECTED" && job.rejectionReason && (
                          <p className={`text-[10px] mt-1 ${dk ? "text-red-400" : "text-red-600"}`}>Reason: {job.rejectionReason}</p>
                        )}
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
              <div className={`${card} p-6 animate-fade-in-up`}>
                <h2 className={`text-sm mb-2 ${heading}`}>Application Status</h2>
                <div className="flex items-center justify-center py-6">
                  <DonutChart data={dashboardData?.applicationStatus || []} size={160} strokeWidth={22} />
                </div>
                <div className="flex items-center justify-center gap-5 mt-1">
                  {(dashboardData?.applicationStatus || []).map((s: any) => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className={`text-xs ${muted}`}>{s.name} ({s.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applicants */}
              <div className={`${card} p-6 animate-fade-in-up`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-sm ${heading}`}>Recent Applicants</h2>
                  <button onClick={() => setActiveNav("shortlisted")} className="text-xs text-blue-600 hover:text-blue-500 transition-colors cursor-pointer">View All</button>
                </div>
                <div className="space-y-3">
                  {(dashboardData?.recentApplicants || []).map((a: any, i: number) => (
                    <div key={a.id || i} className="flex items-center gap-3">
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
          <div className={`${card} p-6 animate-fade-in-up`}>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
                <h2 className={`text-sm ${heading}`}>Application Trend</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${muted}`}>Last 7 Days</span>
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