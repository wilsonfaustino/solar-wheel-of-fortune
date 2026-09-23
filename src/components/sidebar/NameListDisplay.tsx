import { memo } from 'react';
import type { Name } from '../../types/name';
import { isUnavailableToday } from '../../utils/name';
import { NameListItem } from './NameListItem';

interface NameListDisplayProps {
  names: Name[];
  onEdit: (nameId: string, newValue: string) => void;
  onDelete: (nameId: string) => void;
  onToggleExclude: (nameId: string) => void;
  onVolunteer: (nameId: string) => void;
  onToggleUnavailable: (nameId: string) => void;
}

function NameListDisplayComponent({
  names,
  onEdit,
  onDelete,
  onToggleExclude,
  onVolunteer,
  onToggleUnavailable,
}: Readonly<NameListDisplayProps>) {
  const activeNames = names.filter((n) => !n.isExcluded);
  const excludedNames = names.filter((n) => n.isExcluded);
  const unavailableCount = activeNames.filter((n) => isUnavailableToday(n)).length;
  const countSegments = [
    `${activeNames.length - unavailableCount} ACTIVE`,
    unavailableCount > 0 && `${unavailableCount} UNAVAILABLE`,
    excludedNames.length > 0 && `${excludedNames.length} EXCLUDED`,
  ].filter((segment): segment is string => Boolean(segment));

  if (names.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="font-mono text-sm mb-2 text-text/30">No names yet</div>
          <div className="font-mono text-xs text-text/20">Add names above to get started</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-themed">
      {/* Name Count Header */}
      <div className="px-4 py-3 sticky top-0 bg-black/90 border-b border-b-white/10">
        <div
          data-testid="name-count-header"
          className="flex flex-wrap gap-x-[1ch] text-xs font-mono tracking-wider text-text/50"
        >
          {countSegments.map((segment, index) => (
            <span key={segment} className="whitespace-nowrap">
              {index > 0 && '· '}
              {segment}
            </span>
          ))}
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
          onVolunteer={onVolunteer}
          onToggleUnavailable={onToggleUnavailable}
        />
      ))}

      {/* Excluded Names Section */}
      {excludedNames.length > 0 && (
        <>
          <div className="px-4 py-2 bg-white/5 border-t border-t-white/10">
            <div className="text-xs font-mono tracking-wider text-text/40">EXCLUDED</div>
          </div>
          {excludedNames.map((name) => (
            <NameListItem
              key={name.id}
              name={name}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleExclude={onToggleExclude}
              onVolunteer={onVolunteer}
              onToggleUnavailable={onToggleUnavailable}
            />
          ))}
        </>
      )}
    </div>
  );
}

export const NameListDisplay = memo(NameListDisplayComponent);
