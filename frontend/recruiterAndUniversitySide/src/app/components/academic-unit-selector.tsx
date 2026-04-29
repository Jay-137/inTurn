import { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Building2, Layers } from "lucide-react";

// const API_BASE = "http://localhost:3000/api";
const API_BASE = "https://inturn-5efo.onrender.com/api";
function getToken() { return localStorage.getItem("token") || ""; }

type AcademicNode = {
  id: string;
  label: string;
  type: string;
  parentId: number | null;
  children?: AcademicNode[];
};

interface AcademicUnitSelectorProps {
  /** Called when unit(s) are selected. In single mode returns one item, in multi mode returns array. */
  onSelect: (selected: { id: string; name: string; type: string }[]) => void;
  /** Currently selected values (unit names) */
  selected?: string[];
  /** Unit types to exclude from the type dropdown (e.g., ["Section"]) */
  excludeTypes?: string[];
  /** Dark theme flag */
  dk: boolean;
  /** Allow selecting multiple units */
  multi?: boolean;
  /** Label for the selector */
  label?: string;
}

/**
 * Recursively collect all descendant unit names for a given node (including the node itself).
 * This enables hierarchical cascade: selecting a parent includes all children.
 */
function collectDescendantNames(node: AcademicNode): string[] {
  const names = [node.label];
  if (node.children) {
    for (const child of node.children) {
      names.push(...collectDescendantNames(child));
    }
  }
  return names;
}

/**
 * Find a node by label in the full tree (recursive).
 */
function findNodeByLabel(nodes: AcademicNode[], label: string): AcademicNode | null {
  for (const node of nodes) {
    if (node.label === label) return node;
    if (node.children) {
      const found = findNodeByLabel(node.children, label);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 2-step hierarchical academic unit selector.
 * Step 1: Pick a unit type (School, Department, Section, etc.)
 * Step 2: Pick specific unit(s) of that type from the DB.
 *
 * Filtering cascades: selecting a parent includes all descendants.
 */
export function AcademicUnitSelector({
  onSelect,
  selected = [],
  excludeTypes = [],
  dk,
  multi = false,
  label = "Academic Unit",
}: AcademicUnitSelectorProps) {
  const [tree, setTree] = useState<AcademicNode[]>([]);
  const [flatUnits, setFlatUnits] = useState<AcademicNode[]>([]);
  const [unitTypes, setUnitTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"type" | "unit" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch academic unit tree on mount
  useEffect(() => {
    fetch(`${API_BASE}/university/academic-units/tree`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : { tree: [] })
      .then(data => {
        const treeData: AcademicNode[] = data.tree || [];
        setTree(treeData);
        // Flatten tree
        const flat: AcademicNode[] = [];
        const traverse = (nodes: AcademicNode[]) => {
          nodes.forEach(n => {
            flat.push(n);
            if (n.children) traverse(n.children);
          });
        };
        traverse(treeData);
        setFlatUnits(flat);
        // Extract unique types
        const types = Array.from(new Set(flat.map(n => n.type)))
          .filter(t => !excludeTypes.includes(t))
          .sort();
        setUnitTypes(types);
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unitsOfType = flatUnits.filter(u => u.type === selectedType);

  const toggleUnit = (unit: AcademicNode) => {
    if (multi) {
      const exists = selected.includes(unit.label);
      const next = exists
        ? selected.filter(s => s !== unit.label)
        : [...selected, unit.label];
      onSelect(next.map(name => {
        const found = flatUnits.find(u => u.label === name);
        return { id: found?.id || "", name, type: found?.type || "" };
      }));
    } else {
      // Single-select: toggle off if same, otherwise select
      if (selected.includes(unit.label)) {
        onSelect([]);
      } else {
        onSelect([{ id: unit.id, name: unit.label, type: unit.type }]);
      }
      setOpenDropdown(null);
    }
  };

  const removeUnit = (name: string) => {
    const next = selected.filter(s => s !== name);
    onSelect(next.map(n => {
      const found = flatUnits.find(u => u.label === n);
      return { id: found?.id || "", name: n, type: found?.type || "" };
    }));
  };

  const btnBase = `text-sm px-3 py-2 rounded-lg border outline-none transition-all cursor-pointer flex items-center justify-between gap-2 ${
    dk ? "bg-white/[0.04] border-white/10 text-white hover:border-white/20"
      : "bg-white border-gray-200 text-gray-900 hover:border-gray-300"
  }`;

  const dropBase = `absolute z-30 mt-1 rounded-xl border shadow-xl max-h-52 overflow-y-auto animate-dropdown ${
    dk ? "bg-[#18181f] border-white/10" : "bg-white border-gray-200"
  }`;

  return (
    <div ref={ref} className="space-y-1.5">
      {label && (
        <p className={`text-xs font-medium mb-1 ${dk ? "text-gray-400" : "text-gray-500"}`}>
          <Layers className="w-3 h-3 inline mr-1 -mt-px" />
          {label}
        </p>
      )}

      <div className="flex items-center gap-2 min-w-0">
        {/* Step 1: Unit Type */}
        <div className="relative min-w-[130px]">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
            className={btnBase + " w-full"}
          >
            <span className={`truncate ${selectedType ? "" : (dk ? "text-gray-500" : "text-gray-400")}`}>
              {selectedType || "Unit type…"}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${openDropdown === "type" ? "rotate-180" : ""}`} />
          </button>
          {openDropdown === "type" && (
            <div className={`${dropBase} w-full`}>
              {unitTypes.length > 0 ? unitTypes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setSelectedType(t); setOpenDropdown("unit"); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    selectedType === t
                      ? dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                      : dk ? "text-gray-300 hover:bg-white/[0.04]" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              )) : (
                <p className={`px-4 py-3 text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>No unit types found</p>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Specific Unit */}
        <div className="relative min-w-[180px] flex-1">
          <button
            type="button"
            onClick={() => {
              if (!selectedType) return;
              setOpenDropdown(openDropdown === "unit" ? null : "unit");
            }}
            disabled={!selectedType}
            className={`${btnBase} w-full ${!selectedType ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className={`truncate ${selected.length > 0 ? "" : (dk ? "text-gray-500" : "text-gray-400")}`}>
              {selected.length === 0
                ? (selectedType ? `Select ${selectedType.toLowerCase()}…` : "Select type first…")
                : multi
                  ? `${selected.length} selected`
                  : selected[0]
              }
            </span>
            <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${openDropdown === "unit" ? "rotate-180" : ""}`} />
          </button>
          {openDropdown === "unit" && selectedType && (
            <div className={`${dropBase} w-full`}>
              {unitsOfType.length > 0 ? unitsOfType.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleUnit(u)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                    selected.includes(u.label)
                      ? dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                      : dk ? "text-gray-300 hover:bg-white/[0.04]" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 opacity-40" />
                    {u.label}
                  </span>
                  {selected.includes(u.label) && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              )) : (
                <p className={`px-4 py-3 text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>No units of this type</p>
              )}
            </div>
          )}
        </div>

        {/* Clear button */}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => { onSelect([]); setSelectedType(""); }}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              dk ? "hover:bg-white/5 text-gray-500 hover:text-gray-300" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            }`}
            title="Clear filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selected chips (multi mode only) */}
      {multi && selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selected.map(name => (
            <span
              key={name}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
              }`}
            >
              {name}
              <button type="button" onClick={() => removeUnit(name)} className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Exported helper: given a selected unit name and the tree data,
 * returns all descendant unit names (for hierarchical filtering on the client side).
 */
export { collectDescendantNames, findNodeByLabel };
export type { AcademicNode };
