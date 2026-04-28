import { useState, useEffect } from "react";
import { useTheme } from "./theme-context";
import { Building2, Briefcase, GraduationCap, ClipboardList, CheckCircle, XCircle, Search, Filter, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AcademicUnitSelector, collectDescendantNames, findNodeByLabel } from "./academic-unit-selector";
import type { AcademicNode } from "./academic-unit-selector";

const API_BASE = "http://localhost:3000/api";

const getStyles = (dk: boolean) => ({
  card: `rounded-xl border ${dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-300"} p-6`,
  heading: dk ? "text-white" : "text-gray-900",
  muted: dk ? "text-gray-400" : "text-gray-500",
  tableTh: `text-left pb-3 font-normal text-xs ${dk ? "text-gray-400" : "text-gray-500"}`,
  tableTd: `py-3 text-sm ${dk ? "text-gray-300 border-white/5" : "text-gray-700 border-gray-100"} border-t`,
});

function getToken() {
  return localStorage.getItem("token") || "";
}

function flattenUnitTree(nodes: any[], path: string[] = []): any[] {
  return nodes.flatMap((node) => {
    const nextPath = [...path, node.label];
    const children = Array.isArray(node.children) ? flattenUnitTree(node.children, nextPath) : [];
    return [
      {
        id: Number(node.id),
        label: node.label,
        type: node.type,
        parentId: node.parentId,
        level: node.level,
        path: nextPath.join(" > "),
        hasChildren: children.length > 0,
      },
      ...children,
    ];
  });
}

export function AllStudents() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [rejectingStudentId, setRejectingStudentId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [branches, setBranches] = useState<{label: string, id: number}[]>([]);
  const [unitTree, setUnitTree] = useState<AcademicNode[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/university/academic-units/tree`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(res => res.ok ? res.json() : { tree: [] })
      .then(data => {
        // Flatten tree to get all branches/departments
        const treeData = data.tree || [];
        setUnitTree(treeData);
        const flat = flattenUnitTree(treeData);
        setBranches(flat);
      })
      .catch(() => setBranches([]));
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    fetch(`${API_BASE}/university/students`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : { students: [] }))
      .then((data) => setStudents(Array.isArray(data) ? data : data.students || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/university/students/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) fetchStudents();
    } catch (e) {
      console.error("Failed to approve");
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/university/students/${id}/reject`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        setRejectingStudentId(null);
        setRejectReason("");
        fetchStudents();
      }
    } catch (e) {
      console.error("Failed to reject");
    }
  };

  const filteredStudents = students.filter((s: any) => {
    if (filter !== "ALL" && s.registrationStatus !== filter) return false;
    
    const branchName = s.placementBranch || s.branch || s.academicUnit?.name || "";
    
    // Hierarchical cascade: if a parent node is selected, include all descendants
    if (branchFilter !== "ALL") {
      const selectedNode = findNodeByLabel(unitTree, branchFilter);
      if (selectedNode) {
        const allowedNames = collectDescendantNames(selectedNode);
        if (!allowedNames.some(name => name === branchName)) return false;
      } else {
        // Fallback to exact match if node not found in tree
        if (branchName !== branchFilter) return false;
      }
    }

    if (search) {
      const term = search.toLowerCase();
      const name = s.user?.name?.toLowerCase() || "";
      if (!name.includes(term) && !branchName.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>All Students</h1>
        <p className={`text-sm mt-1 ${muted}`}>Manage student profiles and registration statuses.</p>
      </div>
      <div className={card}>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "bg-white/5 border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
              <Search className="w-4 h-4" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or branch..." className="bg-transparent outline-none w-64" />
            </div>
            <AcademicUnitSelector
              dk={dk}
              label=""
              selected={branchFilter === "ALL" ? [] : [branchFilter]}
              onSelect={(sel) => setBranchFilter(sel.length > 0 ? sel[0].name : "ALL")}
            />
          </div>
        </div>
        
        {/* Status Filters */}
        <div className="flex gap-2 mb-6">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                filter === status 
                  ? "bg-blue-600 text-white" 
                  : dk ? "bg-white/5 text-gray-400 hover:text-gray-200" : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className={`ml-2 text-sm ${muted}`}>Loading students…</span>
          </div>
        ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className={tableTh}>Name</th>
              <th className={tableTh}>Branch</th>
              <th className={tableTh}>CGPA</th>
              <th className={tableTh}>Status</th>
              <th className={tableTh}>Placement</th>
              <th className={`${tableTh} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr><td colSpan={6} className={`py-6 text-center ${muted}`}>No students found.</td></tr>
            ) : filteredStudents.map((s: any, i: number) => (
              <tr key={i}>
                <td className={tableTd}>{s.user?.name || "—"}</td>
                <td className={tableTd}>
                  <div>{s.placementBranch || s.branch || s.academicUnit?.name || "—"}</div>
                  {Array.isArray(s.academicPath) && s.academicPath.length > 0 && (
                    <p className={`text-[10px] mt-0.5 ${muted}`}>{s.academicPath.join(" > ")}</p>
                  )}
                </td>
                <td className={tableTd}>{s.cgpa}</td>
                <td className={tableTd}>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.registrationStatus === "APPROVED" ? (dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600") : s.registrationStatus === "REJECTED" ? (dk ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600") : (dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600")}`}>
                    {s.registrationStatus}
                  </span>
                  {s.registrationStatus === "REJECTED" && s.rejectionReason && (
                    <p className={`text-[10px] mt-1 ${muted}`}>Reason: {s.rejectionReason}</p>
                  )}
                </td>
                <td className={tableTd}>
                  {s.placementStatus === "PLACED" ? (
                    <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Placed</span>
                  ) : s.registrationStatus === "APPROVED" ? (
                    <span className={`text-xs ${muted}`}>Not Placed</span>
                  ) : (
                    <span className={`text-xs ${muted}`}>—</span>
                  )}
                </td>
                <td className={`${tableTd} text-right space-x-2`}>
                  {s.registrationStatus === "PENDING" && rejectingStudentId !== s.id && (
                    <>
                      <button onClick={() => handleApprove(s.id)} className={`text-xs px-2 py-1 rounded-md ${dk ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>Approve</button>
                      <button onClick={() => setRejectingStudentId(s.id)} className={`text-xs px-2 py-1 rounded-md ${dk ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>Reject</button>
                    </>
                  )}
                  {rejectingStudentId === s.id && (
                    <div className="flex flex-col items-end gap-2">
                      <input 
                        type="text" 
                        placeholder="Reason for rejection" 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className={`text-xs px-2 py-1 rounded border outline-none ${dk ? "bg-black/50 border-white/20 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setRejectingStudentId(null)} className={`text-xs px-2 py-1 text-gray-500`}>Cancel</button>
                        <button onClick={() => handleReject(s.id)} className={`text-xs px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700`}>Confirm</button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

export function AllJobs() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("title_asc");

  useEffect(() => {
    fetch(`${API_BASE}/jobs`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setJobs(Array.isArray(data) ? data : data.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = jobs
    .filter(j => {
      if (statusFilter !== "ALL" && j.approvalStatus !== statusFilter) return false;
      if (search) {
        const term = search.toLowerCase();
        if (!(j.title?.toLowerCase().includes(term) || j.company?.name?.toLowerCase().includes(term))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "title_asc") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "cgpa_desc") return (b.minCgpa || 0) - (a.minCgpa || 0);
      if (sortBy === "cgpa_asc") return (a.minCgpa || 0) - (b.minCgpa || 0);
      return 0;
    });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>All Jobs</h1>
        <p className={`text-sm mt-1 ${muted}`}>View all jobs posted by recruiters.</p>
      </div>
      <div className={card}>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "bg-white/5 border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
            <Search className="w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search job title or company..." className="bg-transparent outline-none w-64" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
              <option value="ALL">All Statuses</option>
              <option value="PENDING_REVIEW">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
              <option value="title_asc">Title A-Z</option>
              <option value="cgpa_desc">Min CGPA ↓</option>
              <option value="cgpa_asc">Min CGPA ↑</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className={`ml-2 text-sm ${muted}`}>Loading jobs…</span>
          </div>
        ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className={tableTh}>Company</th>
              <th className={tableTh}>Title</th>
              <th className={tableTh}>Target Branches</th>
              <th className={tableTh}>Min CGPA</th>
              <th className={tableTh}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr><td colSpan={5} className={`py-6 text-center ${muted}`}>{search || statusFilter !== "ALL" ? "No jobs match the current filters." : "No jobs found."}</td></tr>
            ) : filteredJobs.map((j: any, i: number) => (
              <tr key={i}>
                <td className={tableTd}>{j.company?.name || "—"}</td>
                <td className={tableTd}>{j.title}</td>
                <td className={tableTd}>{Array.isArray(j.targetBranches) ? j.targetBranches.join(", ") : "All"}</td>
                <td className={tableTd}>{j.minCgpa}</td>
                <td className={tableTd}>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${j.approvalStatus === "APPROVED" ? (dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600") : j.approvalStatus === "REJECTED" ? (dk ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600") : (dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600")}`}>
                    {j.approvalStatus || "UNKNOWN"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

export function PendingJobs() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionJobId, setActionJobId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [universityDeadline, setUniversityDeadline] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("deadline_asc");

  const fetchJobs = () => {
    setLoading(true);
    fetch(`${API_BASE}/university/jobs/pending`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const pendingJobs = Array.isArray(data) ? data : data.jobs || [];
        setJobs(pendingJobs);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdateStatus = async (jobId: number, status: string, reason?: string, deadline?: string) => {
    try {
      const res = await fetch(`${API_BASE}/university/jobs/${jobId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ 
          status, 
          ...(reason && { rejectionReason: reason }),
          ...(deadline && { universityDeadline: deadline })
        })
      });
      if (res.ok) {
        setActionJobId(null);
        setActionType(null);
        setRejectionReason("");
        setUniversityDeadline("");
        fetchJobs();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to update job status");
      }
    } catch (e) {
      console.error("Failed to update job status");
      toast.error("An error occurred");
    }
  };

  const filteredJobs = jobs
    .filter(j => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (j.title?.toLowerCase().includes(term) || j.company?.name?.toLowerCase().includes(term));
    })
    .sort((a, b) => {
      if (sortBy === "deadline_asc") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sortBy === "deadline_desc") return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      if (sortBy === "cgpa_desc") return (b.minCgpa || 0) - (a.minCgpa || 0);
      return 0;
    });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Pending Approvals</h1>
        <p className={`text-sm mt-1 ${muted}`}>Review and approve job postings from recruiters.</p>
      </div>
      <div className={card}>
        <div className="flex justify-between items-center mb-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "bg-white/5 border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
            <Search className="w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs or companies..." className="bg-transparent outline-none w-64" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
            <option value="deadline_asc">Deadline (Earliest)</option>
            <option value="deadline_desc">Deadline (Latest)</option>
            <option value="cgpa_desc">Min CGPA (Highest)</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className={`ml-2 text-sm ${muted}`}>Loading pending jobs…</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className={muted}>{search ? "No jobs match your search." : "No pending job approvals at this time."}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableTh}>Company</th>
                <th className={tableTh}>Title</th>
                <th className={tableTh}>Min CGPA</th>
                <th className={tableTh}>Deadline</th>
                <th className={`${tableTh} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((j: any, i: number) => (
                <tr key={i}>
                  <td className={tableTd}>{j.company?.name || "—"}</td>
                  <td className={tableTd}>{j.title}</td>
                  <td className={tableTd}>{j.minCgpa}</td>
                  <td className={tableTd}>{new Date(j.deadline).toLocaleDateString()}</td>
                  <td className={`${tableTd} text-right space-x-2`}>
                    {actionJobId !== j.id && (
                      <>
                        <button onClick={() => { setActionJobId(j.id); setActionType("APPROVE"); setUniversityDeadline(""); }} className={`text-xs px-2 py-1 rounded-md ${dk ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>Approve</button>
                        <button onClick={() => { setActionJobId(j.id); setActionType("REJECT"); setRejectionReason(""); }} className={`text-xs px-2 py-1 rounded-md ${dk ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>Reject</button>
                      </>
                    )}
                    {actionJobId === j.id && actionType === "APPROVE" && (
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-left w-full max-w-[200px]">
                          <label className={`block text-[10px] mb-1 ${muted}`}>Set earlier deadline (optional)</label>
                          <input 
                            type="date" 
                            value={universityDeadline}
                            onChange={(e) => setUniversityDeadline(e.target.value)}
                            max={new Date(j.deadline).toISOString().split('T')[0]} // Cannot be after recruiter deadline
                            className={`w-full text-xs px-2 py-1 rounded border outline-none ${dk ? "bg-black/50 border-white/20 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setActionJobId(null); setActionType(null); }} className={`text-xs px-2 py-1 text-gray-500`}>Cancel</button>
                          <button onClick={() => handleUpdateStatus(j.id, "APPROVED", undefined, universityDeadline || undefined)} className={`text-xs px-2 py-1 rounded-md bg-green-600 text-white hover:bg-green-700`}>Confirm</button>
                        </div>
                      </div>
                    )}
                    {actionJobId === j.id && actionType === "REJECT" && (
                      <div className="flex flex-col items-end gap-2">
                        <input 
                          type="text" 
                          placeholder="Reason for rejection" 
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className={`text-xs px-2 py-1 rounded border outline-none w-full max-w-[200px] ${dk ? "bg-black/50 border-white/20 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => { setActionJobId(null); setActionType(null); }} className={`text-xs px-2 py-1 text-gray-500`}>Cancel</button>
                          <button onClick={() => handleUpdateStatus(j.id, "REJECTED", rejectionReason)} className={`text-xs px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700`}>Confirm</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function AllApplications() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("match_desc");
  const [minMatch, setMinMatch] = useState("");

  const fetchApps = () => {
    setLoading(true);
    fetch(`${API_BASE}/university/applications`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const applications = Array.isArray(data) ? data : data.applications || [];
        setApps(applications.map((a: any) => ({
          id: a.id,
          student: a.student?.user?.name || "—",
          job: a.job?.title || "—",
          match: Math.round(a.matchScore || 0),
          status: a.status,
        })));
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  const minMatchNum = minMatch ? Number(minMatch) : 0;
  const filteredApps = apps
    .filter(a => {
      if (filter !== "ALL" && a.status !== filter) return false;
      if (minMatchNum > 0 && a.match < minMatchNum) return false;
      if (search && !a.student.toLowerCase().includes(search.toLowerCase()) && !a.job.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "match_desc") return b.match - a.match;
      if (sortBy === "match_asc") return a.match - b.match;
      if (sortBy === "student_asc") return a.student.localeCompare(b.student);
      return 0;
    });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Applications</h1>
        <p className={`text-sm mt-1 ${muted}`}>Overview of all student applications across jobs.</p>
      </div>
      <div className={card}>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "bg-white/5 border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
            <Search className="w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or job..." className="bg-transparent outline-none w-64" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
              <option value="ALL">All Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="FORWARDED_TO_RECRUITER">Forwarded</option>
              <option value="SHORTLISTED_BY_RECRUITER">Shortlisted</option>
              <option value="REJECTED_BY_UNIVERSITY">Rejected</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
              <option value="match_desc">Match Score ↓</option>
              <option value="match_asc">Match Score ↑</option>
              <option value="student_asc">Student A-Z</option>
            </select>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-sm ${dk ? "border-white/10" : "border-gray-300"}`}>
              <span className={`text-xs whitespace-nowrap ${muted}`}>Min:</span>
              <select value={["50","60","70","80","90"].includes(minMatch) ? minMatch : ""} onChange={(e) => setMinMatch(e.target.value)} className={`text-xs bg-transparent outline-none ${dk ? "text-white" : "text-gray-900"}`}>
                <option value="">Any</option>
                <option value="50">≥50%</option>
                <option value="60">≥60%</option>
                <option value="70">≥70%</option>
                <option value="80">≥80%</option>
                <option value="90">≥90%</option>
              </select>
              <input type="number" min="0" max="100" placeholder="custom" value={["50","60","70","80","90",""].includes(minMatch) ? "" : minMatch} onChange={(e) => setMinMatch(e.target.value)} className={`w-12 text-xs bg-transparent outline-none text-center ${dk ? "text-white placeholder:text-gray-600" : "text-gray-900 placeholder:text-gray-400"}`} />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className={`ml-2 text-sm ${muted}`}>Loading applications…</span>
          </div>
        ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className={tableTh}>Student</th>
              <th className={tableTh}>Job</th>
              <th className={tableTh}>Match Score</th>
              <th className={tableTh}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr><td colSpan={4} className={`py-6 text-center ${muted}`}>No applications found.</td></tr>
            ) : filteredApps.map((a: any, i: number) => (
              <tr key={i}>
                <td className={tableTd}>{a.student}</td>
                <td className={tableTd}>{a.job}</td>
                <td className={tableTd}>{a.match}%</td>
                <td className={tableTd}>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "SHORTLISTED_BY_RECRUITER" ? (dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600") : a.status === "REJECTED_BY_UNIVERSITY" ? (dk ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600") : a.status === "FORWARDED_TO_RECRUITER" ? (dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600") : (dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600")}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

export function RecruitersPage() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/university/companies`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCompanies(Array.isArray(data) ? data : data.companies || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Recruiters & Companies</h1>
        <p className={`text-sm mt-1 ${muted}`}>Manage companies partnered with your institution.</p>
      </div>
      <div className={card}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className={`ml-2 text-sm ${muted}`}>Loading companies…</span>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
            <p className={muted}>No companies partnered yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableTh}>Company Name</th>
                <th className={tableTh}>Industry</th>
                <th className={tableTh}>Jobs Posted</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c: any, i: number) => (
                <tr key={i}>
                  <td className={tableTd}>{c.name}</td>
                  <td className={tableTd}>{c.industry || "—"}</td>
                  <td className={tableTd}>{c._count?.jobs || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function SimplePlaceholder({ title, desc }: { title: string, desc: string }) {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { heading, muted } = getStyles(dk);
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>{title}</h1>
        <p className={`text-sm mt-1 ${muted}`}>{desc}</p>
      </div>
      <div className={`h-64 rounded-xl border border-dashed flex items-center justify-center ${dk ? "border-white/20 text-gray-500" : "border-gray-300 text-gray-400"}`}>
        Content for {title} will be populated here.
      </div>
    </div>
  );
}

export function AcademicUnitsPage() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: 0, name: "", type: "Section", parentType: "", parentId: "" });

  const fetchUnits = () => {
    setLoading(true);
    fetch(`${API_BASE}/university/academic-units/tree`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : { tree: [] }))
      .then((data) => setUnits(flattenUnitTree(data.tree || [])))
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const resetForm = () => setForm({ id: 0, name: "", type: "Section", parentType: "", parentId: "" });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const url = form.id ? `${API_BASE}/university/academic-units/${form.id}` : `${API_BASE}/university/academic-units`;
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        name: form.name,
        type: form.type,
        parentId: form.parentId ? Number(form.parentId) : null,
      }),
    });
    if (res.ok) {
      resetForm();
      fetchUnits();
      toast.success(form.id ? "Academic unit updated." : "Academic unit created.");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Failed to save academic unit.");
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`${API_BASE}/university/academic-units/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) fetchUnits();
    else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Failed to delete academic unit.");
    }
  };

  const editingUnit = units.find((unit) => unit.id === form.id);
  const parentOptions = units.filter((unit) => (
    unit.id !== form.id &&
    (!form.parentType || unit.type === form.parentType) &&
    (!editingUnit || !unit.path.startsWith(`${editingUnit.path} > `))
  ));
  const parentTypes = Array.from(new Set(units.map((unit) => unit.type).filter(Boolean)));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Academic Units</h1>
        <p className={`text-sm mt-1 ${muted}`}>Manage the hierarchy students select during registration.</p>
      </div>
      <div className={card}>
        <h3 className={`text-sm font-medium mb-4 ${heading}`}>{form.id ? "Edit Unit" : "Create Unit"}</h3>
        <div className="grid md:grid-cols-5 gap-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className={`px-3 py-2 rounded-lg text-sm border outline-none ${dk ? "bg-black/50 border-white/10" : "bg-white border-gray-300"}`} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={`px-3 py-2 rounded-lg text-sm border outline-none ${dk ? "bg-black/50 border-white/10" : "bg-white border-gray-300"}`}>
            {["School", "Department", "Section", "Stream", "Branch", "Program"].map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={form.parentType} onChange={(e) => setForm({ ...form, parentType: e.target.value, parentId: "" })} className={`px-3 py-2 rounded-lg text-sm border outline-none ${dk ? "bg-black/50 border-white/10" : "bg-white border-gray-300"}`}>
            <option value="">Parent type</option>
            {parentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className={`px-3 py-2 rounded-lg text-sm border outline-none ${dk ? "bg-black/50 border-white/10" : "bg-white border-gray-300"}`}>
            <option value="">No parent</option>
            {parentOptions.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">{form.id ? "Update" : "Create"}</button>
            {form.id !== 0 && <button onClick={resetForm} className={`px-4 py-2 rounded-lg text-sm border ${dk ? "border-white/10 text-gray-300" : "border-gray-200 text-gray-700"}`}>Cancel</button>}
          </div>
        </div>
      </div>

      <div className={card}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableTh}>Path</th>
                <th className={tableTh}>Type</th>
                <th className={`${tableTh} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td className={tableTd}>{unit.path}</td>
                  <td className={tableTd}>{unit.type || "Unit"}</td>
                  <td className={`${tableTd} text-right space-x-2`}>
                    <button onClick={() => {
                      const parent = units.find((candidate) => candidate.id === unit.parentId);
                      setForm({ id: unit.id, name: unit.label, type: unit.type || "Section", parentType: parent?.type || "", parentId: unit.parentId ? String(unit.parentId) : "" });
                    }} className="text-xs text-blue-600">Edit</button>
                    {!unit.hasChildren && <button onClick={() => handleDelete(unit.id)} className="text-xs text-red-500">Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


export function StudentAnalytics() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/analytics/students`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  if (!stats) return <div className="p-6"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Student Analytics</h1>
        <p className={`text-sm mt-1 ${muted}`}>Detailed placement graphs and metrics.</p>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className={`${card} text-center`}>
          <p className={`text-3xl tracking-tight ${heading}`}>{stats.totalStudents}</p>
          <p className={`text-xs mt-1 ${muted}`}>Total Students</p>
        </div>
        <div className={`${card} text-center`}>
          <p className={`text-3xl tracking-tight ${heading}`}>{stats.placedStudents}</p>
          <p className={`text-xs mt-1 ${muted}`}>Placed</p>
        </div>
        <div className={`${card} text-center`}>
          <p className={`text-3xl tracking-tight ${heading}`}>{stats.unplacedStudents}</p>
          <p className={`text-xs mt-1 ${muted}`}>Unplaced</p>
        </div>
        <div className={`${card} text-center`}>
          <p className={`text-3xl tracking-tight ${heading}`}>{stats.placementRate}%</p>
          <p className={`text-xs mt-1 ${muted}`}>Placement Rate</p>
        </div>
      </div>
      <div className={card}>
        <h3 className={`text-sm font-medium mb-4 ${heading}`}>Placement by Branch</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className={tableTh}>Branch</th>
              <th className={tableTh}>Total</th>
              <th className={tableTh}>Placed</th>
              <th className={tableTh}>Rate</th>
            </tr>
          </thead>
          <tbody>
            {(stats.branchStats || []).map((b: any, i: number) => (
              <tr key={i}>
                <td className={tableTd}>{b.branch}</td>
                <td className={tableTd}>{b.total}</td>
                <td className={tableTd}>{b.placed}</td>
                <td className={tableTd}>{b.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RecruiterAnalytics() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/analytics/recruiters`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  if (!stats) return <div className="p-6"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Recruiter Analytics</h1>
        <p className={`text-sm mt-1 ${muted}`}>Recruiter engagement and hiring statistics.</p>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className={`${card} text-center`}>
          <p className={`text-3xl tracking-tight ${heading}`}>{stats.totalCompanies}</p>
          <p className={`text-xs mt-1 ${muted}`}>Total Companies</p>
        </div>
        <div className={`${card} text-center`}>
          <p className={`text-3xl tracking-tight ${heading}`}>{stats.totalJobs}</p>
          <p className={`text-xs mt-1 ${muted}`}>Total Jobs</p>
        </div>
        <div className={`${card} text-center`}>
          <p className={`text-3xl tracking-tight ${heading}`}>{stats.activeJobs}</p>
          <p className={`text-xs mt-1 ${muted}`}>Active Jobs</p>
        </div>
        <div className={`${card} text-center`}>
          <p className={`text-3xl tracking-tight ${heading}`}>{stats.totalApplications}</p>
          <p className={`text-xs mt-1 ${muted}`}>Total Applications</p>
        </div>
      </div>
      <div className={card}>
        <h3 className={`text-sm font-medium mb-4 ${heading}`}>Top Hiring Companies</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className={tableTh}>Company</th>
              <th className={tableTh}>Jobs Posted</th>
            </tr>
          </thead>
          <tbody>
            {(stats.topCompanies || []).map((c: any, i: number) => (
              <tr key={i}>
                <td className={tableTd}>{c.name}</td>
                <td className={tableTd}>{c.jobsPosted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted } = getStyles(dk);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    name: "",
    minGlobalCgpa: 0,
    maxGlobalBacklogs: 0,
    allowedBranches: [] as string[]
  });

  const fetchSettings = () => {
    setLoading(true);
    fetch(`${API_BASE}/university/settings`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.university) {
          const uni = data.university;
          const filter = uni.filters.length > 0 ? uni.filters[0] : null;
          setSettings({
            name: uni.name || "",
            minGlobalCgpa: filter ? filter.minGlobalCgpa : 0,
            maxGlobalBacklogs: filter ? filter.maxGlobalBacklogs : 0,
            allowedBranches: filter && filter.allowedBranches ? filter.allowedBranches : []
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/university/settings`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success("Settings saved successfully.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Settings</h1>
        <p className={`text-sm mt-1 ${muted}`}>Manage institution profile and configuration.</p>
      </div>

      <div className={`${card} max-w-2xl`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className={`text-sm font-medium mb-4 ${heading}`}>University Profile</h3>
              <label className={`block text-xs mb-1.5 ${muted}`}>University Name</label>
              <input
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${dk ? "bg-black/50 border-white/10 focus:border-blue-500/50" : "bg-white border-gray-300 focus:border-blue-500"}`}
              />
            </div>

            <div className={`pt-6 border-t ${dk ? "border-white/10" : "border-gray-200"}`}>
              <h3 className={`text-sm font-medium mb-4 ${heading}`}>Global Eligibility Filters</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs mb-1.5 ${muted}`}>Minimum CGPA required to register</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.minGlobalCgpa}
                    onChange={(e) => setSettings({ ...settings, minGlobalCgpa: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${dk ? "bg-black/50 border-white/10 focus:border-blue-500/50" : "bg-white border-gray-300 focus:border-blue-500"}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1.5 ${muted}`}>Maximum Active Backlogs allowed</label>
                  <input
                    type="number"
                    value={settings.maxGlobalBacklogs}
                    onChange={(e) => setSettings({ ...settings, maxGlobalBacklogs: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${dk ? "bg-black/50 border-white/10 focus:border-blue-500/50" : "bg-white border-gray-300 focus:border-blue-500"}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DataRequestsPage() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [requests, setRequests] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fieldName: "", fieldType: "text", isRequired: true });

  const fetchRequests = () => {
    setLoading(true);
    fetch(`${API_BASE}/university/data-requests`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  const fetchSubmissions = () => {
    fetch(`${API_BASE}/university/data-requests/submissions`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : { submissions: [] }))
      .then((data) => setSubmissions(data.submissions || []))
      .catch(() => setSubmissions([]));
  };

  useEffect(() => {
    fetchRequests();
    fetchSubmissions();
  }, []);

  const handleCreate = async () => {
    if (!form.fieldName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/university/data-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        setRequests([...requests, data.request]);
        setForm({ fieldName: "", fieldType: "text", isRequired: true });
        setShowForm(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/university/data-requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setRequests((current) => current.filter((request) => request.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmissionStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/university/data-requests/submissions/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Submission ${status.toLowerCase()}.`);
        fetchSubmissions();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to update submission.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to update submission.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl tracking-tight ${heading}`}>Data Requests</h1>
          <p className={`text-sm mt-1 ${muted}`}>Define extra information students need to provide.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`px-4 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-500 transition-colors`}>
          Create Request
        </button>
      </div>

      {showForm && (
        <div className={`${card} border-blue-500/30`}>
          <h3 className={`text-sm font-medium mb-4 ${heading}`}>Create New Data Request</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className={`block text-xs mb-1.5 ${muted}`}>Field Name</label>
              <input
                value={form.fieldName}
                onChange={(e) => setForm({ ...form, fieldName: e.target.value })}
                placeholder="e.g. GitHub URL, Portfolio Link"
                className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${dk ? "bg-black/50 border-white/10 focus:border-blue-500/50" : "bg-white border-gray-300 focus:border-blue-500"}`}
              />
            </div>
            <div className="w-40">
              <label className={`block text-xs mb-1.5 ${muted}`}>Type</label>
              <select
                value={form.fieldType}
                onChange={(e) => setForm({ ...form, fieldType: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${dk ? "bg-black/50 border-white/10" : "bg-white border-gray-300"}`}
              >
                <option value="text">Text / String</option>
                <option value="url">URL Link</option>
                <option value="number">Number</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={form.isRequired}
                onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className={`text-sm ${muted}`}>Required</span>
            </div>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Field
            </button>
          </div>
        </div>
      )}

      <div className={card}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableTh}>Field Name</th>
                <th className={tableTh}>Type</th>
                <th className={tableTh}>Required</th>
                <th className={`${tableTh} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={4} className={`py-6 text-center ${muted}`}>No custom fields created.</td></tr>
              ) : requests.map((r: any, i: number) => (
                <tr key={i}>
                  <td className={tableTd}>{r.fieldName}</td>
                  <td className={tableTd}>{r.fieldType}</td>
                  <td className={tableTd}>{r.isRequired ? "Yes" : "No"}</td>
                  <td className={`${tableTd} text-right`}>
                    <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-600 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={card}>
        <h3 className={`text-sm font-medium mb-4 ${heading}`}>Student Submissions</h3>
        {submissions.length === 0 ? (
          <p className={`text-sm ${muted}`}>No student submissions yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableTh}>Student</th>
                <th className={tableTh}>Request</th>
                <th className={tableTh}>Value</th>
                <th className={tableTh}>Status</th>
                <th className={`${tableTh} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission: any) => (
                <tr key={submission.id}>
                  <td className={tableTd}>{submission.student?.user?.name || "—"}</td>
                  <td className={tableTd}>{submission.request?.fieldName || "—"}</td>
                  <td className={tableTd}>{submission.value}</td>
                  <td className={tableTd}>{submission.status || "PENDING"}</td>
                  <td className={`${tableTd} text-right space-x-2`}>
                    {submission.status !== "APPROVED" && (
                      <button onClick={() => handleSubmissionStatus(submission.id, "APPROVED")} className="text-xs text-green-600 hover:text-green-700">Approve</button>
                    )}
                    {submission.status !== "REJECTED" && (
                      <button onClick={() => handleSubmissionStatus(submission.id, "REJECTED")} className="text-xs text-red-500 hover:text-red-600">Reject</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function CertificationsReview() {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCerts = async () => {
    try {
      const res = await fetch(API_BASE + '/university/certifications', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setCerts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCerts(); }, []);

  const toggleVerify = async (id: number, verify: boolean) => {
    try {
      const res = await fetch(API_BASE + `/university/certifications/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ verified: verify })
      });
      if (res.ok) {
        toast.success(verify ? 'Certification verified' : 'Certification rejected');
        fetchCerts();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Certification Review</h1>
        <p className={`text-sm mt-1 ${muted}`}>Verify student certifications to reflect accurately in profiles.</p>
      </div>
      <div className={card}>
        {loading ? <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div> : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableTh}>Student</th>
                <th className={tableTh}>Platform</th>
                <th className={tableTh}>Certificate</th>
                <th className={tableTh}>Issue Date</th>
                <th className={tableTh}>Status</th>
                <th className={tableTh}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certs.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-sm text-gray-500">No certifications found.</td></tr>}
              {certs.map(c => (
                <tr key={c.id}>
                  <td className={tableTd}>
                    <div className="font-medium">{c.studentName}</div>
                    <div className="text-xs text-gray-400">{c.studentBranch}</div>
                  </td>
                  <td className={tableTd}>{c.platform}</td>
                  <td className={tableTd}>
                    {c.credentialUrl ? <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{c.name}</a> : c.name}
                  </td>
                  <td className={tableTd}>{c.issueDate}</td>
                  <td className={tableTd}>
                    {c.verified ? 
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">Verified</span> :
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Pending</span>
                    }
                  </td>
                  <td className={tableTd}>
                    <div className="flex gap-2">
                      {!c.verified && <button onClick={() => toggleVerify(c.id, true)} className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">Verify</button>}
                      {c.verified && <button onClick={() => toggleVerify(c.id, false)} className="text-xs px-2 py-1 border border-red-200 text-red-500 rounded hover:bg-red-50">Reject</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function PendingApplications() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("match_desc");
  const [minMatch, setMinMatch] = useState("");
  const [selectedApps, setSelectedApps] = useState<number[]>([]);
  const [actionAppId, setActionAppId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchApps = () => {
    setLoading(true);
    fetch(`${API_BASE}/university/applications/pending`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const applications = Array.isArray(data) ? data : data.applications || [];
        setApps(applications.map((a: any) => ({
          id: a.id,
          student: a.student?.user?.name || "—",
          job: a.job?.title || "—",
          match: Math.round(a.matchScore || 0),
          status: a.status,
        })));
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const minMatchNum = minMatch ? Number(minMatch) : 0;
  const filteredApps = apps
    .filter(a => {
      if (minMatchNum > 0 && a.match < minMatchNum) return false;
      if (search && !a.student.toLowerCase().includes(search.toLowerCase()) && !a.job.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "match_desc") return b.match - a.match;
      if (sortBy === "match_asc") return a.match - b.match;
      if (sortBy === "student_asc") return a.student.localeCompare(b.student);
      return 0;
    });

  const toggleSelectAll = () => {
    if (selectedApps.length === filteredApps.length && selectedApps.length > 0) {
      setSelectedApps([]);
    } else {
      setSelectedApps(filteredApps.map(a => a.id));
    }
  };

  const handleBulkAction = async () => {
    if (selectedApps.length === 0) return;
    try {
      const res = await fetch(`${API_BASE}/university/applications/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ applicationIds: selectedApps, status: "FORWARDED_TO_RECRUITER" })
      });
      if (res.ok) {
        toast.success("Applications forwarded successfully");
        setSelectedApps([]);
        fetchApps();
      } else {
        toast.error("Failed to forward applications");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/university/applications/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) fetchApps();
    } catch (e) {
      toast.error("Failed to approve application");
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/university/applications/${id}/reject`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        setActionAppId(null);
        setRejectReason("");
        fetchApps();
      }
    } catch (e) {
      toast.error("Failed to reject application");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Pending Applications</h1>
        <p className={`text-sm mt-1 ${muted}`}>Review student applications before forwarding them to recruiters.</p>
      </div>
      <div className={card}>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "bg-white/5 border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
            <Search className="w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or job..." className="bg-transparent outline-none w-64" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
              <option value="match_desc">Match Score ↓</option>
              <option value="match_asc">Match Score ↑</option>
              <option value="student_asc">Student A-Z</option>
            </select>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-sm ${dk ? "border-white/10" : "border-gray-300"}`}>
              <span className={`text-xs whitespace-nowrap ${muted}`}>Min:</span>
              <select value={["50","60","70","80","90"].includes(minMatch) ? minMatch : ""} onChange={(e) => setMinMatch(e.target.value)} className={`text-xs bg-transparent outline-none ${dk ? "text-white" : "text-gray-900"}`}>
                <option value="">Any</option>
                <option value="50">≥50%</option>
                <option value="60">≥60%</option>
                <option value="70">≥70%</option>
                <option value="80">≥80%</option>
                <option value="90">≥90%</option>
              </select>
              <input type="number" min="0" max="100" placeholder="custom" value={["50","60","70","80","90",""].includes(minMatch) ? "" : minMatch} onChange={(e) => setMinMatch(e.target.value)} className={`w-12 text-xs bg-transparent outline-none text-center ${dk ? "text-white placeholder:text-gray-600" : "text-gray-900 placeholder:text-gray-400"}`} />
            </div>
            {selectedApps.length > 0 && (
              <button onClick={handleBulkAction} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Forward Selected ({selectedApps.length})
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className={`ml-2 text-sm ${muted}`}>Loading applications…</span>
          </div>
        ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className={`${tableTh} w-10`}>
                <input 
                  type="checkbox" 
                  checked={selectedApps.length > 0 && selectedApps.length === filteredApps.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className={tableTh}>Student</th>
              <th className={tableTh}>Job</th>
              <th className={tableTh}>Match Score</th>
              <th className={`${tableTh} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr><td colSpan={5} className={`py-6 text-center ${muted}`}>No pending applications found.</td></tr>
            ) : filteredApps.map((a: any, i: number) => (
              <tr key={i}>
                <td className={tableTd}>
                  <input 
                    type="checkbox" 
                    checked={selectedApps.includes(a.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedApps([...selectedApps, a.id]);
                      else setSelectedApps(selectedApps.filter(id => id !== a.id));
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className={tableTd}>{a.student}</td>
                <td className={tableTd}>{a.job}</td>
                <td className={tableTd}>{a.match}%</td>
                <td className={`${tableTd} text-right space-x-2`}>
                  {actionAppId !== a.id && (
                    <>
                      <button onClick={() => handleApprove(a.id)} className={`text-xs px-2 py-1 rounded-md ${dk ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>Approve</button>
                      <button onClick={() => setActionAppId(a.id)} className={`text-xs px-2 py-1 rounded-md ${dk ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>Reject</button>
                    </>
                  )}
                  {actionAppId === a.id && (
                    <div className="flex flex-col items-end gap-2">
                      <input 
                        type="text" 
                        placeholder="Reason for rejection" 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className={`text-xs px-2 py-1 rounded border outline-none w-full max-w-[200px] ${dk ? "bg-black/50 border-white/20 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { setActionAppId(null); setRejectReason(""); }} className={`text-xs px-2 py-1 text-gray-500`}>Cancel</button>
                        <button onClick={() => handleReject(a.id)} className={`text-xs px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700`}>Confirm</button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
