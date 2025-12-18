import { Trash2 } from 'lucide-react';
import { memo } from 'react';
import type { SelectionRecord } from '../../types/name';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { Button } from '../ui/button';

interface HistoryItemProps {
  record: SelectionRecord;
  onDelete: (recordId: string) => void;
}

function HistoryItemComponent({ record, onDelete }: HistoryItemProps) {
  return (
    <div className="px-4 py-3 last:border-b-0 transition-colors group flex items-center justify-between border-b border-b-white/5 bg-transparent hover:bg-white/5">
      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm truncate text-text">{record.nameValue}</div>
        <div className="text-xs mt-1 text-text/40">{formatRelativeTime(record.timestamp)}</div>
      </div>

      <Button
        type="button"
        onClick={() => onDelete(record.id)}
        variant="tech-destructive"
        size="icon-sm"
        className="ml-2 shrink-0"
        aria-label={`Delete ${record.nameValue} from history`}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export const HistoryItem = memo(HistoryItemComponent);
