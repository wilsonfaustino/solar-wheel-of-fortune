import { memo } from 'react';
import type { Name } from '../../types/name';
import { NameListItem } from './NameListItem';

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
          <div
            className="font-mono text-sm mb-2"
            style={{ color: 'var(--color-text)', opacity: 0.3 }}
          >
            No names yet
          </div>
          <div className="font-mono text-xs" style={{ color: 'var(--color-text)', opacity: 0.2 }}>
            Add names above to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Name Count Header */}
      <div
        className="px-4 py-3 sticky top-0"
        style={{
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          borderBottomWidth: '1px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        }}
      >
        <div
          className="text-xs font-mono tracking-wider"
          style={{ color: 'var(--color-text)', opacity: 0.5 }}
        >
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
          <div
            className="px-4 py-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
              borderTopWidth: '1px',
            }}
          >
            <div
              className="text-xs font-mono tracking-wider"
              style={{ color: 'var(--color-text)', opacity: 0.4 }}
            >
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
