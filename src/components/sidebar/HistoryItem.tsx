import { Trash2 } from 'lucide-react';
import { memo } from 'react';
import type { SelectionRecord } from '../../types/name';
import { formatRelativeTime } from '../../utils/formatRelativeTime';

interface HistoryItemProps {
  record: SelectionRecord;
  onDelete: (recordId: string) => void;
}

function HistoryItemComponent({ record, onDelete }: HistoryItemProps) {
  return (
    <div
      className="px-4 py-3 last:border-b-0 transition-colors group flex items-center justify-between"
      style={{
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        borderBottomWidth: '1px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm truncate" style={{ color: 'var(--color-text)' }}>
          {record.nameValue}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--color-text)', opacity: 0.4 }}>
          {formatRelativeTime(record.timestamp)}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(record.id)}
        className="ml-2 p-1.5 rounded transition-colors text-red-400/70 shrink-0"
        aria-label={`Delete ${record.nameValue} from history`}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export const HistoryItem = memo(HistoryItemComponent);
