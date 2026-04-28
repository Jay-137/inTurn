import { useTheme } from "./theme-context";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Star, BarChart3, TrendingUp, Users, CheckCircle2, Play, X, Video, ArrowLeft, Loader2, FileText, ExternalLink } from "lucide-react";

const API_BASE = "http://localhost:3000/api";
function getToken() { return localStorage.getItem("token") || ""; }

const getStyles = (dk: boolean) => ({
  card: `rounded-xl border ${dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-300"} p-6`,
  heading: dk ? "text-white" : "text-gray-900",
  muted: dk ? "text-gray-400" : "text-gray-500",
  tableTh: `text-left pb-3 font-normal text-xs ${dk ? "text-gray-400" : "text-gray-500"}`,
  tableTd: `py-3 text-sm ${dk ? "text-gray-300 border-white/5" : "text-gray-700 border-gray-100"} border-t`,
});

/* ─── Job Applicants (university-forwarded) ─── */
export function JobApplicants({ jobId, onBack }: { jobId: number; onBack: () => void }) {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/companies/jobs/${jobId}/applicants`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplicants(data.applications || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchApplicants(); }, [jobId]);

  const handleStatus = async (appId: number, status: string) => {
    setActionLoading(appId);
    try {
      const res = await fetch(`${API_BASE}/companies/jobs/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchApplicants();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const statusBadge = (s: string) => {
    if (s === "SHORTLISTED_BY_RECRUITER") return dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600";
    if (s === "REJECTED_BY_RECRUITER") return dk ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600";
    return dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600";
  };
  const statusLabel = (s: string) => {
    if (s === "SHORTLISTED_BY_RECRUITER") return "Shortlisted";
    if (s === "REJECTED_BY_RECRUITER") return "Rejected";
    return "Forwarded";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className={`p-2 rounded-lg ${dk ? "hover:bg-white/5 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className={`text-2xl tracking-tight ${heading}`}>Applicants</h1>
          <p className={`text-sm mt-1 ${muted}`}>{applicants.length} forwarded by university</p>
        </div>
      </div>

      <div className={card}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className={`ml-2 text-sm ${muted}`}>Loading applicants…</span>
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-12">
            <Users className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
            <p className={muted}>No forwarded applicants yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableTh}>Candidate</th>
                <th className={tableTh}>Branch</th>
                <th className={tableTh}>Match Score</th>
                <th className={tableTh}>Status</th>
                <th className={tableTh}>Resume</th>
                <th className={`${tableTh} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id}>
                  <td className={tableTd}>
                    <button onClick={() => setSelected(a)} className="text-left hover:underline">
                      {a.student?.user?.name || "—"}
                    </button>
                  </td>
                  <td className={tableTd}>{a.student?.academicUnit?.name || "—"}</td>
                  <td className={tableTd}>
                    <div className="flex items-center gap-1 text-green-500">
                      <Star className="w-4 h-4 fill-current" />
                      {Math.round(a.matchScore || 0)}%
                    </div>
                  </td>
                  <td className={tableTd}>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(a.status)}`}>
                      {statusLabel(a.status)}
                    </span>
                  </td>
                  <td className={tableTd}>
                    <div className="flex items-center gap-2">
                      {a.student?.resumeUrl && (
                        <a href={a.student.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Resume
                        </a>
                      )}
                      {a.student?.videoResumeUrl && (
                        <a href={a.student.videoResumeUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
                          <Video className="w-3 h-3" /> Visume
                        </a>
                      )}
                      {!a.student?.resumeUrl && !a.student?.videoResumeUrl && <span className={`text-xs ${muted}`}>—</span>}
                    </div>
                  </td>
                  <td className={`${tableTd} text-right`}>
                    {a.status === "FORWARDED_TO_RECRUITER" && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={actionLoading === a.id}
                          onClick={() => handleStatus(a.id, "SHORTLISTED_BY_RECRUITER")}
                          className={`text-xs px-2.5 py-1 rounded-md ${dk ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                        >Shortlist</button>
                        <button
                          disabled={actionLoading === a.id}
                          onClick={() => handleStatus(a.id, "REJECTED_BY_RECRUITER")}
                          className={`text-xs px-2.5 py-1 rounded-md ${dk ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                        >Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-2xl overflow-hidden max-h-[80vh] overflow-y-auto ${dk ? "bg-[#111116] border border-white/10" : "bg-white border border-gray-200 shadow-xl"}`}>
            <div className={`flex justify-between items-center p-4 border-b ${dk ? "border-white/10" : "border-gray-200"}`}>
              <h3 className={`font-medium ${heading}`}>{selected.student?.user?.name}'s Profile</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-6 flex-wrap">
                <div><p className={`text-sm ${muted}`}>Branch</p><p className={`font-medium ${heading}`}>{selected.student?.academicUnit?.name || "—"}</p></div>
                <div><p className={`text-sm ${muted}`}>Match Score</p><p className="font-medium text-green-500">{Math.round(selected.matchScore || 0)}%</p></div>
                <div><p className={`text-sm ${muted}`}>Email</p><p className={`font-medium ${heading}`}>{selected.student?.user?.email || "—"}</p></div>
              </div>

              {/* Skills */}
              {selected.student?.skills?.length > 0 && (
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${heading}`}>Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.student.skills.map((s: any) => (
                      <span key={s.id} className={`text-xs px-2.5 py-1 rounded-full ${dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-700"}`}>
                        {s.skill?.name} ({Math.round(s.score * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume & Visume links */}
              <div className="flex gap-4">
                {selected.student?.resumeUrl && (
                  <a href={selected.student.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
                    <FileText className="w-4 h-4" /> View Resume <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selected.student?.videoResumeUrl && (
                  <a href={selected.student.videoResumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-indigo-500 hover:underline">
                    <Video className="w-4 h-4" /> View Visume <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Action buttons */}
              {selected.status === "FORWARDED_TO_RECRUITER" && (
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => { handleStatus(selected.id, "REJECTED_BY_RECRUITER"); setSelected(null); }} className="px-4 py-2 rounded-lg text-sm text-red-500 border border-red-500 hover:bg-red-500/10">Reject</button>
                  <button onClick={() => { handleStatus(selected.id, "SHORTLISTED_BY_RECRUITER"); setSelected(null); }} className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500">Shortlist</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Shortlisted Candidates ─── */
export function Shortlisted() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const fetchShortlisted = async () => {
      try {
        const res = await fetch(`${API_BASE}/companies/jobs/shortlisted`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCandidates(data.candidates || []);
        }
      } catch (error) { console.error("Failed to fetch shortlisted candidates", error); }
    };
    fetchShortlisted();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl tracking-tight ${heading}`}>Shortlisted Candidates</h1>
          <p className={`text-sm mt-1 ${muted}`}>{candidates.length} candidates shortlisted by your team.</p>
        </div>
        <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className={card}>
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <Star className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
            <p className={muted}>No shortlisted candidates yet. Review applicants from your job postings to shortlist them.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableTh}>Candidate</th>
                <th className={tableTh}>Role Applied</th>
                <th className={tableTh}>Branch</th>
                <th className={tableTh}>Match Score</th>
                <th className={tableTh}>Resume</th>
                <th className={tableTh}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr key={i}>
                  <td className={tableTd}>{c.name}</td>
                  <td className={tableTd}>{c.role}</td>
                  <td className={tableTd}>{c.branch}</td>
                  <td className={tableTd}>
                    <div className="flex items-center gap-1 text-green-500">
                      <Star className="w-4 h-4 fill-current" /> {c.score}%
                    </div>
                  </td>
                  <td className={tableTd}>
                    <div className="flex items-center gap-2">
                      {c.resumeUrl && <a href={c.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1"><FileText className="w-3 h-3" /> Resume</a>}
                      {c.videoResumeUrl && <a href={c.videoResumeUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1"><Video className="w-3 h-3" /> Visume</a>}
                      {!c.resumeUrl && !c.videoResumeUrl && <span className={`text-xs ${muted}`}>—</span>}
                    </div>
                  </td>
                  <td className={tableTd}>
                    <button onClick={() => setSelected(c)} className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${dk ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
                      <Play className="w-3.5 h-3.5" /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-2xl overflow-hidden ${dk ? "bg-[#111116] border border-white/10" : "bg-white border border-gray-200 shadow-xl"}`}>
            <div className={`flex justify-between items-center p-4 border-b ${dk ? "border-white/10" : "border-gray-200"}`}>
              <h3 className={`font-medium ${heading}`}>{selected.name}'s Application</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex gap-6 mb-6">
                <div><p className={`text-sm ${muted}`}>Role</p><p className={`font-medium ${heading}`}>{selected.role}</p></div>
                <div><p className={`text-sm ${muted}`}>Branch</p><p className={`font-medium ${heading}`}>{selected.branch}</p></div>
                <div><p className={`text-sm ${muted}`}>Match Score</p><p className="font-medium text-green-500">{selected.score}%</p></div>
              </div>
              {selected.skills?.length > 0 && (
                <div className="mb-4">
                  <h4 className={`text-sm font-medium mb-2 ${heading}`}>Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.skills.map((s: any, i: number) => (
                      <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-700"}`}>
                        {s.name} ({Math.round(s.score * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-4 mb-4">
                {selected.resumeUrl && <a href={selected.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-500 hover:underline"><FileText className="w-4 h-4" /> Resume <ExternalLink className="w-3 h-3" /></a>}
                {selected.videoResumeUrl && <a href={selected.videoResumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-indigo-500 hover:underline"><Video className="w-4 h-4" /> Visume <ExternalLink className="w-3 h-3" /></a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Placement Analytics ─── */
export function PlacementAnalytics() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted } = getStyles(dk);
  const [stats, setStats] = useState({ totalApplicants: 0, shortlistRate: 0, offersExtended: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/companies/dashboard`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (res.ok) {
          const data = await res.json();
          const totalApps = parseInt(data.summaryCards.find((c: any) => c.label === "Total Applicants")?.value || "0");
          const shortlisted = parseInt(data.summaryCards.find((c: any) => c.label === "Shortlisted")?.value || "0");
          const rate = totalApps > 0 ? Math.round((shortlisted / totalApps) * 100) : 0;
          setStats({ totalApplicants: totalApps, shortlistRate: rate, offersExtended: 0 });
        }
      } catch (error) { console.error(error); }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl tracking-tight ${heading}`}>Placement Analytics</h1>
        <p className={`text-sm mt-1 ${muted}`}>Insights into your hiring pipeline and engagement.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className={card}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded flex items-center justify-center ${dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}><Users className="w-5 h-5" /></div>
            <div><p className={`text-2xl tracking-tight ${heading}`}>{stats.totalApplicants}</p><p className={`text-xs ${muted}`}>Total Applicants</p></div>
          </div>
        </div>
        <div className={card}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded flex items-center justify-center ${dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"}`}><CheckCircle2 className="w-5 h-5" /></div>
            <div><p className={`text-2xl tracking-tight ${heading}`}>{stats.shortlistRate}%</p><p className={`text-xs ${muted}`}>Shortlist Rate</p></div>
          </div>
        </div>
        <div className={card}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded flex items-center justify-center ${dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"}`}><TrendingUp className="w-5 h-5" /></div>
            <div><p className={`text-2xl tracking-tight ${heading}`}>{stats.offersExtended}</p><p className={`text-xs ${muted}`}>Offers Extended</p></div>
          </div>
        </div>
      </div>
      <div className={`h-80 rounded-xl border border-dashed flex flex-col items-center justify-center gap-3 ${dk ? "border-white/20 text-gray-500" : "border-gray-300 text-gray-400"}`}>
        <BarChart3 className="w-8 h-8 opacity-50" />
        <p>Hiring funnel and historical data charts will appear here.</p>
      </div>
    </div>
  );
}
