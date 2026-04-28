import { useState, useEffect } from "react";
import {
  ChevronRight, Users, UserCheck, TrendingUp, Briefcase,
  Home, ArrowRight, FolderOpen, Info, Search, X,
} from "lucide-react";
import { useTheme } from "./theme-context";
import type { EligibleFilters } from "./eligible-students";

/* ─── Types ─── */
export type HierNode = {
  id: string;
  label: string;
  level: number; // 0=Field, 1=Stream, 2=Institute, 3=Department, 4=Section
  students: number;
  placed: number;
  jobs: number;
  children?: HierNode[];
  // filter values that stack as you drill down
  filters?: Omit<EligibleFilters, "contextLabel">;
};

const LEVEL_NAMES = ["Field", "Stream", "Institute", "Department", "Section"];

/* ─── Utility ─── */
function placementRate(node: HierNode) {
  return node.students > 0 ? Math.round((node.placed / node.students) * 100) : 0;
}

function childCount(node: HierNode) {
  return node.children?.length ?? 0;
}

function childLevelLabel(node: HierNode) {
  const nextLevel = node.level + 1;
  if (nextLevel >= LEVEL_NAMES.length) return null;
  return LEVEL_NAMES[nextLevel];
}

function buildFilters(path: HierNode[], node: HierNode): EligibleFilters {
  const allNodes = [...path, node];
  const merged: EligibleFilters = {
    ...(node.filters || {}),
    contextLabel: allNodes.map((n) => n.label).join(" › ")
  };
  return merged;
}

/* ─── Analytics Mini Card ─── */
function MiniStat({ icon: Icon, value, label, dk, colorClass }: {
  icon: React.ElementType; value: string; label: string; dk: boolean; colorClass: string;
}) {
  return (
    <div className={`flex items-center gap-2 min-w-0`}>
      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="min-w-0">
        <p className={`text-xs leading-none mb-0.5 ${dk ? "text-white" : "text-gray-900"}`}>{value}</p>
        <p className={`text-[10px] truncate ${dk ? "text-gray-500" : "text-gray-400"}`}>{label}</p>
      </div>
    </div>
  );
}

/* ─── Branch Card ─── */
function BranchCard({
  node, path, dk, onDrillDown, onShowStudents,
}: {
  node: HierNode;
  path: HierNode[];
  dk: boolean;
  onDrillDown: (n: HierNode) => void;
  onShowStudents: (filters: EligibleFilters) => void;
}) {
  const rate = placementRate(node);
  const nextLabel = childLevelLabel(node);
  const hasChildren = (node.children?.length ?? 0) > 0;

  const rateColor = rate >= 70
    ? dk ? "text-green-400" : "text-green-600"
    : rate >= 50
      ? dk ? "text-blue-400" : "text-blue-600"
      : dk ? "text-amber-400" : "text-amber-600";

  const rateBg = rate >= 70
    ? dk ? "bg-green-500/10" : "bg-green-50"
    : rate >= 50
      ? dk ? "bg-blue-500/10" : "bg-blue-50"
      : dk ? "bg-amber-500/10" : "bg-amber-50";

  return (
    <div
      onClick={() => hasChildren && onDrillDown(node)}
      className={`group relative rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-150 ${
        hasChildren ? "cursor-pointer" : "cursor-default"
      } ${
        dk
          ? `bg-[#111116] border-white/10 ${hasChildren ? "hover:border-blue-500/30 hover:bg-[#13131a]" : ""}`
          : `bg-white border-gray-200 ${hasChildren ? "hover:border-blue-300 hover:shadow-md hover:shadow-blue-50" : ""}`
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
              dk ? "border-white/10 text-gray-500" : "border-gray-200 text-gray-400"
            }`}>
              {LEVEL_NAMES[node.level]}
            </span>
            {hasChildren && nextLabel && (
              <span className={`text-[10px] ${dk ? "text-gray-600" : "text-gray-400"}`}>
                {childCount(node)} {nextLabel}{childCount(node) !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <h3 className={`text-sm leading-snug ${dk ? "text-white" : "text-gray-900"}`}>
            {node.label}
          </h3>
        </div>
        {/* Rate badge */}
        <div className={`shrink-0 flex flex-col items-center px-2.5 py-1.5 rounded-xl ${rateBg}`}>
          <span className={`text-sm leading-none ${rateColor}`}>{rate}%</span>
          <span className={`text-[10px] mt-0.5 ${dk ? "text-gray-500" : "text-gray-400"}`}>placed</span>
        </div>
      </div>

      {/* Placement bar */}
      <div className={`w-full h-1 rounded-full overflow-hidden ${dk ? "bg-white/5" : "bg-gray-100"}`}>
        <div
          className={`h-full rounded-full transition-all ${
            rate >= 70 ? "bg-green-500" : rate >= 50 ? "bg-blue-500" : "bg-amber-500"
          }`}
          style={{ width: `${rate}%` }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <MiniStat
          icon={Users} value={node.students.toLocaleString()} label="Total Students"
          dk={dk} colorClass={dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}
        />
        <MiniStat
          icon={UserCheck} value={node.placed.toLocaleString()} label="Placed"
          dk={dk} colorClass={dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"}
        />
        <MiniStat
          icon={TrendingUp} value={`${rate}%`} label="Placement Rate"
          dk={dk} colorClass={dk ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}
        />
        <MiniStat
          icon={Briefcase} value={String(node.jobs)} label="Active Jobs"
          dk={dk} colorClass={dk ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"}
        />
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t ${dk ? "border-white/8" : "border-gray-100"}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowStudents(buildFilters(path, node));
          }}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            dk ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
          }`}
        >
          Show Student List
          <ArrowRight className="w-3 h-3" />
        </button>

        {hasChildren ? (
          <div className={`flex items-center gap-1 text-[11px] transition-colors ${
            dk ? "text-gray-600 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"
          }`}>
            View {nextLabel}s
            <ChevronRight className="w-3 h-3" />
          </div>
        ) : (
          <div className={`flex items-center gap-1 text-[11px] ${dk ? "text-gray-700" : "text-gray-400"}`}>
            <Info className="w-3 h-3" />
            Deepest level
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function PlacementBranches({
  path,
  setPath,
  onShowStudents,
}: {
  path: HierNode[];
  setPath: (p: HierNode[]) => void;
  onShowStudents: (filters: EligibleFilters) => void;
}) {
  const { theme } = useTheme();
  const dk = theme === "dark";

  const muted = dk ? "text-gray-400" : "text-gray-500";
  const heading = dk ? "text-white" : "text-gray-900";

  const [rootData, setRootData] = useState<HierNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchSearch, setBranchSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/university/academic-units/tree", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.ok ? res.json() : { tree: [] })
      .then(data => setRootData(data.tree || []))
      .catch(() => setRootData([]))
      .finally(() => setLoading(false));
  }, []);

  // Current nodes to display
  const allCurrentNodes: HierNode[] = path.length === 0
    ? rootData
    : (path[path.length - 1].children ?? []);

  const currentNodes = allCurrentNodes.filter(n =>
    !branchSearch || n.label.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const currentLevel = path.length === 0 ? -1 : path[path.length - 1].level;
  const noChildren = path.length > 0 && allCurrentNodes.length === 0;

  // Drill down
  const drillDown = (node: HierNode) => {
    if ((node.children?.length ?? 0) > 0) {
      setPath([...path, node]);
    }
  };

  // Breadcrumb navigate
  const navigateTo = (index: number) => {
    setPath(path.slice(0, index));
  };

  // Summary totals for header
  const totalStudents = currentNodes.reduce((a, n) => a + n.students, 0);
  const totalPlaced = currentNodes.reduce((a, n) => a + n.placed, 0);
  const overallRate = totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) : 0;

  return (
    <div className="flex-1 px-6 py-8 space-y-6 overflow-y-auto">
      {/* Title */}
      <div>
        <h1 className={`text-xl tracking-tight ${heading}`}>Placement Branches</h1>
        <p className={`text-xs mt-0.5 ${muted}`}>
          Explore placement analytics across fields, streams, institutes, departments, and sections.
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className={`flex items-center gap-1 flex-wrap px-4 py-2.5 rounded-xl border text-xs ${
        dk ? "bg-[#111116] border-white/8" : "bg-white border-gray-200"
      }`}>
        <button
          onClick={() => setPath([])}
          className={`flex items-center gap-1 transition-colors ${
            path.length === 0
              ? dk ? "text-white" : "text-gray-900"
              : dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"
          }`}
        >
          <Home className="w-3 h-3" />
          Placement Branches
        </button>
        {path.map((node, idx) => (
          <span key={node.id} className="flex items-center gap-1">
            <ChevronRight className={`w-3 h-3 ${dk ? "text-gray-700" : "text-gray-300"}`} />
            <button
              onClick={() => navigateTo(idx + 1)}
              className={`transition-colors ${
                idx === path.length - 1
                  ? dk ? "text-white" : "text-gray-900"
                  : dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {node.label}
            </button>
          </span>
        ))}
      </nav>

      {/* Search */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs ${
        dk ? "bg-[#111116] border-white/8" : "bg-white border-gray-200"
      }`}>
        <Search className={`w-3.5 h-3.5 ${muted}`} />
        <input
          value={branchSearch}
          onChange={(e) => setBranchSearch(e.target.value)}
          placeholder="Filter branches by name..."
          className={`flex-1 bg-transparent outline-none text-xs ${dk ? "text-gray-300 placeholder:text-gray-600" : "text-gray-700 placeholder:text-gray-400"}`}
        />
        {branchSearch && (
          <button onClick={() => setBranchSearch("")} className={`${muted} hover:opacity-70`}>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Level header with summary */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 rounded-xl border ${
        dk ? "bg-[#111116] border-white/8" : "bg-white border-gray-200"
      }`}>
        <div>
          <p className={`text-xs ${muted} mb-0.5`}>
            {path.length === 0 ? "Top-level" : LEVEL_NAMES[currentLevel]} ·{" "}
            <span className={dk ? "text-gray-300" : "text-gray-700"}>{currentNodes.length} entr{currentNodes.length !== 1 ? "ies" : "y"}</span>
          </p>
          <h2 className={`text-sm ${heading}`}>
            {path.length === 0
              ? "All Fields"
              : path[path.length - 1].label}
          </h2>
        </div>
        {currentNodes.length > 0 && (
          <div className={`flex items-center gap-5 text-xs ${dk ? "text-gray-400" : "text-gray-500"}`}>
            <span>
              <span className={`${heading}`}>{totalStudents.toLocaleString()}</span> students
            </span>
            <span>
              <span className={dk ? "text-green-400" : "text-green-600"}>{totalPlaced.toLocaleString()}</span> placed
            </span>
            <span className={`px-2.5 py-1 rounded-lg ${
              overallRate >= 70
                ? dk ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"
                : dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
            }`}>
              {overallRate}% rate
            </span>
          </div>
        )}
      </div>

      {/* No further subdivisions message */}
      {noChildren && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs ${
          dk ? "bg-amber-500/8 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-100 text-amber-700"
        }`}>
          <Info className="w-3.5 h-3.5 shrink-0" />
          No further subdivisions available at this level. Use "Show Student List" to view students.
        </div>
      )}

      {/* Cards grid */}
      {currentNodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentNodes.map((node) => (
            <BranchCard
              key={node.id}
              node={node}
              path={path}
              dk={dk}
              onDrillDown={drillDown}
              onShowStudents={onShowStudents}
            />
          ))}
        </div>
      ) : !noChildren ? (
        <div className={`flex flex-col items-center justify-center py-20 text-center ${muted}`}>
          <FolderOpen className="w-8 h-8 mb-3 opacity-40" />
          <p className="text-sm">No entries at this level.</p>
        </div>
      ) : null}
    </div>
  );
}
