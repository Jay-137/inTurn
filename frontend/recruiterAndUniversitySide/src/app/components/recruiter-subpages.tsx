import { useTheme } from "./theme-context";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Star, BarChart3, TrendingUp, Users, CheckCircle2, Play, X, Video, ArrowLeft, Loader2, FileText, ExternalLink, Briefcase } from "lucide-react";
import { toast } from "sonner";

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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("match_desc");
  const [minMatch, setMinMatch] = useState("");
  const [selectedApps, setSelectedApps] = useState<number[]>([]);

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

  const filteredApplicants = applicants
    .filter(a => {
      if (filter !== "ALL" && a.status !== filter) return false;
      if (minMatch && Math.round(a.matchScore || 0) < Number(minMatch)) return false;
      if (search) {
        const term = search.toLowerCase();
        const name = a.student?.user?.name?.toLowerCase() || "";
        const branch = a.student?.academicUnit?.name?.toLowerCase() || "";
        if (!name.includes(term) && !branch.includes(term)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "match_desc") return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === "match_asc") return (a.matchScore || 0) - (b.matchScore || 0);
      if (sortBy === "name_asc") return (a.student?.user?.name || "").localeCompare(b.student?.user?.name || "");
      return 0;
    });

  const toggleSelectAll = () => {
    const forwardable = filteredApplicants.filter(a => a.status === "FORWARDED_TO_RECRUITER");
    if (selectedApps.length === forwardable.length && selectedApps.length > 0) {
      setSelectedApps([]);
    } else {
      setSelectedApps(forwardable.map(a => a.id));
    }
  };

  const handleMassShortlist = async () => {
    if (selectedApps.length === 0) return;
    try {
      const res = await fetch(`${API_BASE}/companies/jobs/applications/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ applicationIds: selectedApps, status: "SHORTLISTED_BY_RECRUITER" })
      });
      if (res.ok) {
        toast.success(`Successfully shortlisted ${selectedApps.length} applicants!`);
        setSelectedApps([]);
        fetchApplicants();
      } else {
        toast.error("Failed to shortlist applicants.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred.");
    }
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
        <div className="flex justify-between items-center mb-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "bg-white/5 border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
            <Search className="w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or branch..." className="bg-transparent outline-none w-64" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
              <option value="ALL">All Statuses</option>
              <option value="FORWARDED_TO_RECRUITER">Forwarded</option>
              <option value="SHORTLISTED_BY_RECRUITER">Shortlisted</option>
              <option value="REJECTED_BY_RECRUITER">Rejected</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
              <option value="match_desc">Match Score ↓</option>
              <option value="match_asc">Match Score ↑</option>
              <option value="name_asc">Name A-Z</option>
            </select>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-sm ${dk ? "border-white/10" : "border-gray-300"}`}>
              <span className={`text-xs whitespace-nowrap ${dk ? "text-gray-400" : "text-gray-500"}`}>Min:</span>
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
              <button onClick={handleMassShortlist} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                Shortlist Selected ({selectedApps.length})
              </button>
            )}
          </div>
        </div>

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
                <th className={`${tableTh} w-10`}>
                  <input 
                    type="checkbox" 
                    checked={selectedApps.length > 0 && selectedApps.length === filteredApplicants.filter(a => a.status === "FORWARDED_TO_RECRUITER").length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className={tableTh}>Candidate</th>
                <th className={tableTh}>Branch</th>
                <th className={tableTh}>Match Score</th>
                <th className={tableTh}>Status</th>
                <th className={tableTh}>Resume</th>
                <th className={`${tableTh} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((a) => (
                <tr key={a.id}>
                  <td className={tableTd}>
                    {a.status === "FORWARDED_TO_RECRUITER" && (
                      <input 
                        type="checkbox" 
                        checked={selectedApps.includes(a.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedApps([...selectedApps, a.id]);
                          else setSelectedApps(selectedApps.filter(id => id !== a.id));
                        }}
                        className="rounded border-gray-300"
                      />
                    )}
                  </td>
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

              {/* Skills & Soft Skills */}
              {(selected.student?.skills?.length > 0 || selected.student?.softSkills?.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {selected.student?.skills?.length > 0 && (
                    <div>
                      <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${heading}`}><Star className="w-4 h-4 text-blue-500" /> Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selected.student.skills.map((s: any) => (
                          <span key={s.id} className={`text-xs px-2.5 py-1 rounded-full ${dk ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                            {s.skill?.name} ({Math.round(s.score * 100)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.student?.softSkills?.length > 0 && (
                    <div>
                      <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${heading}`}><Users className="w-4 h-4 text-purple-500" /> Soft Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selected.student.softSkills.map((s: any) => (
                          <span key={s.id} className={`text-xs px-2.5 py-1 rounded-full ${dk ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Experience */}
              {selected.student?.experiences?.length > 0 && (
                <div>
                  <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${heading}`}><Briefcase className="w-4 h-4 text-amber-500" /> Experience</h4>
                  <div className="space-y-3">
                    {selected.student.experiences.map((exp: any) => (
                      <div key={exp.id} className={`p-4 rounded-xl border ${dk ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                        <div className="flex justify-between items-start mb-1">
                          <strong className={`text-sm ${heading}`}>{exp.title}</strong>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${dk ? "bg-white/10" : "bg-white border"}`}>{exp.type}</span>
                        </div>
                        <p className={`text-sm mb-2 ${dk ? "text-gray-300" : "text-gray-700"}`}>{exp.company}</p>
                        <p className={`text-xs mb-2 ${muted}`}>{exp.duration}</p>
                        {exp.description && <p className={`text-sm ${muted}`}>{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {selected.student?.certifications?.length > 0 && (
                <div>
                  <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${heading}`}><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Certifications</h4>
                  <div className="space-y-3">
                    {selected.student.certifications.map((cert: any) => (
                      <div key={cert.id} className={`p-3 rounded-xl border flex items-center justify-between ${dk ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                        <div>
                          <strong className={`text-sm block ${heading}`}>{cert.name}</strong>
                          <span className={`text-xs ${muted}`}>{cert.platform} • {cert.issueDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {cert.verified && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase font-bold">Verified</span>}
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("match_desc");
  const [minMatch, setMinMatch] = useState("");

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

  const filteredCandidates = candidates
    .filter(c => {
      if (minMatch && (c.score || 0) < Number(minMatch)) return false;
      if (search) {
        const term = search.toLowerCase();
        if (!(c.name?.toLowerCase().includes(term) || c.role?.toLowerCase().includes(term) || c.branch?.toLowerCase().includes(term))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "match_desc") return (b.score || 0) - (a.score || 0);
      if (sortBy === "match_asc") return (a.score || 0) - (b.score || 0);
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) return;
    const headers = ["Name", "Role Applied", "Branch", "Match Score"];
    const rows = filteredCandidates.map(c => [c.name, c.role, c.branch, `${c.score}%`]);
    const csv = [headers.join(","), ...rows.map(r => r.map((v: string) => `"${(v || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "shortlisted_candidates.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl tracking-tight ${heading}`}>Shortlisted Candidates</h1>
          <p className={`text-sm mt-1 ${muted}`}>{filteredCandidates.length} candidates shortlisted by your team.</p>
        </div>
        <button onClick={handleExportCSV} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className={card}>
        {/* Search + Sort + Filter toolbar */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "bg-white/5 border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
            <Search className="w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidate, role, branch..." className="bg-transparent outline-none w-64" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dk ? "bg-black/50 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
              <option value="match_desc">Match Score ↓</option>
              <option value="match_asc">Match Score ↑</option>
              <option value="name_asc">Name A-Z</option>
            </select>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-sm ${dk ? "border-white/10" : "border-gray-300"}`}>
              <span className={`text-xs whitespace-nowrap ${dk ? "text-gray-400" : "text-gray-500"}`}>Min:</span>
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

        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <Star className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
            <p className={muted}>{search || minMatch ? "No candidates match the current filters." : "No shortlisted candidates yet. Review applicants from your job postings to shortlist them."}</p>
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
              {filteredCandidates.map((c, i) => (
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
  const [stats, setStats] = useState({ totalApplicants: 0, shortlistRate: 0, offersExtended: 0, funnel: { totalApplicants: 0, shortlistedCount: 0, placedCount: 0 } });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/companies/dashboard", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        if (res.ok) {
          const data = await res.json();
          const funnel = data.funnel || { totalApplicants: 0, shortlistedCount: 0, placedCount: 0 };
          const totalApps = funnel.totalApplicants;
          const shortlisted = funnel.shortlistedCount;
          const rate = totalApps > 0 ? Math.round((shortlisted / totalApps) * 100) : 0;
          setStats({ totalApplicants: totalApps, shortlistRate: rate, offersExtended: funnel.placedCount, funnel });
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
      <div className={`${card} p-6`}>
        <h3 className={`text-sm font-medium mb-6 ${heading}`}>Hiring Funnel</h3>
        {stats.funnel.totalApplicants === 0 ? (
          <div className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-12 ${dk ? "border-white/10 text-gray-600" : "border-gray-200 text-gray-400"}`}>
            <BarChart3 className="w-10 h-10 opacity-30" />
            <p className="text-sm">No applicant data yet</p>
            <p className={`text-xs ${muted}`}>Funnel will appear once applicants are received</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            {/* Total Applicants */}
            <div className="relative">
              <div className="h-14 w-full rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-between px-4 shadow-sm">
                <span className="text-white font-medium text-sm">Total Applicants</span>
                <span className="text-white font-bold text-lg">{stats.funnel.totalApplicants} <span className="text-xs font-normal opacity-80">(100%)</span></span>
              </div>
            </div>
            {/* Shortlisted */}
            <div className="relative">
              <div
                className="h-14 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-between px-4 shadow-sm transition-all duration-700"
                style={{ width: `${Math.max((stats.funnel.shortlistedCount / stats.funnel.totalApplicants) * 100, 20)}%` }}
              >
                <span className="text-white font-medium text-sm whitespace-nowrap">Shortlisted</span>
                <span className="text-white font-bold text-lg">
                  {stats.funnel.shortlistedCount} 
                  <span className="text-xs font-normal opacity-80 ml-1">
                    ({stats.funnel.totalApplicants > 0 ? Math.round((stats.funnel.shortlistedCount / stats.funnel.totalApplicants) * 100) : 0}%)
                  </span>
                </span>
              </div>
            </div>
            {/* Placed / Offers */}
            <div className="relative">
              <div
                className="h-14 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-between px-4 shadow-sm transition-all duration-700"
                style={{ width: `${Math.max((stats.funnel.placedCount / stats.funnel.totalApplicants) * 100, 15)}%` }}
              >
                <span className="text-white font-medium text-sm whitespace-nowrap">Placed</span>
                <span className="text-white font-bold text-lg">
                  {stats.funnel.placedCount}
                  <span className="text-xs font-normal opacity-80 ml-1">
                    ({stats.funnel.totalApplicants > 0 ? Math.round((stats.funnel.placedCount / stats.funnel.totalApplicants) * 100) : 0}%)
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
