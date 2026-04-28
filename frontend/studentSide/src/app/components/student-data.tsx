import { useState, useEffect } from "react";
import { studentApi } from "../../lib/api";
import { Card, GradientButton, Badge } from "./shared";
import { motion } from "motion/react";
import { FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useApp } from "./app-context";
import { toast } from "sonner";
import { AcademicUnitSelector } from "./academic-unit-selector";

export function StudentData() {
  const { studentProfile, setStudentProfile, authUser } = useApp();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingRequestId, setSubmittingRequestId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Record<number, any>>({});
  const [academicUnits, setAcademicUnits] = useState<any[]>([]);
  const [academicTree, setAcademicTree] = useState<any[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  
  // Initial setup state
  const [setupData, setSetupData] = useState({
    universityId: 1, // Defaulting for prototype
    academicUnitId: 0,
    cgpa: 0,
    backlogCount: 0,
    passingYear: 2026,
  });

  const flattenUnits = (nodes: any[], path: string[] = []): any[] => {
    return nodes.flatMap((node) => {
      const nextPath = [...path, node.label];
      const children = Array.isArray(node.children) ? flattenUnits(node.children, nextPath) : [];
      return [
        {
          id: Number(node.id),
          label: node.label,
          level: node.level,
          path: nextPath.join(" > "),
          hasChildren: Array.isArray(node.children) && node.children.length > 0,
        },
        ...children,
      ];
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (studentProfile) {
          const reqs = await studentApi.getExtraDataRequests();
          setRequests(Array.isArray(reqs) ? reqs : []);
        }
      } catch (err) {
        console.error("Failed to fetch data requests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentProfile]);

  useEffect(() => {
    if (studentProfile) return;

    const fetchAcademicUnits = async () => {
      setUnitsLoading(true);
      try {
        const data = await studentApi.getAcademicUnitTree();
        const tree = data.tree || [];
        setAcademicTree(tree);
        const units = flattenUnits(tree);
        setAcademicUnits(units);
        const firstLeaf = units.find((unit) => !unit.hasChildren) || units[0];
        if (firstLeaf) {
          setSetupData((current) => ({ ...current, academicUnitId: firstLeaf.id }));
        }
      } catch (err) {
        console.error("Failed to fetch academic units", err);
        toast.error("Unable to load academic units.");
      } finally {
        setUnitsLoading(false);
      }
    };

    fetchAcademicUnits();
  }, [studentProfile]);

  const handleInitialSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData.academicUnitId) {
      toast.error("Please select your academic unit.");
      return;
    }
    setSubmitting(true);
    try {
      await studentApi.createProfile(setupData);
      await studentApi.generateSkills();
      if (authUser) {
        const profile = await studentApi.getProfile(authUser.id);
        setStudentProfile(profile);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitExtra = async (requestId: number, value: string) => {
    setSubmittingRequestId(requestId);
    try {
      await studentApi.submitExtraData({ requestId, value });
      setSubmissions(prev => ({ ...prev, [requestId]: { value, status: "PENDING" } }));
      if (authUser) {
        const profile = await studentApi.getProfile(authUser.id);
        setStudentProfile(profile);
      }
      toast.success("Data submitted for university review.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit requested data.");
    } finally {
      setSubmittingRequestId(null);
    }
  };

  const selectableAcademicUnits = academicUnits.filter((unit) => !unit.hasChildren);

  if (!studentProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Complete Your Student Profile</h1>
          <p className="text-gray-500 mt-2">You need to provide your basic academic information before you can link external platforms or apply for jobs.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleInitialSetup} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">CGPA (out of 10)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="10" 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  value={setupData.cgpa}
                  onChange={e => setSetupData({...setupData, cgpa: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Active Backlogs</label>
                <input 
                  type="number" 
                  min="0" 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  value={setupData.backlogCount}
                  onChange={e => setSetupData({...setupData, backlogCount: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Academic Unit</label>
              <AcademicUnitSelector
                tree={academicTree}
                value={setupData.academicUnitId}
                disabled={unitsLoading || selectableAcademicUnits.length === 0}
                onChange={(academicUnitId) => setSetupData({ ...setupData, academicUnitId })}
              />
              <p className="text-xs text-gray-500">
                Select each hierarchy level until the most specific unit, such as section.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Passing Year</label>
              <input 
                type="number" 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                value={setupData.passingYear}
                onChange={e => setSetupData({...setupData, passingYear: parseInt(e.target.value)})}
              />
            </div>

            <div className="pt-4">
              <GradientButton type="submit" className="w-full py-3" size="lg">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save & Continue"}
              </GradientButton>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              <p className="text-[11px] text-indigo-700">Your university will verify this data before final placement shortlisting.</p>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl tracking-tight text-gray-900">Extra Data Requests</h1>
        <p className="text-sm mt-1 text-gray-500">Provide additional information requested by your institution.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No extra data has been requested by your institution.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {requests.map(req => {
            const existing = studentProfile?.extraData?.find((d: any) => d.requestId === req.id) || submissions[req.id];
            
            return (
              <Card key={req.id} className="flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      {req.fieldName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Type: {req.fieldType}</p>
                  </div>
                  {req.isRequired && (
                    <Badge variant="warning">Required</Badge>
                  )}
                </div>

                <div className="mt-auto pt-4">
                  {existing ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Submitted Value</span>
                        <Badge variant={existing.status === "APPROVED" ? "success" : existing.status === "REJECTED" ? "warning" : "info"}>
                          {existing.status || "PENDING"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-900">{existing.value}</p>
                    </div>
                  ) : (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const val = new FormData(e.currentTarget).get("value") as string;
                      if (val) handleSubmitExtra(req.id, val);
                    }}>
                      <div className="flex gap-2">
                        <input name="value" placeholder="Enter requested information..." required className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500" />
                        <GradientButton size="sm" type="submit" disabled={submittingRequestId === req.id}>
                          {submittingRequestId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                        </GradientButton>
                      </div>
                    </form>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
