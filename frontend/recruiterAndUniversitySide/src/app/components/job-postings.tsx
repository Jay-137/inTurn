import { Plus, CheckCircle2, Clock, XCircle, Eye, MoreHorizontal, FileText } from "lucide-react";

export function JobPostings({ dk, card, heading, muted, onNavigate, onWithdraw, jobs }: {
  dk: boolean; card: string; heading: string; muted: string;
  onNavigate: (id: string, meta?: any) => void;
  onWithdraw?: (id: number) => void;
  jobs: any[];
}) {
  const statusStyle = (s: string) => {
    if (s === "APPROVED") return dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600";
    if (s === "REJECTED") return dk ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600";
    if (s === "EXPIRED") return dk ? "bg-gray-500/10 text-gray-400" : "bg-gray-100 text-gray-500";
    return dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600";
  };

  const statusLabel = (s: string) => {
    if (s === "APPROVED") return "Active";
    if (s === "REJECTED") return "Rejected";
    if (s === "EXPIRED") return "Closed";
    if (s === "PENDING" || s === "PENDING_REVIEW") return "Pending Review";
    return s;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-base ${heading}`}>All Job Postings</h2>
          <p className={`text-xs mt-1 ${muted}`}>{jobs.length} total postings</p>
        </div>
        <button onClick={() => onNavigate("post-job")} className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <FileText className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
          <p className={muted}>No job postings yet. Click "Post New Job" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className={`${card} p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${dk ? "bg-blue-500/10" : "bg-blue-50"}`}>
                    <FileText className={`w-4 h-4 ${dk ? "text-blue-400" : "text-blue-600"}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${heading}`}>{job.title}</p>
                    <p className={`text-xs mt-0.5 ${muted}`}>{job.posted}</p>
                    {job.status === "REJECTED" && job.rejectionReason && (
                      <p className={`text-[10px] mt-1 ${dk ? "text-red-400" : "text-red-600"}`}>Reason: {job.rejectionReason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full ${statusStyle(job.status)}`}>{statusLabel(job.status)}</span>
                  {job.status === "APPROVED" && (
                    <>
                      <button 
                        onClick={() => onNavigate("job-applicants", { jobId: job.id, jobTitle: job.title })}
                        className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${dk ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Applicants
                      </button>
                      <button 
                        onClick={() => onWithdraw && onWithdraw(job.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${dk ? "border-red-500/20 hover:bg-red-500/10 text-red-400" : "border-red-200 hover:bg-red-50 text-red-600"}`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Withdraw
                      </button>
                    </>
                  )}
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
      )}
    </div>
  );
}
