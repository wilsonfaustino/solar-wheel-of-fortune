import { Eraser, RotateCcw } from 'lucide-react';
import { memo } from 'react';

interface BulkActionsPanelProps {
  hasNames: boolean;
  hasSelections: boolean;
  onClearSelections: () => void;
  onResetList: () => void;
}

function BulkActionsPanelComponent({
  hasNames,
  hasSelections,
  onClearSelections,
  onResetList,
}: BulkActionsPanelProps) {
  const handleReset = () => {
    if (!hasNames) return;

    const confirmed = confirm(
      'Reset list? This will clear all selections and exclusions. Names will remain.'
    );
    if (confirmed) {
      onResetList();
    }
  };

  return (
    <div className="px-4 py-4 border-t border-white/10 flex gap-2">
      <button
        onClick={onClearSelections}
        disabled={!hasSelections}
        className="flex-1 px-3 py-2 border border-white/20
                   hover:bg-white/5 transition-colors
                   text-white/70 font-mono text-xs tracking-wider
                   disabled:opacity-30 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        title={hasSelections ? 'Clear selection history' : 'No selections to clear'}
      >
        <Eraser className="w-4 h-4" />
        CLEAR
      </button>
      <button
        onClick={handleReset}
        disabled={!hasNames}
        className="flex-1 px-3 py-2 border border-white/20
                   hover:bg-white/5 transition-colors
                   text-white/70 font-mono text-xs tracking-wider
                   disabled:opacity-30 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        title={hasNames ? 'Reset selections and exclusions' : 'No names to reset'}
      >
        <RotateCcw className="w-4 h-4" />
        RESET
      </button>
    </div>
  );
}

export const BulkActionsPanel = memo(BulkActionsPanelComponent);
