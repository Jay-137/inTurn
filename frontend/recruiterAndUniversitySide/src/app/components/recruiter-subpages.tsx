import { useTheme } from "./theme-context";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Star, BarChart3, TrendingUp, Users, CheckCircle2, Play, X, Video } from "lucide-react";

const getStyles = (dk: boolean) => ({
  card: `rounded-xl border ${dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-300"} p-6`,
  heading: dk ? "text-white" : "text-gray-900",
  muted: dk ? "text-gray-400" : "text-gray-500",
  tableTh: `text-left pb-3 font-normal text-xs ${dk ? "text-gray-400" : "text-gray-500"}`,
  tableTd: `py-3 text-sm ${dk ? "text-gray-300 border-white/5" : "text-gray-700 border-gray-100"} border-t`,
});

export function Shortlisted() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted, tableTh, tableTd } = getStyles(dk);

  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    const fetchShortlisted = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/companies/jobs/shortlisted", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCandidates(data.candidates);
        }
      } catch (error) {
        console.error("Failed to fetch shortlisted candidates", error);
      }
    };
    fetchShortlisted();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl tracking-tight ${heading}`}>Shortlisted Candidates</h1>
          <p className={`text-sm mt-1 ${muted}`}>Manage candidates moving forward in the process.</p>
        </div>
        <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className={card}>
        <div className="flex justify-between items-center mb-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "bg-white/5 border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
            <Search className="w-4 h-4" />
            <input placeholder="Search candidates..." className="bg-transparent outline-none w-64" />
          </div>
          <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${dk ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
            <Filter className="w-4 h-4" /> Role Filter
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className={tableTh}>Candidate</th>
              <th className={tableTh}>Role Applied</th>
              <th className={tableTh}>Branch</th>
              <th className={tableTh}>Match Score</th>
              <th className={tableTh}>Status</th>
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
                    <Star className="w-4 h-4 fill-current" />
                    {c.score}%
                  </div>
                </td>
                <td className={tableTd}>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "Offer Extended" ? (dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600") : (dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600")}`}>
                    {c.status}
                  </span>
                </td>
                <td className={tableTd}>
                  <button onClick={() => setSelectedCandidate(c)} className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${dk ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
                    <Play className="w-3.5 h-3.5" /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-2xl overflow-hidden ${dk ? "bg-[#111116] border border-white/10" : "bg-white border border-gray-200 shadow-xl"}`}>
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className={`font-medium ${heading}`}>{selectedCandidate.name}'s Application</h3>
              <button onClick={() => setSelectedCandidate(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-6 mb-6">
                <div>
                  <p className={`text-sm ${muted}`}>Role</p>
                  <p className={`font-medium ${heading}`}>{selectedCandidate.role}</p>
                </div>
                <div>
                  <p className={`text-sm ${muted}`}>Branch</p>
                  <p className={`font-medium ${heading}`}>{selectedCandidate.branch}</p>
                </div>
                <div>
                  <p className={`text-sm ${muted}`}>Match Score</p>
                  <p className="font-medium text-green-500">{selectedCandidate.score}%</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className={`text-sm font-medium mb-2 flex items-center gap-2 ${heading}`}>
                  <Video className="w-4 h-4 text-indigo-500" /> Video Resume (Visume)
                </h4>
                {selectedCandidate.videoResumeUrl ? (
                  <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative group flex items-center justify-center">
                    {/* For the prototype, we use a placeholder or video tag */}
                    {selectedCandidate.videoResumeUrl.endsWith(".mp4") || selectedCandidate.videoResumeUrl.startsWith("http") ? (
                      <video src={selectedCandidate.videoResumeUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Play className="w-12 h-12 text-white/50 mx-auto mb-2" />
                        <p className="text-white/70 text-sm">Play Visume ({selectedCandidate.videoResumeUrl})</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`w-full aspect-video rounded-xl flex flex-col items-center justify-center border-2 border-dashed ${dk ? "border-white/10 text-gray-500" : "border-gray-200 text-gray-400"}`}>
                    <Video className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No Visume uploaded.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button className="px-4 py-2 rounded-lg text-sm text-red-500 border border-red-500 hover:bg-red-500/10 transition-colors">
                  Reject
                </button>
                <button className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                  Shortlist for Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlacementAnalytics() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const { card, heading, muted } = getStyles(dk);
  const [stats, setStats] = useState({ totalApplicants: 0, shortlistRate: 0, offersExtended: 0 });

  useEffect(() => {
    // In this prototype, recruiter analytics just maps to the same dashboard stats or similar.
    // For now we will fetch from university dashboard endpoint if it's universal or company dashboard
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/companies/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const totalApps = parseInt(data.summaryCards.find((c: any) => c.label === "Total Applicants")?.value || "0");
          const shortlisted = parseInt(data.summaryCards.find((c: any) => c.label === "Shortlisted")?.value || "0");
          const rate = totalApps > 0 ? Math.round((shortlisted / totalApps) * 100) : 0;
          setStats({ totalApplicants: totalApps, shortlistRate: rate, offersExtended: 0 }); // Offers not tracked fully in company yet
        }
      } catch (error) {
        console.error(error);
      }
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
            <div className={`w-10 h-10 rounded flex items-center justify-center ${dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-2xl tracking-tight ${heading}`}>{stats.totalApplicants}</p>
              <p className={`text-xs ${muted}`}>Total Applicants</p>
            </div>
          </div>
        </div>
        
        <div className={card}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded flex items-center justify-center ${dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-2xl tracking-tight ${heading}`}>{stats.shortlistRate}%</p>
              <p className={`text-xs ${muted}`}>Shortlist Rate</p>
            </div>
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded flex items-center justify-center ${dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-2xl tracking-tight ${heading}`}>{stats.offersExtended}</p>
              <p className={`text-xs ${muted}`}>Offers Extended</p>
            </div>
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
