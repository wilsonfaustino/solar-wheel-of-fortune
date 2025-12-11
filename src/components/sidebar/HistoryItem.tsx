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
      className="px-4 py-3 border-b border-white/5 last:border-b-0
                 hover:bg-white/5 transition-colors group flex items-center justify-between"
    >
      <div className="flex-1 min-w-0">
        <div className="text-white font-mono text-sm truncate">{record.nameValue}</div>
        <div className="text-white/40 text-xs mt-1">{formatRelativeTime(record.timestamp)}</div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(record.id)}
        className="ml-2 p-1.5 hover:bg-white/10 rounded transition-colors text-red-400/70 shrink-0"
        aria-label={`Delete ${record.nameValue} from history`}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export const HistoryItem = memo(HistoryItemComponent);
