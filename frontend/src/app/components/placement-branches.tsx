import { useState } from "react";
import {
  ChevronRight, Users, UserCheck, TrendingUp, Briefcase,
  Home, ArrowRight, FolderOpen, Info,
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

/* ─── Hierarchy Data ─── */
const ROOT: HierNode[] = [
  {
    id: "eng",
    label: "Engineering",
    level: 0,
    students: 1850,
    placed: 1100,
    jobs: 28,
    filters: { course: "B.Tech" },
    children: [
      {
        id: "cse",
        label: "Computer Science Engineering",
        level: 1,
        students: 820,
        placed: 560,
        jobs: 18,
        filters: { course: "B.Tech", streams: ["CSE"] },
        children: [
          {
            id: "uie",
            label: "University Institute of Engineering",
            level: 2,
            students: 480,
            placed: 320,
            jobs: 12,
            filters: { course: "B.Tech", streams: ["CSE"] },
            children: [
              {
                id: "uie-ai",
                label: "Artificial Intelligence",
                level: 3,
                students: 180,
                placed: 130,
                jobs: 6,
                filters: { course: "B.Tech", streams: ["CSE"] },
                children: [
                  { id: "uie-ai-a", label: "Section A", level: 4, students: 90, placed: 68, jobs: 4, filters: { course: "B.Tech", streams: ["CSE"], sections: ["A"] } },
                  { id: "uie-ai-b", label: "Section B", level: 4, students: 90, placed: 62, jobs: 3, filters: { course: "B.Tech", streams: ["CSE"], sections: ["B"] } },
                ],
              },
              {
                id: "uie-ds",
                label: "Data Science",
                level: 3,
                students: 160,
                placed: 110,
                jobs: 5,
                filters: { course: "B.Tech", streams: ["CSE"] },
                children: [
                  { id: "uie-ds-a", label: "Section A", level: 4, students: 80, placed: 58, jobs: 3, filters: { course: "B.Tech", streams: ["CSE"], sections: ["A"] } },
                  { id: "uie-ds-b", label: "Section B", level: 4, students: 80, placed: 52, jobs: 2, filters: { course: "B.Tech", streams: ["CSE"], sections: ["B"] } },
                ],
              },
              {
                id: "uie-se",
                label: "Software Engineering",
                level: 3,
                students: 140,
                placed: 80,
                jobs: 4,
                filters: { course: "B.Tech", streams: ["CSE"] },
                children: [
                  { id: "uie-se-a", label: "Section A", level: 4, students: 70, placed: 42, jobs: 3, filters: { course: "B.Tech", streams: ["CSE"], sections: ["A"] } },
                  { id: "uie-se-b", label: "Section B", level: 4, students: 70, placed: 38, jobs: 2, filters: { course: "B.Tech", streams: ["CSE"], sections: ["B"] } },
                ],
              },
            ],
          },
          {
            id: "soc",
            label: "School of Computing",
            level: 2,
            students: 340,
            placed: 240,
            jobs: 9,
            filters: { course: "B.Tech", streams: ["CSE"] },
            children: [
              {
                id: "soc-ai",
                label: "Artificial Intelligence",
                level: 3,
                students: 170,
                placed: 128,
                jobs: 5,
                filters: { course: "B.Tech", streams: ["CSE"] },
                children: [
                  { id: "soc-ai-a", label: "Section A", level: 4, students: 85, placed: 66, jobs: 3, filters: { course: "B.Tech", streams: ["CSE"], sections: ["A"] } },
                  { id: "soc-ai-b", label: "Section B", level: 4, students: 85, placed: 62, jobs: 2, filters: { course: "B.Tech", streams: ["CSE"], sections: ["B"] } },
                ],
              },
              {
                id: "soc-ds",
                label: "Data Science",
                level: 3,
                students: 170,
                placed: 112,
                jobs: 4,
                filters: { course: "B.Tech", streams: ["CSE"] },
                children: [
                  { id: "soc-ds-a", label: "Section A", level: 4, students: 85, placed: 58, jobs: 3, filters: { course: "B.Tech", streams: ["CSE"], sections: ["A"] } },
                  { id: "soc-ds-b", label: "Section B", level: 4, students: 85, placed: 54, jobs: 2, filters: { course: "B.Tech", streams: ["CSE"], sections: ["B"] } },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "mech",
        label: "Mechanical Engineering",
        level: 1,
        students: 640,
        placed: 340,
        jobs: 7,
        filters: { course: "B.Tech", streams: ["ME"] },
        children: [
          {
            id: "mech-uie",
            label: "University Institute of Engineering",
            level: 2,
            students: 640,
            placed: 340,
            jobs: 7,
            filters: { course: "B.Tech", streams: ["ME"] },
            children: [
              {
                id: "mech-auto",
                label: "Automotive Engineering",
                level: 3,
                students: 320,
                placed: 180,
                jobs: 4,
                filters: { course: "B.Tech", streams: ["ME"] },
                children: [
                  { id: "mech-auto-a", label: "Section A", level: 4, students: 160, placed: 92, jobs: 3, filters: { course: "B.Tech", streams: ["ME"], sections: ["A"] } },
                  { id: "mech-auto-b", label: "Section B", level: 4, students: 160, placed: 88, jobs: 2, filters: { course: "B.Tech", streams: ["ME"], sections: ["B"] } },
                ],
              },
              {
                id: "mech-thermal",
                label: "Thermal Engineering",
                level: 3,
                students: 320,
                placed: 160,
                jobs: 3,
                filters: { course: "B.Tech", streams: ["ME"] },
                children: [
                  { id: "mech-thermal-a", label: "Section A", level: 4, students: 160, placed: 82, jobs: 2, filters: { course: "B.Tech", streams: ["ME"], sections: ["A"] } },
                  { id: "mech-thermal-b", label: "Section B", level: 4, students: 160, placed: 78, jobs: 2, filters: { course: "B.Tech", streams: ["ME"], sections: ["B"] } },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "eee",
        label: "Electrical Engineering",
        level: 1,
        students: 390,
        placed: 200,
        jobs: 8,
        filters: { course: "B.Tech", streams: ["EEE"] },
        children: [
          {
            id: "eee-ses",
            label: "School of Electrical Sciences",
            level: 2,
            students: 390,
            placed: 200,
            jobs: 8,
            filters: { course: "B.Tech", streams: ["EEE"] },
            children: [
              {
                id: "eee-power",
                label: "Power Systems",
                level: 3,
                students: 195,
                placed: 105,
                jobs: 5,
                filters: { course: "B.Tech", streams: ["EEE"] },
                children: [
                  { id: "eee-power-a", label: "Section A", level: 4, students: 98, placed: 54, jobs: 3, filters: { course: "B.Tech", streams: ["EEE"], sections: ["A"] } },
                  { id: "eee-power-b", label: "Section B", level: 4, students: 97, placed: 51, jobs: 2, filters: { course: "B.Tech", streams: ["EEE"], sections: ["B"] } },
                ],
              },
              {
                id: "eee-embed",
                label: "Embedded Systems",
                level: 3,
                students: 195,
                placed: 95,
                jobs: 4,
                filters: { course: "B.Tech", streams: ["EEE"] },
                children: [
                  { id: "eee-embed-a", label: "Section A", level: 4, students: 98, placed: 50, jobs: 2, filters: { course: "B.Tech", streams: ["EEE"], sections: ["A"] } },
                  { id: "eee-embed-b", label: "Section B", level: 4, students: 97, placed: 45, jobs: 2, filters: { course: "B.Tech", streams: ["EEE"], sections: ["B"] } },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "law",
    label: "Law",
    level: 0,
    students: 320,
    placed: 180,
    jobs: 8,
    filters: { course: "LLB" },
    children: [
      {
        id: "law-corp",
        label: "Corporate Law",
        level: 1,
        students: 160,
        placed: 100,
        jobs: 5,
        filters: { course: "LLB" },
        children: [
          {
            id: "law-sls",
            label: "School of Legal Studies",
            level: 2,
            students: 160,
            placed: 100,
            jobs: 5,
            filters: { course: "LLB" },
            children: [
              {
                id: "law-ccl",
                label: "Corporate & Commercial Law",
                level: 3,
                students: 80,
                placed: 52,
                jobs: 3,
                filters: { course: "LLB" },
                children: [
                  { id: "law-ccl-a", label: "Section A", level: 4, students: 40, placed: 28, jobs: 2, filters: { course: "LLB", sections: ["A"] } },
                  { id: "law-ccl-b", label: "Section B", level: 4, students: 40, placed: 24, jobs: 2, filters: { course: "LLB", sections: ["B"] } },
                ],
              },
              {
                id: "law-ip",
                label: "Intellectual Property Law",
                level: 3,
                students: 80,
                placed: 48,
                jobs: 2,
                filters: { course: "LLB" },
                children: [
                  { id: "law-ip-a", label: "Section A", level: 4, students: 40, placed: 26, jobs: 1, filters: { course: "LLB", sections: ["A"] } },
                  { id: "law-ip-b", label: "Section B", level: 4, students: 40, placed: 22, jobs: 1, filters: { course: "LLB", sections: ["B"] } },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "law-crim",
        label: "Criminal Law",
        level: 1,
        students: 160,
        placed: 80,
        jobs: 3,
        filters: { course: "LLB" },
        children: [
          {
            id: "law-crim-sls",
            label: "School of Legal Studies",
            level: 2,
            students: 160,
            placed: 80,
            jobs: 3,
            filters: { course: "LLB" },
            children: [
              {
                id: "law-cj",
                label: "Criminal Justice",
                level: 3,
                students: 80,
                placed: 42,
                jobs: 2,
                filters: { course: "LLB" },
                children: [
                  { id: "law-cj-a", label: "Section A", level: 4, students: 40, placed: 22, jobs: 1, filters: { course: "LLB", sections: ["A"] } },
                  { id: "law-cj-b", label: "Section B", level: 4, students: 40, placed: 20, jobs: 1, filters: { course: "LLB", sections: ["B"] } },
                ],
              },
              {
                id: "law-cyber",
                label: "Cyber Law",
                level: 3,
                students: 80,
                placed: 38,
                jobs: 2,
                filters: { course: "LLB" },
                children: [
                  { id: "law-cyber-a", label: "Section A", level: 4, students: 40, placed: 20, jobs: 1, filters: { course: "LLB", sections: ["A"] } },
                  { id: "law-cyber-b", label: "Section B", level: 4, students: 40, placed: 18, jobs: 1, filters: { course: "LLB", sections: ["B"] } },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ba",
    label: "Business Administration",
    level: 0,
    students: 677,
    placed: 343,
    jobs: 14,
    filters: { course: "MBA" },
    children: [
      {
        id: "ba-fin",
        label: "Finance",
        level: 1,
        students: 280,
        placed: 160,
        jobs: 8,
        filters: { course: "MBA", streams: ["Finance"] },
        children: [
          {
            id: "ba-fin-smbs",
            label: "School of Management & Business Studies",
            level: 2,
            students: 280,
            placed: 160,
            jobs: 8,
            filters: { course: "MBA", streams: ["Finance"] },
            children: [
              {
                id: "ba-fin-corp",
                label: "Corporate Finance",
                level: 3,
                students: 140,
                placed: 85,
                jobs: 5,
                filters: { course: "MBA", streams: ["Finance"] },
                children: [
                  { id: "ba-fin-corp-a", label: "Section A", level: 4, students: 70, placed: 44, jobs: 3, filters: { course: "MBA", streams: ["Finance"], sections: ["A"] } },
                  { id: "ba-fin-corp-b", label: "Section B", level: 4, students: 70, placed: 41, jobs: 2, filters: { course: "MBA", streams: ["Finance"], sections: ["B"] } },
                ],
              },
              {
                id: "ba-fin-ib",
                label: "Investment Banking",
                level: 3,
                students: 140,
                placed: 75,
                jobs: 4,
                filters: { course: "MBA", streams: ["Finance"] },
                children: [
                  { id: "ba-fin-ib-a", label: "Section A", level: 4, students: 70, placed: 40, jobs: 2, filters: { course: "MBA", streams: ["Finance"], sections: ["A"] } },
                  { id: "ba-fin-ib-b", label: "Section B", level: 4, students: 70, placed: 35, jobs: 2, filters: { course: "MBA", streams: ["Finance"], sections: ["B"] } },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "ba-mkt",
        label: "Marketing",
        level: 1,
        students: 240,
        placed: 128,
        jobs: 5,
        filters: { course: "MBA", streams: ["Marketing"] },
        children: [
          {
            id: "ba-mkt-smbs",
            label: "School of Management & Business Studies",
            level: 2,
            students: 240,
            placed: 128,
            jobs: 5,
            filters: { course: "MBA", streams: ["Marketing"] },
            children: [
              {
                id: "ba-mkt-dig",
                label: "Digital Marketing",
                level: 3,
                students: 120,
                placed: 68,
                jobs: 3,
                filters: { course: "MBA", streams: ["Marketing"] },
                children: [
                  { id: "ba-mkt-dig-a", label: "Section A", level: 4, students: 60, placed: 36, jobs: 2, filters: { course: "MBA", streams: ["Marketing"], sections: ["A"] } },
                  { id: "ba-mkt-dig-b", label: "Section B", level: 4, students: 60, placed: 32, jobs: 1, filters: { course: "MBA", streams: ["Marketing"], sections: ["B"] } },
                ],
              },
              {
                id: "ba-mkt-brand",
                label: "Brand Management",
                level: 3,
                students: 120,
                placed: 60,
                jobs: 2,
                filters: { course: "MBA", streams: ["Marketing"] },
                children: [
                  { id: "ba-mkt-brand-a", label: "Section A", level: 4, students: 60, placed: 32, jobs: 1, filters: { course: "MBA", streams: ["Marketing"], sections: ["A"] } },
                  { id: "ba-mkt-brand-b", label: "Section B", level: 4, students: 60, placed: 28, jobs: 1, filters: { course: "MBA", streams: ["Marketing"], sections: ["B"] } },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "ba-hr",
        label: "Human Resources",
        level: 1,
        students: 157,
        placed: 55,
        jobs: 2,
        filters: { course: "MBA", streams: ["HR"] },
        children: [
          {
            id: "ba-hr-smbs",
            label: "School of Management & Business Studies",
            level: 2,
            students: 157,
            placed: 55,
            jobs: 2,
            filters: { course: "MBA", streams: ["HR"] },
            children: [
              {
                id: "ba-hr-ta",
                label: "Talent Acquisition",
                level: 3,
                students: 80,
                placed: 30,
                jobs: 1,
                filters: { course: "MBA", streams: ["HR"] },
                children: [
                  { id: "ba-hr-ta-a", label: "Section A", level: 4, students: 40, placed: 16, jobs: 1, filters: { course: "MBA", streams: ["HR"], sections: ["A"] } },
                  { id: "ba-hr-ta-b", label: "Section B", level: 4, students: 40, placed: 14, jobs: 1, filters: { course: "MBA", streams: ["HR"], sections: ["B"] } },
                ],
              },
              {
                id: "ba-hr-ob",
                label: "Organizational Behavior",
                level: 3,
                students: 77,
                placed: 25,
                jobs: 1,
                filters: { course: "MBA", streams: ["HR"] },
                children: [
                  { id: "ba-hr-ob-a", label: "Section A", level: 4, students: 39, placed: 13, jobs: 1, filters: { course: "MBA", streams: ["HR"], sections: ["A"] } },
                  { id: "ba-hr-ob-b", label: "Section B", level: 4, students: 38, placed: 12, jobs: 1, filters: { course: "MBA", streams: ["HR"], sections: ["B"] } },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

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
  // Merge filters from all nodes in the path + current node
  const allNodes = [...path, node];
  const merged: EligibleFilters = {};
  for (const n of allNodes) {
    if (n.filters?.course) merged.course = n.filters.course;
    if (n.filters?.streams?.length) merged.streams = n.filters.streams;
    if (n.filters?.sections?.length) merged.sections = n.filters.sections;
    if (n.filters?.departments?.length) merged.departments = n.filters.departments;
  }
  merged.contextLabel = allNodes.map((n) => n.label).join(" › ");
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

  // Current nodes to display
  const currentNodes: HierNode[] = path.length === 0
    ? ROOT
    : (path[path.length - 1].children ?? []);

  const currentLevel = path.length === 0 ? -1 : path[path.length - 1].level;
  const noChildren = path.length > 0 && currentNodes.length === 0;

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
