import { Plus, CheckCircle2, Clock, XCircle, Eye, MoreHorizontal, FileText } from "lucide-react";

const allPostings = [
  { title: "SDE-1 Frontend Engineer", location: "Remote", level: "SDE-1", posted: "Feb 20, 2026", status: "Active" as const, applicants: 47, shortlisted: 8, pending: 12, rejected: 27 },
  { title: "SDE Intern - Backend", location: "Hybrid", level: "Intern", posted: "Feb 18, 2026", status: "Active" as const, applicants: 32, shortlisted: 5, pending: 9, rejected: 18 },
  { title: "Fresher - Full Stack Developer", location: "On-site", level: "Fresher", posted: "Feb 15, 2026", status: "Active" as const, applicants: 28, shortlisted: 4, pending: 8, rejected: 16 },
  { title: "Data Analyst Intern", location: "Remote", level: "Intern", posted: "Jan 28, 2026", status: "Closed" as const, applicants: 56, shortlisted: 12, pending: 0, rejected: 44 },
  { title: "SDE-2 Backend Engineer", location: "On-site", level: "SDE-2", posted: "Jan 10, 2026", status: "Draft" as const, applicants: 0, shortlisted: 0, pending: 0, rejected: 0 },
];

export function JobPostings({ dk, card, heading, muted, onNavigate }: {
  dk: boolean; card: string; heading: string; muted: string; onNavigate: (id: string) => void;
}) {
  const statusStyle = (s: string) => {
    if (s === "Active") return dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600";
    if (s === "Closed") return dk ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600";
    return dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-base ${heading}`}>All Job Postings</h2>
          <p className={`text-xs mt-1 ${muted}`}>{allPostings.length} total postings</p>
        </div>
        <button onClick={() => onNavigate("post-job")} className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      <div className="space-y-4">
        {allPostings.map((job) => (
          <div key={job.title} className={`${card} p-5`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${dk ? "bg-blue-500/10" : "bg-blue-50"}`}>
                  <FileText className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <div>
                  <p className={`text-sm ${heading}`}>{job.title}</p>
                  <p className={`text-xs mt-0.5 ${muted}`}>{job.level} · {job.location} · Posted {job.posted}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2.5 py-1 rounded-full ${statusStyle(job.status)}`}>{job.status}</span>
                <button className={`p-1.5 rounded-lg ${dk ? "hover:bg-white/5 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 ml-13">
              <div className="flex items-center gap-1.5">
                <Eye className={`w-3.5 h-3.5 ${muted}`} />
                <span className={`text-xs ${muted}`}>{job.applicants} applicants</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-green-500">
                <CheckCircle2 className="w-3 h-3" /> {job.shortlisted} shortlisted
              </span>
              <span className={`flex items-center gap-1 text-xs ${dk ? "text-indigo-400" : "text-indigo-600"}`}>
                <Clock className="w-3 h-3" /> {job.pending} pending
              </span>
              <span className={`flex items-center gap-1 text-xs ${muted}`}>
                <XCircle className="w-3 h-3" /> {job.rejected} rejected
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
