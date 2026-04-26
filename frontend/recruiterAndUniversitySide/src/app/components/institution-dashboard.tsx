import { useState, useEffect } from "react";
import {
  Users, UserCheck, TrendingUp, Briefcase,
  AlertTriangle, FileText, Bell,
  ChevronRight, ChevronDown, LogOut, Sun, Moon, Search,
  BarChart3, Award, GraduationCap, LayoutDashboard,
  ClipboardList, Settings, Building2, Menu, X,
} from "lucide-react";
import { useTheme } from "./theme-context";
import { useNavigate } from "react-router";
import { EligibleStudents } from "./eligible-students";
import type { EligibleFilters } from "./eligible-students";
import { PlacementBranches } from "./placement-branches";
import type { HierNode } from "./placement-branches";
import { AllStudents, AllJobs, PendingJobs, AllApplications, RecruitersPage, SimplePlaceholder, DataRequestsPage } from "./institution-subpages";

/* ─── Sidebar Nav Config ─── */
type NavItem = {
  label: string;
  icon: React.ElementType;
  id: string;
  children?: { label: string; id: string; sectionTitle?: string }[];
};

const sidebarNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  {
    label: "Students", icon: GraduationCap, id: "students",
    children: [
      { label: "All Branches", id: "students-all" },
      { label: "Placement Branches", id: "students-placement" },
      { label: "Eligible Students", id: "students-eligible" },
      { label: "Data Requests", id: "students-data-requests" },
    ],
  },
  {
    label: "Jobs", icon: Briefcase, id: "jobs",
    children: [
      { label: "All Jobs", id: "jobs-all" },
      { label: "Pending Approvals", id: "jobs-pending" },
    ],
  },
  {
    label: "Applications", icon: ClipboardList, id: "applications",
    children: [
      { label: "All Applications", id: "applications-all" },
    ],
  },
  {
    label: "Analytics", icon: BarChart3, id: "analytics",
    children: [
      { label: "Student Analytics", id: "analytics-students" },
      { label: "Recruiter Analytics", id: "analytics-recruiters" },
    ],
  },
  { label: "Recruiters", icon: Building2, id: "recruiters" },
  { label: "Settings", icon: Settings, id: "settings" },
];

// Mock data removed in favor of dynamic fetch
const colorMap: Record<string, { bg: string; bgDk: string; text: string; textDk: string }> = {
  blue:   { bg: "bg-blue-50",   bgDk: "bg-blue-500/10",   text: "text-blue-600",   textDk: "text-blue-400" },
  green:  { bg: "bg-green-50",  bgDk: "bg-green-500/10",  text: "text-green-600",  textDk: "text-green-400" },
  indigo: { bg: "bg-indigo-50", bgDk: "bg-indigo-500/10", text: "text-indigo-600", textDk: "text-indigo-400" },
  amber:  { bg: "bg-amber-50",  bgDk: "bg-amber-500/10",  text: "text-amber-600",  textDk: "text-amber-400" },
  red:    { bg: "bg-red-50",    bgDk: "bg-red-500/10",    text: "text-red-600",    textDk: "text-red-400" },
};

/* ─── Sidebar Component ─── */
function Sidebar({
  dk, active, setActive, open, setOpen,
}: {
  dk: boolean; active: string; setActive: (id: string) => void; open: boolean; setOpen: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ students: true, jobs: true });

  const toggleExpand = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const isActive = (id: string) => active === id;
  const isParentActive = (item: NavItem) => item.children?.some((c) => c.id === active);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-60 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
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

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const hasChildren = !!item.children;
            const isExp = expanded[item.id];
            const parentActive = isParentActive(item);
            const selfActive = isActive(item.id);
            const highlighted = selfActive || parentActive;

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpand(item.id);
                    } else {
                      setActive(item.id);
                      setOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    highlighted
                      ? dk
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-blue-50 text-blue-600"
                      : dk
                        ? "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasChildren && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isExp ? "" : "-rotate-90"}`}
                    />
                  )}
                </button>
                {hasChildren && isExp && (
                  <div className="ml-7 mt-0.5 space-y-0.5">
                    {item.children!.map((child) => (
                      <div key={child.id}>
                        {child.sectionTitle && (
                          <p className={`px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider ${dk ? "text-gray-600" : "text-gray-400"}`}>
                            {child.sectionTitle}
                          </p>
                        )}
                        <button
                          onClick={() => { setActive(child.id); setOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                            isActive(child.id)
                              ? dk ? "text-blue-400 bg-blue-500/10" : "text-blue-600 bg-blue-50"
                              : dk ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {child.label}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className={`shrink-0 px-4 py-4 border-t ${dk ? "border-white/5" : "border-gray-200"}`}>
          <button
            onClick={() => navigate("/login")}
            className={`flex items-center gap-2 text-xs w-full px-2 py-2 rounded-lg transition-colors ${dk ? "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─── Main Dashboard ─── */
export function InstitutionDashboard() {
  const { theme, toggle } = useTheme();
  const dk = theme === "dark";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Placement Branches drill-down state (preserved when navigating away)
  const [placementPath, setPlacementPath] = useState<HierNode[]>([]);
  // Filters passed from Placement Branches → Eligible Students
  const [eligibleFilters, setEligibleFilters] = useState<EligibleFilters | undefined>(undefined);
  // Key to force EligibleStudents remount when filters change
  const [filterKey, setFilterKey] = useState(0);

  const [dashboardData, setDashboardData] = useState<any>({
    totalApplicants: 0,
    shortlistRate: 0,
    offersExtended: 0
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/university/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Failed to fetch university dashboard data", err);
      }
    };
    if (activeNav === "dashboard") {
      fetchDashboard();
    }
  }, [activeNav]);

  const handleShowStudents = (filters: EligibleFilters) => {
    setEligibleFilters(filters);
    setFilterKey((k) => k + 1);
    setActiveNav("students-eligible");
  };

  const card = `rounded-xl border ${dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-300"}`;
  const muted = dk ? "text-gray-400" : "text-gray-500";
  const heading = dk ? "text-white" : "text-gray-900";

  return (
    <div className={`min-h-screen flex ${dk ? "bg-[#0a0a0f] text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Sidebar */}
      <Sidebar dk={dk} active={activeNav} setActive={(id) => {
        // When manually clicking Eligible Students from sidebar, clear filters
        if (id === "students-eligible") {
          setEligibleFilters(undefined);
          setFilterKey((k) => k + 1);
        }
        setActiveNav(id);
      }} open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className={`sticky top-0 z-30 border-b ${dk ? "bg-[#0a0a0f]/80 border-white/10" : "bg-white/80 border-gray-300"} backdrop-blur-md`}>
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className={`w-5 h-5 ${dk ? "text-gray-300" : "text-gray-700"}`} />
              </button>
              <span className={`text-xs px-2 py-0.5 rounded-full ${dk ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400"}`}>Institution</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${dk ? "bg-white/[0.04] text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                <Search className="w-3.5 h-3.5" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="bg-transparent outline-none text-sm w-40"
                />
              </div>
              <button onClick={toggle} className={`p-2 rounded-lg transition-colors ${dk ? "hover:bg-white/5" : "hover:bg-gray-100"}`}>
                {dk ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        {activeNav === "students-eligible" ? (
          <EligibleStudents key={filterKey} initialFilters={eligibleFilters} />
        ) : activeNav === "students-placement" ? (
          <PlacementBranches
            path={placementPath}
            setPath={setPlacementPath}
            onShowStudents={handleShowStudents}
          />
        ) : activeNav === "students-all" ? (
          <AllStudents />
        ) : activeNav === "students-data-requests" ? (
          <DataRequestsPage />
        ) : activeNav === "jobs-all" ? (
          <AllJobs />
        ) : activeNav === "jobs-pending" ? (
          <PendingJobs />
        ) : activeNav === "applications-all" ? (
          <AllApplications />
        ) : activeNav === "analytics-students" ? (
          <SimplePlaceholder title="Student Analytics" desc="Detailed placement graphs and metrics." />
        ) : activeNav === "analytics-recruiters" ? (
          <SimplePlaceholder title="Recruiter Analytics" desc="Recruiter engagement and hiring statistics." />
        ) : activeNav === "recruiters" ? (
          <RecruitersPage />
        ) : activeNav === "settings" ? (
          <SimplePlaceholder title="Settings" desc="Manage institution profile and configuration." />
        ) : (
        <main className="flex-1 px-6 py-8 space-y-6 overflow-y-auto">
          {/* Greeting */}
          <div>
            <h1 className={`text-2xl tracking-tight ${heading}`}>Dashboard</h1>
            <p className={`text-sm mt-1 ${muted}`}>Welcome back. Here's your placement overview.</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dk ? colorMap.blue.bgDk : colorMap.blue.bg}`}>
                  <Users className={`w-4 h-4 ${dk ? colorMap.blue.textDk : colorMap.blue.text}`} />
                </div>
              </div>
              <p className={`text-2xl tracking-tight ${heading}`}>{dashboardData.totalApplicants}</p>
              <p className={`text-xs mt-1 ${muted}`}>Total Students</p>
            </div>
            
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dk ? colorMap.green.bgDk : colorMap.green.bg}`}>
                  <UserCheck className={`w-4 h-4 ${dk ? colorMap.green.textDk : colorMap.green.text}`} />
                </div>
              </div>
              <p className={`text-2xl tracking-tight ${heading}`}>{dashboardData.offersExtended}</p>
              <p className={`text-xs mt-1 ${muted}`}>Placed / Offers</p>
            </div>

            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dk ? colorMap.indigo.bgDk : colorMap.indigo.bg}`}>
                  <TrendingUp className={`w-4 h-4 ${dk ? colorMap.indigo.textDk : colorMap.indigo.text}`} />
                </div>
              </div>
              <p className={`text-2xl tracking-tight ${heading}`}>{dashboardData.shortlistRate}%</p>
              <p className={`text-xs mt-1 ${muted}`}>Overall Shortlist Rate</p>
            </div>
            
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dk ? colorMap.amber.bgDk : colorMap.amber.bg}`}>
                  <Briefcase className={`w-4 h-4 ${dk ? colorMap.amber.textDk : colorMap.amber.text}`} />
                </div>
              </div>
              <p className={`text-2xl tracking-tight ${heading}`}>--</p>
              <p className={`text-xs mt-1 ${muted}`}>Active Job Postings</p>
            </div>
          </div>

          {/* Middle row */}
          <div className="grid lg:grid-cols-5 gap-6">
            <div className={`lg:col-span-3 ${card} p-6`}>
              <h2 className={`text-sm mb-4 ${heading}`}>Recent Activity</h2>
              <div className="space-y-0">
                <div className="flex items-center gap-3 py-3">
                    <p className={`text-sm ${muted}`}>Dynamic feed not implemented for prototype.</p>
                </div>
              </div>
            </div>

            <div className={`lg:col-span-2 ${card} p-6`}>
              <h2 className={`text-sm mb-4 ${heading}`}>Needs Attention</h2>
              <div className="space-y-3">
                <p className={`text-sm ${muted}`}>No items currently need attention.</p>
              </div>
            </div>
          </div>

          {/* Active Jobs */}
          <div className={`${card} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-sm ${heading}`}>Active Jobs Overview</h2>
              <button className="text-xs text-blue-600 hover:text-blue-500 transition-colors">View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-xs ${muted}`}>
                    <th className="text-left pb-3 font-normal">Company</th>
                    <th className="text-left pb-3 font-normal">Role</th>
                    <th className="text-left pb-3 font-normal">Applicants</th>
                    <th className="text-left pb-3 font-normal">Status</th>
                    <th className="text-right pb-3 font-normal">Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className={`py-3 text-center ${muted}`}>Dynamic active jobs to be mapped.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className={`${card} p-6`}>
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
                <h2 className={`text-sm ${heading}`}>Placement Progress</h2>
              </div>
              <div className="flex items-end gap-6 mb-5">
                <div>
                  <p className={`text-4xl tracking-tight ${heading}`}>57<span className="text-lg">%</span></p>
                  <p className={`text-xs mt-1 ${muted}`}>Students placed</p>
                </div>
                <div>
                  <p className={`text-lg tracking-tight ${heading}`}>1,623</p>
                  <p className={`text-xs mt-1 ${muted}`}>of 2,847 total</p>
                </div>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${dk ? "bg-white/5" : "bg-gray-100"}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all" style={{ width: "57%" }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className={`text-xs ${muted}`}>0%</span>
                <span className={`text-xs ${muted}`}>Target: 75%</span>
                <span className={`text-xs ${muted}`}>100%</span>
              </div>
              <div className={`mt-5 pt-5 border-t grid grid-cols-3 gap-4 ${dk ? "border-white/5" : "border-gray-100"}`}>
                {[
                  { label: "CSE", pct: 72 },
                  { label: "IT", pct: 61 },
                  { label: "ECE", pct: 43 },
                ].map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={dk ? "text-gray-300" : "text-gray-700"}>{d.label}</span>
                      <span className={muted}>{d.pct}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full ${dk ? "bg-white/5" : "bg-gray-100"}`}>
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${card} p-6`}>
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
                <h2 className={`text-sm ${heading}`}>Student Insights</h2>
              </div>
              <div className="flex items-end gap-6 mb-6">
                <div>
                  <p className={`text-4xl tracking-tight ${heading}`}>78</p>
                  <p className={`text-xs mt-1 ${muted}`}>Avg. skill score</p>
                </div>
                <div>
                  <span className="text-xs text-green-500">+4 vs last semester</span>
                </div>
              </div>
              <h3 className={`text-xs mb-3 ${muted}`}>Top Performers</h3>
              <div className="space-y-2">
                <p className={`text-sm ${muted}`}>To be connected with automated score calculations.</p>
              </div>
            </div>
          </div>
        </main>
        )}
      </div>
    </div>
  );
}