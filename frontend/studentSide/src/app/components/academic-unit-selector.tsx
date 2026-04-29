import { useEffect, useMemo, useState } from "react";

type UnitNode = {
  id: string | number;
  label: string;
  children?: UnitNode[];
};

function findPath(nodes: UnitNode[], id: number, path: UnitNode[] = []): UnitNode[] {
  for (const node of nodes) {
    const nextPath = [...path, node];
    if (Number(node.id) === id) return nextPath;
    const childPath = findPath(node.children || [], id, nextPath);
    if (childPath.length) return childPath;
  }
  return [];
}

export function AcademicUnitSelector({
  tree,
  value,
  onChange,
  disabled = false,
}: {
  tree: UnitNode[];
  value: number;
  onChange: (id: number) => void;
  disabled?: boolean;
}) {
  const initialPath = useMemo(() => findPath(tree, value), [tree, value]);
  const [selectedPath, setSelectedPath] = useState<UnitNode[]>(initialPath);

  useEffect(() => {
    setSelectedPath(initialPath);
  }, [initialPath]);

  const levels = [];
  let currentNodes = tree;
  let level = 0;

  while (currentNodes.length > 0) {
    levels.push({ level, nodes: currentNodes, selected: selectedPath[level] });
    const selected = selectedPath[level];
    if (!selected) break;
    currentNodes = selected.children || [];
    level += 1;
  }

  const handleLevelChange = (levelIndex: number, rawId: string) => {
    const node = levels[levelIndex].nodes.find((item) => String(item.id) === rawId);
    const nextPath = node ? [...selectedPath.slice(0, levelIndex), node] : selectedPath.slice(0, levelIndex);
    setSelectedPath(nextPath);
    onChange(node && (!node.children || node.children.length === 0) ? Number(node.id) : 0);
  };

  return (
    <div className="space-y-5">
      {levels.map(({ level, nodes, selected }) => (
        <div key={level} className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">{level + 1}</span>
            {level === 0 ? "School / Field" : level === 1 ? "Branch / Department" : `Level ${level + 1}`}
          </label>
          <select
            disabled={disabled}
            value={selected ? String(selected.id) : ""}
            onChange={(event) => handleLevelChange(level, event.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white disabled:bg-gray-50"
          >
            <option value="" disabled>Select option</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>{node.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
