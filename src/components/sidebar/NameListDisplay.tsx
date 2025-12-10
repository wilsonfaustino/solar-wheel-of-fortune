import { memo } from "react";
import { NameListItem } from "./NameListItem";
import type { Name } from "../../types/name";

interface NameListDisplayProps {
  names: Name[];
  onEdit: (nameId: string, newValue: string) => void;
  onDelete: (nameId: string) => void;
  onToggleExclude: (nameId: string) => void;
}

function NameListDisplayComponent({
  names,
  onEdit,
  onDelete,
  onToggleExclude,
}: NameListDisplayProps) {
  const activeNames = names.filter((n) => !n.isExcluded);
  const excludedNames = names.filter((n) => n.isExcluded);

  if (names.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-white/30 font-mono text-sm mb-2">No names yet</div>
          <div className="text-white/20 font-mono text-xs">
            Add names above to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Name Count Header */}
      <div className="px-4 py-3 border-b border-white/10 sticky top-0 bg-black/90">
        <div className="text-xs text-white/50 font-mono tracking-wider">
          {activeNames.length} ACTIVE
          {excludedNames.length > 0 && ` · ${excludedNames.length} EXCLUDED`}
        </div>
      </div>

      {/* Active Names */}
      {activeNames.map((name) => (
        <NameListItem
          key={name.id}
          name={name}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleExclude={onToggleExclude}
        />
      ))}

      {/* Excluded Names Section */}
      {excludedNames.length > 0 && (
        <>
          <div className="px-4 py-2 bg-white/5 border-t border-white/10">
            <div className="text-xs text-white/40 font-mono tracking-wider">
              EXCLUDED
            </div>
          </div>
          {excludedNames.map((name) => (
            <NameListItem
              key={name.id}
              name={name}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleExclude={onToggleExclude}
            />
          ))}
        </>
      )}
    </div>
  );
}

export const NameListDisplay = memo(NameListDisplayComponent);
