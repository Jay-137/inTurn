import { useState, useEffect } from "react";
import { useTheme } from "./theme-context";
import { Building2, Briefcase, GraduationCap, ClipboardList, CheckCircle, XCircle, Search, Filter, Loader2 } from "lucide-react";

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

export function AllStudents() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/university/students`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : { students: [] }))
      .then((data) => setStudents(Array.isArray(data) ? data : data.students || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>All Students</h1>
        <p className={`text-sm mt-1 ${muted}`}>Manage and view all registered students.</p>
      </div>
      <div className={card}>
        <div className="flex justify-between items-center mb-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "bg-white/5 border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
            <Search className="w-4 h-4" />
            <input placeholder="Search students..." className="bg-transparent outline-none w-64" />
          </div>
          <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
            <Filter className="w-4 h-4" /> Filters
          </button>
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
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={4} className={`py-6 text-center ${muted}`}>No students found.</td></tr>
            ) : students.map((s: any, i: number) => (
              <tr key={i}>
                <td className={tableTd}>{s.user?.name || "—"}</td>
                <td className={tableTd}>{s.branch || s.academicUnit?.name || "—"}</td>
                <td className={tableTd}>{s.cgpa}</td>
                <td className={tableTd}>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.registrationStatus === "APPROVED" ? (dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600") : (dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600")}`}>
                    {s.registrationStatus}
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

export function AllJobs() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/jobs`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setJobs(Array.isArray(data) ? data : data.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>All Jobs</h1>
        <p className={`text-sm mt-1 ${muted}`}>View all jobs posted by recruiters.</p>
      </div>
      <div className={card}>
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
            {jobs.length === 0 ? (
              <tr><td colSpan={5} className={`py-6 text-center ${muted}`}>No jobs found.</td></tr>
            ) : jobs.map((j: any, i: number) => (
              <tr key={i}>
                <td className={tableTd}>{j.company?.name || "—"}</td>
                <td className={tableTd}>{j.title}</td>
                <td className={tableTd}>{Array.isArray(j.targetBranches) ? j.targetBranches.join(", ") : "All"}</td>
                <td className={tableTd}>{j.minCgpa}</td>
                <td className={tableTd}>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(j.deadline) > new Date() ? (dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600") : (dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600")}`}>
                    {new Date(j.deadline) > new Date() ? "Active" : "Expired"}
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
  const { card, heading, muted } = getStyles(dk);

  // For a prototype, pending jobs would be a filtered subset — we show a placeholder message
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Pending Approvals</h1>
        <p className={`text-sm mt-1 ${muted}`}>Review and approve job postings from recruiters.</p>
      </div>
      <div className={`${card} text-center py-12`}>
        <p className={muted}>No pending job approvals at this time.</p>
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

  useEffect(() => {
    // Fetch all applications across all jobs. 
    // For the prototype we use a simple endpoint or combine data.
    fetch(`${API_BASE}/jobs`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then(async (data) => {
        const jobList = Array.isArray(data) ? data : data.jobs || [];
        // If there are jobs, fetch applicants for each
        const allApps: any[] = [];
        for (const job of jobList.slice(0, 10)) {
          try {
            const res = await fetch(`${API_BASE}/companies/jobs/${job.id}/applicants`, {
              headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
              const appData = await res.json();
              (appData.applications || []).forEach((a: any) => {
                allApps.push({
                  student: a.student?.user?.name || "—",
                  job: job.title,
                  match: Math.round(a.matchScore || 0),
                  status: a.status,
                });
              });
            }
          } catch { /* skip */ }
        }
        setApps(allApps);
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Applications</h1>
        <p className={`text-sm mt-1 ${muted}`}>Overview of all student applications across jobs.</p>
      </div>
      <div className={card}>
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
            {apps.length === 0 ? (
              <tr><td colSpan={4} className={`py-6 text-center ${muted}`}>No applications found.</td></tr>
            ) : apps.map((a: any, i: number) => (
              <tr key={i}>
                <td className={tableTd}>{a.student}</td>
                <td className={tableTd}>{a.job}</td>
                <td className={tableTd}>{a.match}%</td>
                <td className={tableTd}>{a.status}</td>
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
  const { card, heading, muted } = getStyles(dk);

  // For the prototype, we don't have a dedicated recruiters endpoint, so show a clean placeholder
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Recruiters & Companies</h1>
        <p className={`text-sm mt-1 ${muted}`}>Manage companies partnered with your institution.</p>
      </div>
      <div className={`${card} text-center py-12`}>
        <Building2 className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
        <p className={muted}>Recruiter data will be populated from the database when companies register.</p>
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


export function DataRequestsPage() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fieldName: "", fieldType: "text", isRequired: true });

  useEffect(() => {
    fetch(`${API_BASE}/university/data-requests`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
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
        <div className={`${card} space-y-4`}>
          <h3 className={`text-sm font-medium ${heading}`}>New Data Request</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs block mb-1 ${muted}`}>Field Name (e.g., Aadhar Card)</label>
              <input value={form.fieldName} onChange={e => setForm({...form, fieldName: e.target.value})} className={`w-full px-3 py-2 rounded-lg text-sm border ${dk ? "bg-[#1a1a24] border-white/10 text-gray-200" : "bg-white border-gray-200 text-gray-900"} outline-none focus:border-blue-500`} />
            </div>
            <div>
              <label className={`text-xs block mb-1 ${muted}`}>Field Type (e.g., file, text)</label>
              <input value={form.fieldType} onChange={e => setForm({...form, fieldType: e.target.value})} className={`w-full px-3 py-2 rounded-lg text-sm border ${dk ? "bg-[#1a1a24] border-white/10 text-gray-200" : "bg-white border-gray-200 text-gray-900"} outline-none focus:border-blue-500`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isRequired" checked={form.isRequired} onChange={e => setForm({...form, isRequired: e.target.checked})} className="rounded border-gray-300" />
            <label htmlFor="isRequired" className={`text-sm ${heading}`}>Required</label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg text-sm border ${dk ? "border-white/10 text-gray-300" : "border-gray-200 text-gray-700"}`}>Cancel</button>
            <button onClick={handleCreate} className={`px-4 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-500`}>Save Request</button>
          </div>
        </div>
      )}

      <div className={card}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className={`ml-2 text-sm ${muted}`}>Loading requests…</span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableTh}>Field Name</th>
                <th className={tableTh}>Type</th>
                <th className={tableTh}>Required</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={3} className={`py-6 text-center ${muted}`}>No data requests defined.</td></tr>
              ) : requests.map((r: any, i: number) => (
                <tr key={i}>
                  <td className={tableTd}>{r.fieldName}</td>
                  <td className={tableTd}>{r.fieldType || "—"}</td>
                  <td className={tableTd}>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.isRequired ? (dk ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600") : (dk ? "bg-gray-500/10 text-gray-400" : "bg-gray-100 text-gray-600")}`}>
                      {r.isRequired ? "Yes" : "No"}
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
