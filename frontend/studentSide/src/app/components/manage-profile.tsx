import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, UserRound } from "lucide-react";
import { studentApi } from "../../lib/api";
import { useApp } from "./app-context";
import { Card, GradientButton, Badge } from "./shared";
import { AcademicUnitSelector } from "./academic-unit-selector";

type AcademicOption = {
  id: number;
  label: string;
  path: string;
  hasChildren: boolean;
};

function flattenUnits(nodes: any[], path: string[] = []): AcademicOption[] {
  return nodes.flatMap((node) => {
    const nextPath = [...path, node.label];
    const children = Array.isArray(node.children) ? flattenUnits(node.children, nextPath) : [];
    return [
      {
        id: Number(node.id),
        label: node.label,
        path: nextPath.join(" > "),
        hasChildren: children.length > 0,
      },
      ...children,
    ];
  });
}

export function ManageProfile() {
  const { authUser, studentProfile, setStudentProfile } = useApp();
  const [academicUnits, setAcademicUnits] = useState<AcademicOption[]>([]);
  const [academicTree, setAcademicTree] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    cgpa: studentProfile?.cgpa || 0,
    backlogCount: studentProfile?.backlogCount || 0,
    passingYear: studentProfile?.passingYear || 2026,
    academicUnitId: studentProfile?.academicUnitId || 0,
  });

  useEffect(() => {
    if (studentProfile) {
      setForm({
        cgpa: studentProfile.cgpa || 0,
        backlogCount: studentProfile.backlogCount || 0,
        passingYear: studentProfile.passingYear || 2026,
        academicUnitId: studentProfile.academicUnitId || 0,
      });
    }
  }, [studentProfile]);

  useEffect(() => {
    const fetchAcademicUnits = async () => {
      setLoadingUnits(true);
      try {
        const data = await studentApi.getAcademicUnitTree();
        setAcademicTree(data.tree || []);
        setAcademicUnits(flattenUnits(data.tree || []));
      } catch (err) {
        console.error(err);
        toast.error("Unable to load academic units.");
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchAcademicUnits();
  }, []);

  const selectedPath = useMemo(() => (
    academicUnits.find((unit) => unit.id === form.academicUnitId)?.path || ""
  ), [academicUnits, form.academicUnitId]);

  const leafUnits = academicUnits.filter((unit) => !unit.hasChildren);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.academicUnitId) {
      toast.error("Please select your academic unit.");
      return;
    }

    setSaving(true);
    try {
      await studentApi.updateAcademicProfile({
        cgpa: form.cgpa,
        backlogCount: form.backlogCount,
        passingYear: form.passingYear,
        academicUnitId: form.academicUnitId,
        universityId: studentProfile?.universityId || 1,
      });
      await studentApi.generateSkills();

      if (authUser) {
        const profile = await studentApi.getProfile(authUser.id);
        setStudentProfile(profile);
      }
      toast.success("Profile updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!studentProfile) {
    return (
      <Card className="max-w-2xl">
        <div className="flex items-center gap-3">
          <UserRound className="w-5 h-5 text-indigo-500" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Manage Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Set up your student profile before editing academic details.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl tracking-tight text-gray-900">Manage Profile</h1>
        <p className="text-sm mt-1 text-gray-500">
          Update the academic data used for placement hierarchy and eligibility checks.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Academic Details</h2>
              <p className="text-sm text-gray-500 mt-1">{studentProfile.user?.name}</p>
            </div>
            <Badge variant={studentProfile.registrationStatus === "APPROVED" ? "success" : "warning"}>
              {studentProfile.registrationStatus}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">CGPA</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                required
                value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Active Backlogs</label>
              <input
                type="number"
                min="0"
                required
                value={form.backlogCount}
                onChange={(e) => setForm({ ...form, backlogCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Passing Year</label>
              <input
                type="number"
                required
                value={form.passingYear}
                onChange={(e) => setForm({ ...form, passingYear: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Academic Unit / Section</label>
              <AcademicUnitSelector
                tree={academicTree}
                value={form.academicUnitId}
                disabled={loadingUnits || leafUnits.length === 0}
                onChange={(academicUnitId) => setForm({ ...form, academicUnitId })}
              />
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-medium text-indigo-800">Current placement hierarchy</p>
            <p className="text-sm text-indigo-700 mt-1">{selectedPath || studentProfile.academicUnit?.name}</p>
            <p className="text-xs text-indigo-600 mt-2">
              Branch eligibility uses the placement branch derived from this hierarchy, not the section label.
            </p>
          </div>

          <div className="flex justify-end">
            <GradientButton type="submit" className="min-w-36" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span className="inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>}
            </GradientButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
